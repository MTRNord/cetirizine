import { MatrixClient } from "./client";
import { ISlidingSyncReq, ISlidingSyncResp, isDeleteOp, isInsertOp, isInvalidateOp, isSyncOp } from './api/slidingSync';
import EventEmitter from "events";
import { Room } from "./room";
import { OwnUser } from "./ownUser";
import { DeviceLists, UserId } from "@mtrnord/matrix-sdk-crypto-js";
import { IRoomEvent, IRoomStateEvent, isRoomStateEvent } from "./api/events";

export interface MatrixSlidingSyncEvents {
    // Used to notify about changes to the room list
    'rooms': (rooms: Set<Room>) => void;
    //'delete': (changedCount: number) => void;
}

export declare interface MatrixSlidingSync {
    on<U extends keyof MatrixSlidingSyncEvents>(
        event: U, listener: MatrixSlidingSyncEvents[U]
    ): this;

    emit<U extends keyof MatrixSlidingSyncEvents>(
        event: U, ...args: Parameters<MatrixSlidingSyncEvents[U]>
    ): boolean;
}

export class MatrixSlidingSync extends EventEmitter {
    private syncing = false;
    private syncPos?: string;
    private initialSync = true;
    private lastRanges?: { [key: string]: number[][] };
    private lastTxnID?: string;
    private to_device_since?: string;
    public mustUpdateTxnID = true;
    public rooms: Set<Room> = new Set();
    private abortController = new AbortController();

    constructor(private client: MatrixClient, private user: OwnUser) { super() }

    public applyStoredSyncInfo(syncInfo: {
        userId: string;
        syncPos?: string;
        initialSync: boolean;
        lastRanges?: {
            [key: string]: number[][];
        };
        lastTxnID?: string;
        to_device_since?: string;
    }) {
        this.syncPos = syncInfo.syncPos;
        this.initialSync = syncInfo.initialSync;
        this.lastRanges = syncInfo.lastRanges;
        this.lastTxnID = syncInfo.lastTxnID;
        this.to_device_since = syncInfo.to_device_since;
    }

    public logout() {
        this.stopSync();
        this.abortController.abort();
        this.rooms = new Set();
        this.initialSync = true;
        this.syncPos = undefined;
        this.to_device_since = undefined;
    }

    public resetAbortController() {
        this.abortController = new AbortController();
    }

    public async startSync() {
        if (!this.client.isLoggedIn) {
            throw Error("Not logged in");
        }
        if (!this.client.database) {
            await this.client.createDatabase();
        }
        if (this.syncing) {
            return;
        }
        this.syncing = true;
        while (this.syncing) {
            try {
                await this.sync();
            } catch (e) {
                console.error(e);
            }
        }
    }

    public stopSync() {
        this.syncing = false;
    }

    private isIndexInRange(index: number, ranges: number[][]): boolean {
        for (const r of ranges) {
            if (r[0] < index && index <= r[1]) {
                return true
            }
        }
        return false
    }

    private shiftRight(listKey: string, ranges: number[][], hi: number, low: number) {
        //     l   h
        // 0,1,2,3,4 <- before
        // 0,1,2,2,3 <- after, hi is deleted and low is duplicated
        for (let i = hi - 1; i > low - 1; i--) {
            if (this.isIndexInRange(i, ranges)) {
                const roomObj = [...this.rooms].find(room => room.windowPos[listKey] === i + 1);
                if (roomObj) {
                    roomObj.windowPos[listKey] = (i);
                }
            }
        }
    }

    private shiftLeft(listKey: string, ranges: number[][], hi: number, low: number) {
        //     l   h
        // 0,1,2,3,4 <- before
        // 0,1,3,4,4 <- after, low is deleted and hi is duplicated
        for (let i = low + 1; i < hi + 1; i++) {
            if (this.isIndexInRange(i, ranges)) {
                const roomObj = [...this.rooms].find(room => room.windowPos[listKey] === i - 1);
                if (roomObj) {
                    roomObj.windowPos[listKey] = (i);
                }
            }
        }

    }

