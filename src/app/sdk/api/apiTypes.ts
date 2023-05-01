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

// Old sync
export interface ISyncResponse {
    account_data?: IAccountData;
    device_lists?: {
        changed?: string[];
        left?: string[];
    };
    device_one_time_keys_count?: {
        [key: string]: number;
    };
    next_batch: string;
    presence?: {
        events?: any[];
    };
    rooms?: {
        invite?: {
            [key: string]: {
                invite_state?: {
                    events?: {
                        content: any;
                        sender: string;
                        state_key: string;
                        type: string;
                        // Future proofing
                        [key: string]: any;
                    }[];
                };
            };
        };
        join?: {
            [key: string]: {
                account_data?: IAccountData;
                ephemeral?: {
                    events?: any[];
                };
                state?: {
                    events: IClientEventWithoutRoomId[];
                }
                summary?: {
                    "m.heroes": string[];
                    "m.joined_member_count": number;
                    "m.invited_member_count": number;
                };
                timeline?: ITimeline;
                unread_notifications?: {
                    highlight_count: number;
                    notification_count: number;
                };
                unread_thread_notifications?: {
                    [key: string]: {
                        highlight_count: number;
                        notification_count: number;
                    };
                };
            };
        };
        leave?: {
            [key: string]: {
                state?: {
                    events: IClientEventWithoutRoomId[];
                };
                account_data?: IAccountData;
                timeline?: ITimeline;
            };
        };
        knock?: {
            [key: string]: {
                knock_state?: {
                    events?: {
                        content: any;
                        sender: string;
                        state_key: string;
                        type: string;
                    }[];
                };
            };
        };
    };
    to_device?: {
        events?: any[];
    };
}

// Sliding sync
export interface ISlidingSyncResp {
    lists?: {
        [key: string]: List;
    };
    rooms?: {
        [key: string]: RoomJson;
    };
    extensions?: Extensions;
    pos: string;
    txn_id: string;
}

export interface Extensions { }

export interface List {
    ops?: (SYNC_OP | INSERT_OP | INVALIDATE_OP | DELETE_OP)[];
    count: number;
}

export function isSyncOp(op: any): op is SYNC_OP {
    return op.op === "SYNC";
}

export function isInsertOp(op: any): op is INSERT_OP {
    return op.op === "INSERT";
}

export function isInvalidateOp(op: any): op is INVALIDATE_OP {
    return op.op === "INVALIDATE";
}

export function isDeleteOp(op: any): op is DELETE_OP {
    return op.op === "DELETE";
}

export interface DELETE_OP {
    op: string;
    index: number;
}

export interface INVALIDATE_OP {
    op: string;
    range: number[];
}

export interface INSERT_OP {
    op: string;
    index: number;
    room_id: string;
}

export interface SYNC_OP {
    op: string;
    range: number[];
    room_ids: string[];
}

export interface RoomJson {
    name: string,
    // List of events
    timeline: any[],
    notification_count: number,
    highlight_count: number,
    initial: boolean,
    joined_count: number,
    invited_count: number,
    prev_batch: string,
}