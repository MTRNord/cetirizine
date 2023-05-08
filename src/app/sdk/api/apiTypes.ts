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
export interface ISlidingSyncReq {
    txn_id?: string;
    lists?: {
        [key: string]: {
            ranges?: number[][];
            slow_get_all_rooms?: boolean;
            sort?: string[];
            required_state?: string[][];
            timeline_limit?: number;
            filters?: {
                [key: string]: any;
            };
        };
    }
    bump_event_types?: string[];
    extensions?: {
        [key: string]: any;
    };
    room_subscriptions?: {
        [key: string]: {
            sort?: string[];
            required_state?: string[][];
            timeline_limit?: number;
            filters?: {
                [key: string]: any;
            };
        };
    };
};


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

export interface Extensions {
    e2ee?: E2EEExtension;
    to_device?: ToDeviceExtension;
}

export interface E2EEExtension {
    device_one_time_keys_count?: {
        [key: string]: number;
    };
    device_lists?: {
        changed?: string[];
        left?: string[];
    };
    device_unused_fallback_key_types?: string[];
}

export interface ToDeviceExtension {
    next_batch: string;
    events?: any[];
}

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
    is_dm?: boolean,
}

export interface IRoomEvent<Content = any> {
    content: Content;
    event_id: string;
    origin_server_ts: number;
    sender: string;
    type: string;
    unsigned?: any;
    "m.relates.to"?: any;
    [key: string]: any;
}

export interface IRoomMessageContent<MsgType = any> {
    body: string;
    msgtype: MsgType;
}

export interface IRoomMessageTextContent extends IRoomMessageContent<"m.text"> {
    format?: string;
    formatted_body?: string;
}

export interface IRoomMessageImageContent extends IRoomMessageContent<"m.image"> {
    info?: IImageInfo;
    url?: string;
    file?: IEncryptedFile;
}

export interface IRoomMessageAudioContent extends IRoomMessageContent<"m.audio"> {
    info?: IAudioInfo;
    url?: string;
    file?: IEncryptedFile;
}

export interface IRoomMessageEvent<Content = any> extends IRoomEvent<Content> { }

export interface IRoomMessageTextEvent extends IRoomMessageEvent<IRoomMessageTextContent> { }

export function isRoomMessageTextEvent(event: IRoomEvent): event is IRoomMessageTextEvent {
    return event.type === "m.room.message" && event.content.msgtype === "m.text";
}

export interface IRoomMessageNoticeEvent extends IRoomMessageEvent<IRoomMessageTextContent> { }

export function isRoomMessageNoticeEvent(event: IRoomEvent): event is IRoomMessageNoticeEvent {
    return event.type === "m.room.message" && event.content.msgtype === "m.notice";
}

export function isRoomMessageImageEvent(event: IRoomEvent): event is IRoomMessageEvent<IRoomMessageImageContent> {
    return event.type === "m.room.message" && event.content.msgtype === "m.image";
}

export function isRoomMessageAudioEvent(event: IRoomEvent): event is IRoomMessageEvent<IRoomMessageAudioContent> {
    return event.type === "m.room.message" && event.content.msgtype === "m.audio";
}

export function isRoomMessageEvent(event: IRoomEvent): event is IRoomMessageEvent {
    return event.type === "m.room.message";
}

export interface IRoomStateEvent<Content = any> extends IRoomEvent<Content> {
    state_key: string;
}

export function isRoomStateEvent(event: IRoomEvent): event is IRoomStateEvent {
    return event.state_key !== undefined;
}

export interface IRoomMemberContent {
    avatar_url?: string;
    displayname?: string;
    membership: "invite" | "join" | "knock" | "leave" | "ban";
    is_direct?: boolean;
    reason?: string;
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

export interface IEncryptedFile {
    v: string;
    key: {
        alg: string;
        ext: boolean;
        k: string;
        key_ops: string[];
        kty: string;
    };
    iv: string;
    hashes: {
        [key: string]: string;
    };
    url: string;
}

export interface IImageInfo {
    h: number;
    mimetype: string;
    size: number;
    thumbnail_info?: IThumbnailInfo;
    thumbnail_url?: string;
    thumbnail_file?: IEncryptedFile;
    w: number;
}

export interface IAudioInfo {
    duration?: number;
    mimetype?: string;
    size?: number;
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

export interface IRoomTopicContent {
    topic: string;
}

export interface IRoomTopicEvent extends IRoomStateEvent<IRoomTopicContent> { }

export function isRoomTopicEvent(event: IRoomEvent): event is IRoomTopicEvent {
    return event.type === "m.room.topic";
}
