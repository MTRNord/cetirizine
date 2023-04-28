export interface ILoginFlow {
    type: string;
}
export interface ILoginFlows {
    flows: ILoginFlow[];
}
export interface IRateLimitError {
    errcode: string;
    error?: string;
    retry_after_ms: number;
}

export interface ILoginResponse {
    access_token: string;
    device_id: string;
    home_server?: string;
    user_id: string;
    expires_in_ms?: number;
    refresh_token?: string;
    well_known?: IWellKnown
}

export interface ILoginParams {
    address?: string;
    device_id?: string;
    identifier?: {
        type: "m.id.user" | "m.id.thirdparty" | "m.id.phone";
        user?: string;
        medium?: string;
        address?: string;
        country?: string;
        phone?: string;
    };
    initial_device_display_name?: string;
    password?: string;
    user?: string;
    refresh_token?: string;
    token?: string;
    type: "m.login.password" | "m.login.token";
}

export interface IWellKnown {
    "m.homeserver": {
        base_url: string;
    }
    "m.identity_server"?: {
        base_url: string;
    }
}