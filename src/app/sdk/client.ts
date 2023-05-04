import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import {
    IErrorResp,
    ILoginFlows,
    ILoginResponse,
    IProfileInfo,
    IRateLimitError,
    IRoomEvent,
    IRoomStateEvent,
    ISlidingSyncResp,
    IWellKnown,
    isDeleteOp,
    isInsertOp,
    isInvalidateOp,
    isRoomStateEvent,
    isSyncOp
} from "./api/apiTypes";
import { Room } from "./room";
import EventEmitter from "events";
import {
    DBSchema,
    IDBPDatabase,
    openDB
} from "idb";

export interface MatrixClientEvents {
    // Used to notify about changes to the room list
    'rooms': (rooms: Set<Room>) => void;
    //'delete': (changedCount: number) => void;
}

export declare interface MatrixClient {
    on<U extends keyof MatrixClientEvents>(
        event: U, listener: MatrixClientEvents[U]
    ): this;

    emit<U extends keyof MatrixClientEvents>(
        event: U, ...args: Parameters<MatrixClientEvents[U]>
    ): boolean;
}

interface MatrixDB extends DBSchema {
    rooms: {
        // Same as roomToRoom map
        key: string;
        value: {
            windowPos: {
                [list: string]: number;
            };
            roomID: string;
            name: string;
            notification_count: number;
            highlight_count: number;
            joined_count: number;
            invited_count: number;
            events?: IRoomEvent[];
            stateEvents?: IRoomStateEvent[];
            avatarUrl?: string;
            isSpace: boolean;
            isDM?: boolean;
        };
    };
    loginInfo: {
        // login info
        value: {
            userId: string;
            device_id?: string;
            hostname?: string;
            slidingSyncHostname?: string;
            access_token?: string;
            displayName?: string;
            avatarUrl?: string;
        };
        // User ID
        key: string;
    };
    syncInfo: {
        // sync info
        value: {
            userId: string;
            syncPos?: string;
            initialSync: boolean;
            lastRanges?: { [key: string]: number[][] }; // [start, end]
            lastTxnID?: string;
        };
        // User ID
        key: string;
    }
}

export class MatrixClient extends EventEmitter {
    private static _instance: MatrixClient;
    private access_token?: string;
    private device_id?: string;
    public mxid?: string;
    // Hostname including "https://"
    private hostname?: string;
    private slidingSyncHostname?: string;
    private syncing = false;
    private roomsInView: string[] = [];
    // TODO: Use to filter rooms by spaces visible. Eventually even make lists per space dynamically and use that to filter
    private spaceOpen: string[] = [];
    private rooms: Set<Room> = new Set();
    private syncPos?: string;
    private initialSync = true;
    private database?: IDBPDatabase<MatrixDB>;
    private profileInfo?: IProfileInfo;
    private lastRanges?: { [key: string]: number[][] };
    private lastTxnID?: string;

    public get isLoggedIn(): boolean {
        return this.access_token !== undefined;
    }

