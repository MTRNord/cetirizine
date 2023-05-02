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
    name?: string,
    // List of events
    timeline?: IRoomEvent[],
    required_state?: IRoomStateEvent[],
    notification_count: number,
    highlight_count: number,
    initial: boolean,
    joined_count: number,
    invited_count: number,
    prev_batch: string,
}

export interface IRoomEvent<Content = any> {
    content: Content;
    event_id: string;
    origin_server_ts: number;
    sender: string;
    type: string;
    unsigned?: any;
}

export interface IRoomStateEvent<Content = any> extends IRoomEvent<Content> {
    state_key: string;
}

export interface IRoomMemberContent {
    avatar_url?: string;
    displayname?: string;
    membership: "invite" | "join" | "knock" | "leave" | "ban";
    is_direct?: boolean;
}

export interface IRoomMemberEvent extends IRoomStateEvent<IRoomMemberContent> { }

export function isRoomMemberEvent(event: IRoomEvent): event is IRoomMemberEvent {
    return event.type === "m.room.member";
}

export interface IRoomCreateContent {
    creator: string;
    "m.federate"?: boolean;
    predecessor?: {
        room_id: string;
        event_id: string;
    };
    room_version?: string;
    type?: string;
}

export interface IRoomCreateEvent extends IRoomStateEvent<IRoomCreateContent> { }

export function isRoomCreateEvent(event: IRoomEvent): event is IRoomCreateEvent {
    return event.type === "m.room.create";
}

export interface IThumbnailInfo {
    h: number;
    mimetype: string;
    size: number;
    w: number;
}

export interface IImageInfo {
    h: number;
    mimetype: string;
    size: number;
    thumbnail_info?: IThumbnailInfo;
    thumbnail_url?: string;
    w: number;
}

export interface IRoomAvatarContent {
    info: IImageInfo;
    url?: string;
}

export interface IRoomAvatarEvent extends IRoomStateEvent<IRoomAvatarContent> { }

export function isRoomAvatarEvent(event: IRoomEvent): event is IRoomAvatarEvent {
    return event.type === "m.room.avatar";
}

export interface ISpaceChildContent {
    via: string[];
    order?: string;
    suggested?: boolean;
}

export interface ISpaceChildEvent extends IRoomStateEvent<ISpaceChildContent> { }

export function isSpaceChildEvent(event: IRoomEvent): event is ISpaceChildEvent {
    return event.type === "m.space.child";
}

export interface ISpaceParentContent {
    via: string[];
    canonical?: boolean;
}

export interface ISpaceParentEvent extends IRoomStateEvent<ISpaceParentContent> { }

export function isSpaceParentEvent(event: IRoomEvent): event is ISpaceParentEvent {
    return event.type === "m.space.parent";
}