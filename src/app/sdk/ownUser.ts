import { DeviceId, UserId } from "@mtrnord/matrix-sdk-crypto-js";
import { IErrorResp, ILoginFlows, ILoginResponse, IWellKnown } from "./api/apiTypes";
import { MatrixClient, isRateLimitError } from "./client";
import { MatrixE2EE } from "./e2ee";
import { HostnameMissingError, HostnameMissingHTTPSError, LoginError, LoginFlowRequestError, LogoutError, NotLogeedInError, PasswordLoginNotSupportedError, PasswordMissingError, SDKError, SlidingSyncProxyNotFoundError, UsernameMissingError } from "./utils";

export class OwnUser {
    public access_token?: string;
    public device_id?: string;
    public mxid?: string;
    // Hostname including "https://"
    public hostname?: string;
    public slidingSyncHostname?: string;
    public e2ee: MatrixE2EE;

    constructor(private client: MatrixClient) {
        this.e2ee = new MatrixE2EE(this.client, this);
    }

    // TODO: call logout endpoint on logout
    public async logout(): Promise<void | SDKError> {
        if (!this.mxid) {
            return new NotLogeedInError();
        }
        if (!this.access_token) {
            return new NotLogeedInError();
        }
        if (!this.hostname) {
            return new HostnameMissingError();
        }
        const resp = await fetch(`${this.hostname}/_matrix/client/v3/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.access_token}`
            },
        });
        if (!resp.ok) {
            return new LogoutError(resp);
        }

        this.access_token = undefined;
        this.device_id = undefined;
        this.slidingSyncHostname = undefined;
    }



    public async setHostname(hostname: string): Promise<SDKError | void> {
        if (!hostname.startsWith("https://")) {
            return new HostnameMissingHTTPSError();
        }
        if (!this.client.database) {
            await this.client.createDatabase();
        }

        // Write to database
        const tx = this.client.database?.transaction('loginInfo', 'readwrite');
        await tx?.store.put({
            userId: this.mxid!,
            hostname: hostname,
            slidingSyncHostname: this.slidingSyncHostname,
            access_token: this.access_token,
            device_id: this.device_id,
        });
        await tx?.done

        // Set in memory
        this.hostname = hostname;
    }

    private async getLoginFlows(): Promise<ILoginFlows | SDKError> {
        if (!this.hostname) {
            return new HostnameMissingError();
        }
        const resp = await fetch(`${this.hostname}/_matrix/client/v3/login`);
        if (!resp.ok) {
            return new LoginFlowRequestError(resp);
        }
        const json = await resp.json() as ILoginFlows;
        return json;
    }

    private async getWellKnown(): Promise<IWellKnown | SDKError> {
        if (!this.hostname) {
            return new HostnameMissingError();
        }
        const resp = await fetch(`${this.hostname}/.well-known/matrix/client`);
        if (!resp.ok) {
            return new LoginFlowRequestError(resp);
        }
        const json = await resp.json() as IWellKnown;
        return json;
    }

    public async passwordLogin(username: string, password: string, triesLeft = 5): Promise<SDKError | void> {
        if (!this.client.database) {
            await this.client.createDatabase();
        }
        if (!username) {
            return new UsernameMissingError();
        }
        if (!password) {
            return new PasswordMissingError();
        }
        this.mxid = username;
        await this.setHostname(`https://${username.split(':')[1]}`);

        try {
            const well_known = await this.getWellKnown();
            if (well_known instanceof SDKError) {
                return well_known;
            }
            if (well_known["m.homeserver"]?.base_url) {
                await this.setHostname(well_known["m.homeserver"].base_url);
            }
            if (well_known["org.matrix.msc3575.proxy"]?.url) {
                // Write to database
                const tx = this.client.database?.transaction('loginInfo', 'readwrite');
                await tx?.store.put({
                    userId: this.mxid!,
                    hostname: this.hostname,
                    slidingSyncHostname: well_known["org.matrix.msc3575.proxy"].url,
                    access_token: this.access_token,
                    device_id: this.device_id,
                });
                await tx?.done

                // Set the sliding sync proxy
                this.slidingSyncHostname = well_known["org.matrix.msc3575.proxy"].url;
            } else {
                return new SlidingSyncProxyNotFoundError();
            }
        } catch (e: any) {
            console.warn(`No well-known found for ${this.hostname}:\n${e}`);
        }

        const loginFlows = await this.getLoginFlows();
        if (loginFlows instanceof SDKError) {
            return loginFlows;
        }
        if ((loginFlows.flows.filter((flow) => flow.type === 'm.login.password')?.length || 0) == 0) {
            return new PasswordLoginNotSupportedError();
        }

        const resp = await fetch(`${this.hostname}/_matrix/client/v3/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: "m.login.password",
                identifier: {
                    type: 'm.id.user',
                    user: username,
                },
                user: username,
                password: password
            })
        });
        if (!resp.ok) {
            return new LoginError(resp);
        }
        const json = await resp.json();
        if (isErrorResp(json)) {
            return new LoginError(undefined, json);
        }
        if (isRateLimitError(json)) {
            console.error(`Rate limited. Retrying in ${json.retry_after_ms}ms. ${triesLeft} tries left.`);
            await this.passwordLogin(username, password, triesLeft - 1);
        }
        if (isLoginResponse(json)) {
            // Write to database
            const tx = this.client.database?.transaction('loginInfo', 'readwrite');
            await tx?.store.put({
                userId: json.user_id!,
                hostname: this.hostname,
                slidingSyncHostname: this.slidingSyncHostname,
                access_token: json.access_token,
                device_id: json.device_id,
            });
            await tx?.done
            this.access_token = json.access_token;
            this.device_id = json.device_id;
            this.mxid = json.user_id;

            await this.e2ee.initOlmMachine(new UserId(this.mxid), new DeviceId(this.device_id));
        }
    }
}

function isLoginResponse(arg: any): arg is ILoginResponse {
    return arg.access_token !== undefined;
}

function isErrorResp(arg: any): arg is IErrorResp {
    return arg.errcode !== undefined;
}