    private async removeEntry(listKey: string, ranges: number[][], index: number) {
        // work out the max index
        let max = -1;
        const indexes = [...this.rooms].map(room => room.windowPos[listKey]);
        for (const n in indexes) {
            if (Number(n) > max) {
                max = Number(n);
            }
        }
        // TODO: Unclear if this is needed or working. Probably wrong?
        // const roomObj = [...this.rooms].find(room => room.windowPos[listKey] === index);
        // if (roomObj) {
        //     const tx = this.database?.transaction('rooms', 'readwrite');
        //     await tx?.store.delete(roomObj.roomID);
        //     await tx?.done;
        //     this.rooms.delete(roomObj)
        // }
        if (max < 0 || index > max) {
            return;
        }
        // Everything higher than the gap needs to be shifted left.
        this.shiftLeft(listKey, ranges, max, index);
    }

    private addEntry(listKey: string, ranges: number[][], index: number): void {
        // work out the max index
        let max = -1;
        const indexes = [...this.rooms].map(room => room.windowPos[listKey]);
        for (const n in indexes) {
            if (Number(n) > max) {
                max = Number(n);
            }
        }
        if (max < 0 || index > max) {
            return;
        }
        // Everything higher than the gap needs to be shifted right, +1 so we don't delete the highest element
        this.shiftRight(listKey, ranges, max + 1, index);
    }