    public static async Instance() {
        let instance = this._instance;
        // Load from database if not done
        if (!instance) {
            instance = (this._instance = new this());
            if (!instance.database) {
                await instance.createDatabase();
            }
            const tx = instance.database?.transaction('loginInfo', 'readonly');
            // We dont know the mxid so we just get all and use the first. In theory this allows for multiple accounts
            const loginInfo = await tx?.store.getAll();
            await tx?.done;
            if (loginInfo && loginInfo.length > 0) {
                instance.mxid = loginInfo[0].userId;
                instance.hostname = loginInfo[0].hostname;
                instance.slidingSyncHostname = loginInfo[0].slidingSyncHostname;
                instance.access_token = loginInfo[0].access_token;
                instance.device_id = loginInfo[0].device_id;
                instance.profileInfo = {
                    avatar_url: loginInfo[0].avatarUrl,
                    displayname: loginInfo[0].displayName,
                };

                // Load sync info
                const syncTx = instance.database?.transaction('syncInfo', 'readonly');
                const syncInfo = await syncTx?.store.get(instance.mxid!);
                await syncTx?.done;

                if (syncInfo) {
                    instance.syncPos = syncInfo.syncPos;
                    instance.initialSync = syncInfo.initialSync;
                    instance.lastRanges = syncInfo.lastRanges;
                    instance.lastTxnID = syncInfo.lastTxnID;
                }

                // Load rooms
                const roomTx = instance.database?.transaction('rooms', 'readonly');
                const rooms = await roomTx?.store.getAll();
                await roomTx?.done;

                if (rooms) {
                    instance.rooms = new Set(rooms.map(room => {
                        const roomObj = new Room(room.roomID, instance.hostname!);
                        roomObj.windowPos = room.windowPos;
                        roomObj.setInvitedCount(room.invited_count);
                        roomObj.setJoinedCount(room.joined_count);
                        roomObj.setNotificationCount(room.notification_count);
                        roomObj.setNotificationHighlightCount(room.highlight_count);
                        roomObj.setName(room.name);
                        if (room.events) {
                            roomObj.addEvents(room.events);
                        }
                        if (room.stateEvents) {
                            roomObj.addStateEvents(room.stateEvents);
                        }
                        if (room.isDM) {
                            roomObj.setDM(room.isDM);
                        }
                        return roomObj;
                    }))
                    instance.emit("rooms", instance.rooms);
                }
            }
        }


        return instance;
    }

    private async createDatabase() {
        this.database = await openDB<MatrixDB>("matrix", 3, {
            upgrade(db) {
                if (db.objectStoreNames.contains("rooms")) {
                    db.deleteObjectStore("rooms");
                }
                //if (db.objectStoreNames.contains("loginInfo")) {
                //    db.deleteObjectStore("loginInfo");
                //}
                if (db.objectStoreNames.contains("syncInfo")) {
                    db.deleteObjectStore("syncInfo");
                }
                db.createObjectStore('rooms', { keyPath: 'roomID' });
                db.createObjectStore('loginInfo', { keyPath: 'userId' });
                db.createObjectStore('syncInfo', { keyPath: 'userId' });
            }
        });
    }

