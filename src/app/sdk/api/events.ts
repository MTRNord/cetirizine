
export interface IRoomEvent<Content = any> {
    content: Content;
    event_id: string;
    origin_server_ts: number;
    sender: string;
    type: string;
    unsigned?: {
        transaction_id?: string;
        age?: number;
        [key: string]: any;
    };
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

export interface IRoomMessageVideoContent extends IRoomMessageContent<"m.video"> {
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

export function isRoomMessageVideoEvent(event: IRoomEvent): event is IRoomMessageEvent<IRoomMessageVideoContent> {
    return event.type === "m.room.message" && event.content.msgtype === "m.video";
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