    private async sync() {
        if (!this.client.isLoggedIn) {
            throw Error("Not logged in");
        }
        if (!this.user.slidingSyncHostname) {
            throw Error("Hostname must be set first");
        }

        // TODO: This might cause future issues
        Promise.all([this.user.e2ee.sendIdentifyAndOneTimeKeys()]);

        // This is the initial sync case for each list
        let lists_ranges: {
            "overview": number[][];
            "spaces": number[][];
            [key: string]: number[][];
        } = {
            "overview": [[0, 20]],
            "spaces": [[0, 20]]
        };
        for (const space of this.client.spaceOpen) {
            if (space === "other") { continue }
            if (space === "dm") { continue }
            lists_ranges[space] = [[0, 20]];
        }

        let timeline_limit = 1;
        let subscription_limit = 10;
        if (!this.initialSync) {
            for (const list in lists_ranges) {
                // Set higher timeline limit for subsequent syncs
                timeline_limit = 10;
                subscription_limit = 50;
                // Calculate overlap between this.roomsInView and this.roomToRoomID and then
                // calculate the ranges for each list
                let rawRangeInView = new Set([...this.rooms]
                    .filter(room => this.client.roomsInView.includes(room.roomID))
                    .map(room => room.windowPos[list]).sort().filter(x => x !== undefined && x !== null))

                if (this.client.getSpaces().find(r => r.roomID === list)) {
                    // If we are syncing the spaces list, we need to use the spaceInView list instead
                    rawRangeInView = new Set([...this.rooms]
                        .filter(room => this.client.spacesInView.includes(room.roomID))
                        .map(room => room.windowPos[list]).sort().filter(x => x !== undefined && x !== null))
                }

                if (rawRangeInView.size !== 0) {
                    const minimum = Math.min(...rawRangeInView);
                    const maximum = Math.max(...rawRangeInView);

                    lists_ranges[list] = [[Math.max(minimum - 10, 0), maximum + 10]];
                }
            }
            lists_ranges["e2ee"] = lists_ranges["overview"];
        }


        if (this.lastRanges && Object.entries(lists_ranges).toString() !== Object.entries(this.lastRanges).toString()) {
            console.log("Ranges changed, resetting sync txn_id", lists_ranges)
            this.lastRanges = lists_ranges;
            this.lastTxnID = Date.now().toString();
        }

        if (!this.lastRanges) {
            this.lastRanges = lists_ranges;
            this.lastTxnID = Date.now().toString();
        }

        if (this.mustUpdateTxnID) {
            this.lastTxnID = Date.now().toString();
            this.mustUpdateTxnID = false;
        }


        let url = `${this.user.slidingSyncHostname}/_matrix/client/unstable/org.matrix.msc3575/sync?timeout=5000`;
        if (this.syncPos) {
            url = `${this.user.slidingSyncHostname}/_matrix/client/unstable/org.matrix.msc3575/sync?timeout=5000&pos=${this.syncPos}`
        }

        const body: ISlidingSyncReq = {
            // allows clients to know what request params reached the server,
            // functionally similar to txn IDs on /send for events.
            txn_id: this.lastTxnID,

            // a delta token to remember information between sessions.
            // See "Bandwidth optimisations for persistent clients" for more information.
            // TODO: This isnt implemented anywhere yet
            //delta_token: "opaque-server-provided-string",

            // Sliding Window API
            lists: {
                "spaces": {
                    ranges: this.lastRanges["spaces"],
                    // slow_get_all_rooms: true,
                    sort: ["by_name"],
                    required_state: [
                        // needed to build sections
                        ["m.space.child", "*"],
                        ["m.space.parent", "*"],
                        ["m.room.create", ""],
                        ["m.room.tombstone", ""],
                        // Room Avatar
                        ["m.room.avatar", "*"],
                        // Room Topic
                        ["m.room.topic", "*"],
                        // Request only the m.room.member events required to render events in the timeline.
                        // The "$LAZY" value is a special sentinel value meaning "lazy loading" and is only valid for
                        // the "m.room.member" event type. For more information on the semantics, see "Lazy-Loading Room Members".
                        ["m.room.member", "$LAZY"],
                        // E2EE
                        ["m.room.encryption", ""],
                        ["m.room.history_visibility", ""],
                    ],
                    timeline_limit: 0,
                    filters: {
                        room_types: ["m.space"]
                    }
                },
                "overview": {
                    ranges: this.lastRanges["overview"],
                    sort: ["by_notification_level", "by_recency", "by_name"],
                    required_state: [
                        // needed to build sections
                        ["m.space.child", "*"],
                        ["m.space.parent", "*"],
                        ["m.room.create", ""],
                        ["m.room.tombstone", ""],
                        // Room Avatar
                        ["m.room.avatar", "*"],
                        // Room Topic
                        ["m.room.topic", "*"],
                        // Request only the m.room.member events required to render events in the timeline.
                        // The "$LAZY" value is a special sentinel value meaning "lazy loading" and is only valid for
                        // the "m.room.member" event type. For more information on the semantics, see "Lazy-Loading Room Members".
                        ["m.room.member", "$LAZY"],
                        // E2EE
                        ["m.room.encryption", ""],
                        ["m.room.history_visibility", ""],
                    ],
                    timeline_limit: timeline_limit,
                    filters: {
                        not_room_types: ["m.space"],
                    }
                },
                "e2ee": {
                    ranges: this.lastRanges["overview"],
                    sort: ["by_notification_level", "by_recency", "by_name"],
                    required_state: [
                        // needed to build sections
                        ["m.space.child", "*"],
                        ["m.space.parent", "*"],
                        ["m.room.create", ""],
                        ["m.room.tombstone", ""],
                        // Room Avatar
                        ["m.room.avatar", "*"],
                        // Room Topic
                        ["m.room.topic", "*"],
                        ["m.room.member", "*"],
                        // E2EE
                        ["m.room.encryption", ""],
                        ["m.room.history_visibility", ""],
                    ],
                    timeline_limit: timeline_limit,
                    filters: {
                        not_room_types: ["m.space"],
                        is_encrypted: true,
                    }
                },
            },
            bump_event_types: ["m.room.message", "m.room.encrypted"],

            extensions: {
                e2ee: {
                    enabled: true,
                },
                to_device: {
                    enabled: true,
                    since: this.to_device_since
                },
                typing: {
                    enabled: true,
                    lists: ["overview", "e2ee"],
                },
                receipts: {
                    enabled: true,
                    lists: ["overview", "e2ee"],
                }
            },
        };

        for (const space of this.client.spaceOpen) {
            if (space === "other") { continue }
            if (space === "dm") { continue }
            if (!body.lists) {
                body.lists = {};
            }
            body.lists[space] = {
                slow_get_all_rooms: true,
                ranges: this.lastRanges[space],
                sort: ["by_notification_level", "by_recency", "by_name"],
                required_state: [
                    // needed to build sections
                    ["m.space.child", "*"],
                    ["m.space.parent", "*"],
                    ["m.room.create", ""],
                    ["m.room.tombstone", ""],
                    // Room Avatar
                    ["m.room.avatar", "*"],
                    // Room Topic
                    ["m.room.topic", "*"],
                    // Request only the m.room.member events required to render events in the timeline.
                    // The "$LAZY" value is a special sentinel value meaning "lazy loading" and is only valid for
                    // the "m.room.member" event type. For more information on the semantics, see "Lazy-Loading Room Members".
                    ["m.room.member", "$LAZY"],
                    // E2EE
                    ["m.room.encryption", ""],
                    ["m.room.history_visibility", ""],
                ],
                timeline_limit: timeline_limit,
                filters: {
                    "spaces": [space]
                }
            }
        }

        if (this.client.currentRoom) {
            body.room_subscriptions = {};
            body.room_subscriptions[this.client.currentRoom] = {
                sort: ["by_notification_level", "by_recency", "by_name"],
                required_state: [
                    // needed to build sections
                    ["m.space.child", "*"],
                    ["m.space.parent", "*"],
                    ["m.room.create", ""],
                    ["m.room.tombstone", ""],
                    // Room Avatar
                    ["m.room.avatar", "*"],
                    // Room Topic
                    ["m.room.topic", "*"],
                    // Request only the m.room.member events required to render events in the timeline.
                    // The "$LAZY" value is a special sentinel value meaning "lazy loading" and is only valid for
                    // the "m.room.member" event type. For more information on the semantics, see "Lazy-Loading Room Members".
                    ["m.room.member", "$LAZY"],
                    // E2EE
                    ["m.room.encryption", ""],
                    ["m.room.history_visibility", ""],
                ],
                timeline_limit: subscription_limit,
                filters: {}
            }
        }

        const resp = await fetch(url, {
            method: "POST",
            signal: this.abortController.signal,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.user.access_token}`
            },
            body: JSON.stringify(body)
        });
        if (!resp.ok) {
            if (resp.status === 400) {
                if ((await resp.json()).errcode === "M_UNKNOWN_POS") {
                    this.syncPos = undefined;
                    const syncInfoTX = this.client.database?.transaction('syncInfo', 'readwrite');
                    await syncInfoTX?.store.put({
                        userId: this.user.mxid!,
                        syncPos: this.syncPos,
                        initialSync: this.initialSync,
                        lastRanges: this.lastRanges,
                        lastTxnID: this.lastTxnID,
                    });
                    await syncInfoTX?.done;
                }
                return;
            } else if (resp.status === 401) {
                await this.logout();
                console.error(resp);
                console.error("Error syncing. See console for error.");
            }
        }
        const json = await resp.json() as ISlidingSyncResp;
        this.syncPos = json.pos;

        if (json.extensions?.to_device) {
            await this.user.e2ee.receiveSyncData(
                JSON.stringify(json.extensions.to_device.events || []),
                new DeviceLists(
                    json.extensions.e2ee?.device_lists?.changed?.map(
                        user_id => new UserId(user_id)
                    ),
                    json.extensions.e2ee?.device_lists?.left?.map(
                        user_id => new UserId(user_id)
                    )
                ),
                new Map(Object.entries(json.extensions.e2ee?.device_one_time_keys_count || [])),
                new Set(json.extensions.e2ee?.device_unused_fallback_key_types)
            )
            this.to_device_since = json.extensions.to_device.next_batch;
        }

        await this.user.e2ee.sendIdentifyAndOneTimeKeys();


        const syncInfoTX = this.client.database?.transaction('syncInfo', 'readwrite');
        await syncInfoTX?.store.put({
            userId: this.user.mxid!,
            syncPos: this.syncPos,
            initialSync: this.initialSync,
            lastRanges: this.lastRanges,
            lastTxnID: this.lastTxnID,
            to_device_since: this.to_device_since,
        });
        await syncInfoTX?.done;

        let gapIndex = -1;
        for (const listKey in json.lists) {
            const list = json.lists[listKey];
            if (list.ops) {
                for (const op of list.ops) {
                    if (isSyncOp(op)) {
                        const tx = this.client.database?.transaction('rooms', 'readwrite');
                        for (let i = op.range[0]; i <= op.range[1]; i++) {
                            const roomID = op.room_ids[i - op.range[0]];
                            if (!roomID) {
                                break; // we are at the end of list
                            }

                            // Check if we already know this room and skip if we do. This is needed since we have 2 lists.
                            // The db would already do this but the obj list doesn't (even though its a Set. Thats a mystery yet to solve)
                            const roomObj = [...this.rooms].find(room => room.roomID === roomID);
                            if (roomObj) {
                                roomObj.windowPos[listKey] = i;
                                continue;
                            }

                            const newRoom = new Room(roomID, this.user.hostname!, this.client, this.user.e2ee);
                            // We start to remember the Room now.
                            newRoom.setName(roomID);
                            newRoom.windowPos[listKey] = i;

                            this.rooms.add(newRoom);
                            await tx?.store.put({
                                windowPos: newRoom.windowPos,
                                roomID: newRoom.roomID,
                                name: newRoom.getName(),
                                notification_count: newRoom.getNotificationCount(),
                                highlight_count: newRoom.getNotificationHighlightCount(),
                                joined_count: newRoom.getJoinedCount(),
                                invited_count: newRoom.getInvitedCount(),
                                avatarUrl: newRoom.getAvatarURL(),
                                isSpace: newRoom.isSpace(),
                                isDM: newRoom.isDM(),
                                stateEvents: newRoom.getStateEvents(),
                                events: newRoom.getEvents(),
                            });
                        }
                        await tx?.done;
                    } else if (isInsertOp(op)) {
                        console.log("Got INSERT OP", op);
                        const roomObj = [...this.rooms].find(room => room.windowPos[listKey] === op.index);
                        if (roomObj) {
                            if (gapIndex < 0) {
                                // we haven't been told where to shift from, so make way for a new room entry.
                                this.addEntry(listKey, this.lastRanges[listKey], op.index);
                            } else if (gapIndex > op.index) {
                                // the gap is further down the list, shift every element to the right
                                // starting at the gap so we can just shift each element in turn:
                                // [A,B,C,_] gapIndex=3, op.index=0
                                // [A,B,C,C] i=3
                                // [A,B,B,C] i=2
                                // [A,A,B,C] i=1
                                // Terminate. We'll assign into op.index next.
                                this.shiftRight(listKey, this.lastRanges[listKey], gapIndex, op.index);
                            } else if (gapIndex < op.index) {
                                // the gap is further up the list, shift every element to the left
                                // starting at the gap so we can just shift each element in turn
                                this.shiftLeft(listKey, this.lastRanges[listKey], op.index, gapIndex);
                            }
                        }
                        gapIndex = -1;
                        const tx = this.client.database?.transaction('rooms', 'readwrite');
                        // We start to remember the Room now.
                        const foundRoom = [...this.rooms].find(room => room.roomID === op.room_id);
                        if (foundRoom) {
                            foundRoom.windowPos[listKey] = op.index;
                            await tx?.store.put({
                                windowPos: foundRoom.windowPos,
                                roomID: foundRoom.roomID,
                                name: foundRoom.getName(),
                                notification_count: foundRoom.getNotificationCount(),
                                highlight_count: foundRoom.getNotificationHighlightCount(),
                                joined_count: foundRoom.getJoinedCount(),
                                invited_count: foundRoom.getInvitedCount(),
                                avatarUrl: foundRoom.getAvatarURL(),
                                isSpace: foundRoom.isSpace(),
                                isDM: foundRoom.isDM(),
                                stateEvents: foundRoom.getStateEvents(),
                                events: foundRoom.getEvents(),
                            });
                        } else {
                            const roomFromDB = await tx?.store.get(op.room_id);
                            let newRoom = new Room(op.room_id, this.user.hostname!, this.client, this.user.e2ee);
                            newRoom.setName(op.room_id);
                            newRoom.windowPos[listKey] = op.index;
                            if (roomFromDB) {
                                console.warn("Room in db but not in obj list.", op.room_id, "Updating obj list.");
                                newRoom = new Room(op.room_id, this.user.hostname!, this.client, this.user.e2ee)
                                newRoom.setName(roomFromDB.name);
                                newRoom.setNotificationCount(roomFromDB.notification_count);
                                newRoom.setNotificationHighlightCount(roomFromDB.highlight_count);
                                newRoom.setJoinedCount(roomFromDB.joined_count);
                                newRoom.setInvitedCount(roomFromDB.invited_count);
                                newRoom.setDM(roomFromDB.isDM || false);
                            }
                            this.rooms.add(newRoom);
                            await tx?.store.put({
                                windowPos: newRoom.windowPos,
                                roomID: newRoom.roomID,
                                name: newRoom.getName(),
                                notification_count: newRoom.getNotificationCount(),
                                highlight_count: newRoom.getNotificationHighlightCount(),
                                joined_count: newRoom.getJoinedCount(),
                                invited_count: newRoom.getInvitedCount(),
                                avatarUrl: newRoom.getAvatarURL(),
                                isSpace: newRoom.isSpace(),
                                isDM: newRoom.isDM(),
                                stateEvents: newRoom.getStateEvents(),
                                events: newRoom.getEvents(),
                            });
                        }

                        const roomIDs2 = [...this.rooms].map(room => room.roomID);
                        // Check if we generated any duplicates and log them.
                        const duplicates = roomIDs2.filter((item, index) => roomIDs2.indexOf(item) != index);
                        if (duplicates.length > 0) {
                            console.error("Duplicates found", duplicates);
                        }
                        await tx?.done;
                    } else if (isDeleteOp(op)) {
                        console.log("Got DELETE OP", op);

                        if (gapIndex !== -1) {
                            // we already have a DELETE operation to process, so process it.
                            await this.removeEntry(listKey, this.lastRanges[listKey], gapIndex);
                        }
                        gapIndex = op.index;
                    } else if (isInvalidateOp(op)) {
                        // TODO: Figure out if this is needed in reality
                        // const tx = this.database?.transaction('rooms', 'readwrite');
                        // for (let i = op.range[0]; i <= op.range[1]; i++) {
                        //     // We shall first forget about these and "startover"
                        //     const roomObj = [...this.rooms].find(room => room.windowPos[listKey] === i);
                        //     if (roomObj) {
                        //         await tx?.store.delete(roomObj.roomID);
                        //         this.rooms.delete(roomObj)
                        //     }
                        // }
                        // await tx?.done;
                    }
                }
                if (gapIndex !== -1) {
                    // we already have a DELETE operation to process, so process it
                    // Everything higher than the gap needs to be shifted left.
                    await this.removeEntry(listKey, this.lastRanges[listKey], gapIndex);
                }
            }
        }
        for (const roomID in json.rooms) {
            const room = json.rooms[roomID];
            const name = room.name;
            const notification_count = room.notification_count;
            const notification_highlight_count = room.highlight_count;
            const joined_count = room.joined_count;
            const invited_count = room.invited_count;
            const events = room.timeline;
            const state_events = events?.filter(event => isRoomStateEvent(event)).map(event => event as IRoomStateEvent);
            const normal_events = events?.filter(event => !isRoomStateEvent(event)).map(event => event as IRoomEvent);
            const required_state = room.required_state;
            const is_dm = room.is_dm;

            let roomObj = [...this.rooms].find(room => room.roomID === roomID);
            if (!roomObj) {
                // Warn, check in the db and if that fails, create a new one.
                console.warn("Could not find roomObj for roomID:", roomID);

                const tx = this.client.database?.transaction('rooms', 'readwrite');
                const roomFromDB = await tx?.store.get(roomID);
                await tx?.done;

                if (roomFromDB) {
                    console.warn("Room in db but not in obj list.", roomID, "Updating obj list.");

                    roomObj = new Room(roomID, this.user.hostname!, this.client, this.user.e2ee);
                    roomObj.setName(roomFromDB.name);
                    roomObj.setNotificationCount(roomFromDB.notification_count);
                    roomObj.setNotificationHighlightCount(roomFromDB.highlight_count);
                    roomObj.setJoinedCount(roomFromDB.joined_count);
                    roomObj.setInvitedCount(roomFromDB.invited_count);
                    roomObj.setDM(roomFromDB.isDM || false);
                    if (roomFromDB.events) {
                        roomObj.addEvents(roomFromDB.events);
                    }
                    if (roomFromDB.stateEvents) {
                        roomObj.addStateEvents(roomFromDB.stateEvents);
                    }
                    roomObj.windowPos = roomFromDB.windowPos;
                } else {
                    console.warn("Could not find room in db. Creating new one.");
                    roomObj = new Room(roomID, this.user.hostname!, this.client, this.user.e2ee);
                    this.rooms.add(roomObj);
                }
            }

            if (name) {
                roomObj.setName(name);
            }
            roomObj.setNotificationCount(notification_count);
            roomObj.setNotificationHighlightCount(notification_highlight_count);
            roomObj.setJoinedCount(joined_count);
            roomObj.setInvitedCount(invited_count);
            if (normal_events) {
                roomObj.addEvents(normal_events);
            }
            if (required_state) {
                roomObj.addStateEvents(required_state);
            }
            if (state_events) {
                roomObj.addStateEvents(state_events);
            }
            if (required_state || state_events) {
                if (roomObj.isEncrypted() && roomObj.isJoined()) {
                    const joinEvents = [...(required_state || []), ...(state_events || [])]
                        .filter(event => event.type === "m.room.member" && event.content.membership === "join");
                    const memberIds = joinEvents.map(event => new UserId(event.state_key));
                    await this.user.e2ee.updateTrackedUsers(memberIds);
                }
            }
            if (is_dm) {
                roomObj.setDM(is_dm);
            }


            const tx = this.client.database?.transaction('rooms', 'readwrite');
            // Write to database
            await tx?.store.put({
                windowPos: roomObj.windowPos,
                roomID: roomObj.roomID,
                name: roomObj.getName(),
                notification_count: roomObj.getNotificationCount(),
                highlight_count: roomObj.getNotificationHighlightCount(),
                joined_count: roomObj.getJoinedCount(),
                invited_count: roomObj.getInvitedCount(),
                events: roomObj.getPureEvents(),
                stateEvents: roomObj.getStateEvents(),
                avatarUrl: roomObj.getAvatarURL(),
                isSpace: roomObj.isSpace(),
                isDM: roomObj.isDM(),
            });
            await tx?.done
        }

        if (this.initialSync) {
            this.initialSync = false;
            console.log("initialSyncComplete");
        }
        if (json.rooms && Object.keys(json.rooms).length > 0) {
            this.emit("rooms", this.rooms);
        }
    }
}