    private async setHostname(hostname: string) {
        if (!hostname.startsWith("https://")) {
            throw Error("Hostname must start with 'https://'");
        }
        if (!this.database) {
            await this.createDatabase();
        }

        // Write to database
        const tx = this.database?.transaction('loginInfo', 'readwrite');
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

    public async startSync() {
        if (!this.isLoggedIn) {
            throw Error("Not logged in");
        }
        if (!this.database) {
            await this.createDatabase();
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
                return;
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
        const roomObj = [...this.rooms].find(room => room.windowPos[listKey] === index);
        if (roomObj) {
            const tx = this.database?.transaction('rooms', 'readwrite');
            await tx?.store.delete(roomObj.roomID);
            await tx?.done;
            this.rooms.delete(roomObj)
        }
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
        if (!this.isLoggedIn) {
            throw Error("Not logged in");
        }
        if (!this.slidingSyncHostname) {
            throw Error("Hostname must be set first");
        }

        // This is the initial sync case for each list
        let lists_ranges: {
            "overview": number[][];
            [key: string]: number[][];
        } = {
            "overview": [[0, 10]],
            // Needed for calcs
            "spaces": [[0, Number.MAX_SAFE_INTEGER]]
        };
        let timeline_limit = 1;
        if (!this.initialSync) {
            for (const list in lists_ranges) {
                // Set higher timeline limit for subsequent syncs
                timeline_limit = 10;
                // Calculate overlap between this.roomsInView and this.roomToRoomID and then
                // calculate the ranges for each list
                const rawRangeInView = new Set([...this.rooms]
                    .filter(room => this.roomsInView.includes(room.roomID))
                    .map(room => room.windowPos[list]).sort())


                if (rawRangeInView.size === 0) {
                    // If there are no rooms in view, we can skip this list
                    continue;
                }

                // Increment range by 1 to make sure we always get a little more than we need
                // [1,2,3,4,7,8,9,10,11] -> [2,3,4,5,8,9,10,11,12]
                rawRangeInView.add([...rawRangeInView][rawRangeInView.size - 1] + 1);


                // Turn an input like [1,2,3,4,7,8,9,10,11] to [[1,4], [7,11]]
                const rangesInView = [...rawRangeInView].reduce((acc, cur, i, arr) => {
                    if (i === 0) {
                        // [1,2,3,4] -> [[1,1]]
                        acc.push([cur, cur]);
                        return acc;
                    }
                    // Cur = 2, arr = [1,2,3,4], arr[i - 1] + 1 = 2 then
                    if (cur === arr[i - 1] + 1) {
                        // [1,2,3,4,7] -> [[1,2]]
                        acc[acc.length - 1][1] = cur;
                        return acc;
                    }
                    // Else [1,2,3,4,7] -> [[1,2], [7,7]]
                    acc.push([cur, cur]);
                    return acc;
                }, [] as [number, number][]);

                // Sort by the first element of each range and add to the object
                const sorted = rangesInView.sort((a, b) => a[0] - b[0]);

                // Deduplicate ranges
                const deduped = sorted.reduce((acc, cur, i, arr) => {
                    if (i === 0) {
                        acc.push(cur);
                        return acc;
                    }
                    if (cur[0] === arr[i - 1][0] && cur[1] === arr[i - 1][1]) {
                        return acc;
                    }
                    acc.push(cur);
                    return acc;
                }, [] as [number, number][]);

                lists_ranges[list] = deduped;
            }
        }


        if (this.lastRanges && Object.entries(lists_ranges).toString() !== Object.entries(this.lastRanges).toString()) {
            console.log("Ranges changed, resetting sync txn_id", lists_ranges)
            this.lastRanges = lists_ranges;
            this.lastTxnID = Date.now().toString();
        }

        if (!this.lastRanges) {
            console.log(lists_ranges)
            this.lastRanges = lists_ranges;
            this.lastTxnID = Date.now().toString();
        }


        let url = `${this.slidingSyncHostname}/_matrix/client/unstable/org.matrix.msc3575/sync?timeout=30000`;
        if (this.syncPos) {
            url = `${this.slidingSyncHostname}/_matrix/client/unstable/org.matrix.msc3575/sync?timeout=30000&pos=${this.syncPos}`
        }

        const resp = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.access_token}`
            },
            body: JSON.stringify({
                // allows clients to know what request params reached the server,
                // functionally similar to txn IDs on /send for events.
                // TODO: check resp
                txn_id: this.lastTxnID,

                // a delta token to remember information between sessions.
                // See "Bandwidth optimisations for persistent clients" for more information.
                // TODO: This isnt implemented anywhere yet
                //delta_token: "opaque-server-provided-string",

                // Sliding Window API
                lists: {
                    // TODO: We need a list that fetches all spaces
                    "spaces": {
                        slow_get_all_rooms: true,
                        sort: ["by_name"],
                        required_state: [
                            // needed to build sections
                            ["m.space.child", "*"],
                            ["m.space.parent", "*"],
                            ["m.room.create", ""],
                            // Room Avatar
                            ["m.room.avatar", "*"],
                            // Room Topic
                            ["m.room.topic", "*"],
                            // Request only the m.room.member events required to render events in the timeline.
                            // The "$LAZY" value is a special sentinel value meaning "lazy loading" and is only valid for
                            // the "m.room.member" event type. For more information on the semantics, see "Lazy-Loading Room Members".
                            ["m.room.member", "$LAZY"],
                        ],
                        timeline_limit: timeline_limit,
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
                            // Room Avatar
                            ["m.room.avatar", "*"],
                            // Room Topic
                            ["m.room.topic", "*"],
                            // Request only the m.room.member events required to render events in the timeline.
                            // The "$LAZY" value is a special sentinel value meaning "lazy loading" and is only valid for
                            // the "m.room.member" event type. For more information on the semantics, see "Lazy-Loading Room Members".
                            ["m.room.member", "$LAZY"],
                        ],
                        timeline_limit: timeline_limit,
                        filters: {}
                    },
                },
                bump_event_types: ["m.room.message", "m.room.encrypted"],

                // Room Subscriptions API
                //room_subscriptions: {},
                //unsubscribe_rooms: []
            })
        });
        if (!resp.ok) {
            if (resp.status === 400) {
                if ((await resp.json()).errcode === "M_UNKNOWN_POS") {
                    this.syncPos = undefined;
                    const syncInfoTX = this.database?.transaction('syncInfo', 'readwrite');
                    await syncInfoTX?.store.put({
                        userId: this.mxid!,
                        syncPos: this.syncPos,
                        initialSync: this.initialSync,
                        lastRanges: this.lastRanges,
                        lastTxnID: this.lastTxnID,
                    });
                    await syncInfoTX?.done;
                }
            }
            console.error(resp);
            console.error("Error syncing. See console for error.");
        }
        const json = await resp.json() as ISlidingSyncResp;
        this.syncPos = json.pos;


        const syncInfoTX = this.database?.transaction('syncInfo', 'readwrite');
        await syncInfoTX?.store.put({
            userId: this.mxid!,
            syncPos: this.syncPos,
            initialSync: this.initialSync,
            lastRanges: this.lastRanges,
            lastTxnID: this.lastTxnID,
        });
        await syncInfoTX?.done;

        let gapIndex = -1;
        for (const listKey in json.lists) {
            const list = json.lists[listKey];
            if (list.ops) {
                for (const op of list.ops) {
                    if (isSyncOp(op)) {
                        const tx = this.database?.transaction('rooms', 'readwrite');
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

                            const newRoom = new Room(roomID, this.hostname!);
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
                        const tx = this.database?.transaction('rooms', 'readwrite');
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
                            let newRoom = new Room(op.room_id, this.hostname!);
                            newRoom.setName(op.room_id);
                            newRoom.windowPos[listKey] = op.index;
                            if (roomFromDB) {
                                console.warn("Room in db but not in obj list.", op.room_id, "Updating obj list.");
                                newRoom = new Room(op.room_id, this.hostname!)
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
                        const tx = this.database?.transaction('rooms', 'readwrite');
                        for (let i = op.range[0]; i <= op.range[1]; i++) {
                            // We shall first forget about these and "startover"
                            const roomObj = [...this.rooms].find(room => room.windowPos[listKey] === i);
                            if (roomObj) {
                                await tx?.store.delete(roomObj.roomID);
                                this.rooms.delete(roomObj)
                            }
                        }
                        await tx?.done;
                    }
                }
                if (gapIndex !== -1) {
                    // we already have a DELETE operation to process, so process it
                    // Everything higher than the gap needs to be shifted left.
                    await this.removeEntry(listKey, this.lastRanges[listKey], gapIndex);
                }
            }
        }
        const tx = this.database?.transaction('rooms', 'readwrite');
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

            const roomObj = [...this.rooms].find(room => room.roomID === roomID);
            if (!roomObj) {
                // TODO: Warn but create missing room instead of failing on it
                console.error("Could not find roomObj for roomID", roomID);
                continue;
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
            if (is_dm) {
                roomObj.setDM(is_dm);
            }

            // Write to database
            await tx?.store.put({
                windowPos: roomObj.windowPos,
                roomID: roomObj.roomID,
                name: roomObj.getName(),
                notification_count: roomObj.getNotificationCount(),
                highlight_count: roomObj.getNotificationHighlightCount(),
                joined_count: roomObj.getJoinedCount(),
                invited_count: roomObj.getInvitedCount(),
                events: roomObj.getEvents(),
                stateEvents: roomObj.getStateEvents(),
                avatarUrl: roomObj.getAvatarURL(),
                isSpace: roomObj.isSpace(),
                isDM: roomObj.isDM(),
            });
        }
        await tx?.done

        if (this.initialSync) {
            this.initialSync = false;
            console.log("initialSyncComplete");
        }
        if (json.rooms && Object.keys(json.rooms).length > 0) {
            this.emit("rooms", this.rooms);
        }
    }

    /**
     * addInViewRoom
     * 
     * Tells the sync that a room with a certain roomID is inView.
     */
    public addInViewRoom(roomID: string) {
        this.roomsInView.push(roomID);
    }

    /**
     * removeInViewRoom
     * 
     * Tells the sync that a room isn't in the room anymore
     */
    public removeInViewRoom(roomID: string) {
        this.roomsInView = this.roomsInView.filter(room => room !== roomID);
    }

    public addSpaceOpen(roomID: string) {
        this.spaceOpen.push(roomID);
    }

    public removeSpaceOpen(roomID: string) {
        this.spaceOpen = this.spaceOpen.filter(room => room !== roomID);
    }

    public getRooms(): Set<Room> {
        return this.rooms;
    }

    private getSpaces(): Room[] {
        return [...this.rooms].filter(room => room.isSpace()).sort((a: Room, b: Room) => {
            if (a.getName() < b.getName()) {
                return -1;
            }
            if (a.getName() > b.getName()) {
                return 1;
            }
            return 0;
        });
    }

    public getSpacesWithRooms(): Set<{
        spaceRoom: Room, children: Set<Room>
    }> {
        const spaces = this.getSpaces();
        const result: Set<{
            spaceRoom: Room, children: Set<Room>
        }> = new Set();
        // Find children of spaces
        for (const space of spaces) {
            const childrenIDs = space.getSpaceChildrenIDs();

            const children = new Set([...this.getRooms()].filter(room => childrenIDs.includes(room.roomID)));

            result.add({
                spaceRoom: space,
                children: children,
            });
        }
        // Find spaces of parents
        // Check parents of each room and if we have a parent make sure to add it to the result unless already added
        for (const room of this.getRooms()) {
            const parents = room.getSpaceParentIDs();
            for (const parent of parents) {
                const parentObj = [...this.getRooms()].find(room => room.roomID === parent.roomID);
                if (!parentObj) {
                    continue;
                }
                const alreadyAddedSpace = [...result].find(space => space.spaceRoom.roomID === parentObj.roomID);
                if (alreadyAddedSpace) {
                    // Check if room in children
                    if (![...alreadyAddedSpace.children].find(child => child.roomID === room.roomID)) {
                        alreadyAddedSpace.children.add(room);
                    }
                    continue;
                }
                // If space not added yet, add it
                result.add({
                    spaceRoom: parentObj,
                    children: new Set([room]),
                });
            }
        }

        return result;
    }

    private async getLoginFlows(): Promise<ILoginFlows> {
        if (!this.hostname) {
            throw Error("Hostname must be set first");
        }
        const resp = await fetch(`${this.hostname}/_matrix/client/v3/login`);
        if (!resp.ok) {
            console.error(resp);
            throw Error("Error requesting login flows. See console for error.");
        }
        const json = await resp.json() as ILoginFlows;
        return json;
    }

    private async getWellKnown(): Promise<IWellKnown> {
        if (!this.hostname) {
            throw Error("Hostname must be set first");
        }
        const resp = await fetch(`${this.hostname}/.well-known/matrix/client`);
        if (!resp.ok) {
            console.error(resp);
            throw Error("Error requesting login flows. See console for error.");
        }
        const json = await resp.json() as IWellKnown;
        return json;
    }

    public async passwordLogin(username: string, password: string, triesLeft = 5) {
        if (!this.database) {
            await this.createDatabase();
        }
        if (!username) {
            throw Error("Username must be set");
        }
        if (!password) {
            throw Error("Password must be set");
        }
        this.mxid = username;
        await this.setHostname(`https://${username.split(':')[1]}`);

        try {
            const well_known = await this.getWellKnown();
            if (well_known["m.homeserver"]?.base_url) {
                await this.setHostname(well_known["m.homeserver"].base_url);
            }
            if (well_known["org.matrix.msc3575.proxy"]?.url) {
                // Write to database
                const tx = this.database?.transaction('loginInfo', 'readwrite');
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
                throw Error("No sliding sync proxy found");
            }
        } catch (e: any) {
            console.warn(`No well-known found for ${this.hostname}:\n${e}`);
        }

        const loginFlows = await this.getLoginFlows();
        if ((loginFlows.flows.filter((flow) => flow.type === 'm.login.password')?.length || 0) == 0) {
            throw Error("Password login is not supported by this homeserver");
        }

        const resp = await fetch(`${this.hostname}/_matrix/client/r0/login`, {
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
            console.error(resp);
            throw Error("Error logging in. See console for error.");
        }
        const json = await resp.json();
        if (isErrorResp(json)) {
            throw Error(`Error logging in: ${json.errcode}: ${json.error}`);
        }
        if (isRateLimitError(json)) {
            console.error(`Rate limited. Retrying in ${json.retry_after_ms}ms. ${triesLeft} tries left.`);
            await this.passwordLogin(username, password, triesLeft - 1);
        }
        if (isLoginResponse(json)) {
            // Write to database
            const tx = this.database?.transaction('loginInfo', 'readwrite');
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
        }
    }

    public async fetchProfileInfo(userId: string): Promise<IProfileInfo> {
        if (this.profileInfo) {
            return this.profileInfo;
        }
        if (!this.hostname) {
            throw Error("Hostname must be set first");
        }
        if (!this.database) {
            await this.createDatabase();
        }
        if (!this.access_token) {
            throw Error("Access token must be set first");
        }
        const resp = await fetch(`${this.hostname}/_matrix/client/r0/profile/${userId}`, {
            headers: {
                "Authorization": `Bearer ${this.access_token}`
            }
        });
        if (!resp.ok) {
            if (resp.status === 404 || resp.status === 403) {
                return {} as IProfileInfo;
            }
            console.error(resp);
            throw Error("Error fetching profile info. See console for error.");
        }
        const json = await resp.json() as IProfileInfo;
        json.avatar_url = json.avatar_url?.replace("mxc://", `${this.hostname}/_matrix/media/r0/download/`);
        this.profileInfo = json;
        const tx = this.database?.transaction('loginInfo', 'readwrite');
        await tx?.store.put({
            userId: this.mxid!,
            device_id: this.device_id!,
            hostname: this.hostname,
            slidingSyncHostname: this.slidingSyncHostname,
            access_token: this.access_token,
            displayName: json.displayname,
            avatarUrl: json.avatar_url,
        });
        await tx?.done

        return json;
    }
}

function isRateLimitError(arg: any): arg is IRateLimitError {
    return arg.retry_after_ms !== undefined;
}

function isLoginResponse(arg: any): arg is ILoginResponse {
    return arg.access_token !== undefined;
}

function isErrorResp(arg: any): arg is IErrorResp {
    return arg.errcode !== undefined;
}

export const defaultMatrixClient: MatrixClient = await MatrixClient.Instance();
export const MatrixContext = createContext<MatrixClient>(defaultMatrixClient);

// List of rooms
export function useRooms() {
    const client = useContext(MatrixContext);
    const [rooms, setRooms] = useState<Set<Room>>(client.getRooms());

    useEffect(() => {
        // Listen for room updates
        const listenForRooms = (rooms: Set<Room>) => {
            setRooms(rooms);
        };
        client.on("rooms", listenForRooms);
        // This is a no-op if there is already a sync
        client.startSync();
        return () => {
            client.removeListener("rooms", listenForRooms);
        }
    }, [])
    return rooms;
}

export function useRoom(roomID?: string): Room | undefined {
    const client = useContext(MatrixContext);
    return [...client.getRooms()].find(room => room.roomID === roomID);
}

export function useSpaces() {
    const client = useContext(MatrixContext);
    const [spacesWithRooms, setSpacesWithRooms] = useState<Set<{
        spaceRoom: Room, children: Set<Room>
    }>>(client.getSpacesWithRooms());

    useEffect(() => {
        // Listen for room updates
        const listenForRooms = (_rooms: Set<Room>) => {
            setSpacesWithRooms(client.getSpacesWithRooms());
        };
        client.on("rooms", listenForRooms);
        // This is a no-op if there is already a sync
        client.startSync();
        return () => {
            client.removeListener("rooms", listenForRooms);
        }
    }, [])
    return spacesWithRooms;
}


export function useProfile() {
    const client = useContext(MatrixContext);
    const [profile, setProfile] = useState<IProfileInfo>({
        displayname: client.mxid || "Unknown",
    });

    useEffect(() => {
        client.fetchProfileInfo(client.mxid!).then((profile) => {
            if (!profile.displayname) {
                profile.displayname = client.mxid || "Unknown";
            }
            setProfile(profile);
        })
    }, [])
    return profile;
}