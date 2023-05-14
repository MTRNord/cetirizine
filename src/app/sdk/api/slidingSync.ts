import { IRoomEvent, IRoomStateEvent } from "./events";

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
}


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