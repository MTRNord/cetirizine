export interface ILoginFlow {
    type: string;
}
export interface ILoginFlows {
    flows: ILoginFlow[];
}

export interface IErrorResp {
    errcode: string;
    error?: string;
}

export interface IRateLimitError extends IErrorResp {
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
    "org.matrix.msc3575.proxy"?: {
        url: string;
    }
}

export interface IAccountData {
    events?: any[];
}

export interface IClientEventWithoutRoomId {
    content: any;
    event_id: string;
    origin_server_ts: number;
    sender: string;
    // FIXME: Is this really meant to be optional?
    state_key?: string;
    type: string;
    unsigned?: {
        age?: number;
        prev_content?: any;
        redacted_because?: IClientEventWithoutRoomId;
        transaction_id?: string;
    }
}

export interface ITimeline {
    events: IClientEventWithoutRoomId[];
    limited: boolean;
    prev_batch: string;
}

export interface IProfileInfo {
    avatar_url?: string;
    displayname?: string;
}

// Sliding sync
