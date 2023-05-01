import { createContext, useContext, useEffect, useState } from "react";
import { IErrorResp, ILoginFlows, ILoginResponse, IRateLimitError, IRoomEvent, IRoomStateEvent, ISlidingSyncResp, IWellKnown, isDeleteOp, isInsertOp, isInvalidateOp, isSyncOp } from "./api/apiTypes";
import { Room } from "./room";
import EventEmitter from "events";
import { DBSchema, IDBPDatabase, openDB } from "idb";

export interface MatrixClientEvents {
    // Used to notify about changes to the room list
    'rooms': (rooms: Room[]) => void;
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
        key: number;
        value: {
            windowID: number;
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
        };
        indexes: {
            // Get room in window order
            'by-windowID': number;
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
        };
        // User ID
        key: string;
    };
    syncInfo: {
        // sync info
        value: {
            userId: string;
            syncPos: string;
            initialSync: boolean;
        };
        // User ID
        key: string;
    }
}

export class MatrixClient extends EventEmitter {
    private static _instance: MatrixClient;
    private access_token?: string;
    // @ts-ignore Not used currently but needed
    private device_id?: string;
    // @ts-ignore Not used currently but needed
    private mxid?: string;
    // Hostname including "https://"
    private hostname?: string;
    private slidingSyncHostname?: string;
    private syncing = false;
    private roomsInView: string[] = [];
    private roomToRoom: Map<number, Room> = new Map();
    private syncPos?: string;
    private initialSync = true;
    private database?: IDBPDatabase<MatrixDB>;

    public get isLoggedIn(): boolean {
        return this.access_token !== undefined;
    }

    public static async Instance() {
        const instance = this._instance || (this._instance = new this());
        // Load from database
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

            // Load sync info
            const syncTx = instance.database?.transaction('syncInfo', 'readonly');
            const syncInfo = await syncTx?.store.get(instance.mxid!);
            await syncTx?.done;

            if (syncInfo) {
                instance.syncPos = syncInfo.syncPos;
                instance.initialSync = syncInfo.initialSync;
            }

            // Load rooms
            const roomTx = instance.database?.transaction('rooms', 'readonly');
            const rooms = await roomTx?.store.getAll();
            await roomTx?.done;

            if (rooms) {
                for (const room of rooms) {
                    const roomObj = new Room(room.roomID, instance.hostname!);
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

                    instance.roomToRoom.set(room.windowID, roomObj);
                }
                instance.emit("rooms", [...instance.roomToRoom.values()]);
            }
        }

        return instance;
    }

    private async createDatabase() {
        this.database = await openDB<MatrixDB>("matrix", 1, {
            upgrade(db) {
                const roomStore = db.createObjectStore('rooms', { keyPath: 'windowID' });
                roomStore.createIndex('by-windowID', 'windowID');
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

    private async sync() {
        if (!this.isLoggedIn) {
            throw Error("Not logged in");
        }
        if (!this.slidingSyncHostname) {
            throw Error("Hostname must be set first");
        }

        // This is the initial sync case for each list
        let lists_ranges = {
            "overview": [[0, 10]]
        };
        let timeline_limit = 1;
        if (!this.initialSync) {
            // Set higher timeline limit for subsequent syncs
            timeline_limit = 10;
            // Calculate overlap between this.roomsInView and this.roomToRoomID and then
            // calculate the ranges for each list
            const rawRangeInView = [...this.roomToRoom.entries()]
                .filter(([_, room]) => this.roomsInView.includes(room.roomID))
                .map(([rangeID]) => rangeID)
                .sort();

            // Increment range by 1 to make sure we always get a little more than we need
            // [1,2,3,4,7,8,9,10,11] -> [2,3,4,5,8,9,10,11,12]
            rawRangeInView.push(rawRangeInView[rawRangeInView.length - 1] + 1);

            // Turn an input like [1,2,3,4,7,8,9,10,11] to [[1,4], [7,11]]
            const rangesInView = rawRangeInView.reduce((acc, cur, i, arr) => {
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

            lists_ranges = {
                "overview": rangesInView
            };
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
                txn_id: Date.now().toString(),

                // a delta token to remember information between sessions.
                // See "Bandwidth optimisations for persistent clients" for more information.
                // TODO: This isnt implemented anywhere yet
                //delta_token: "opaque-server-provided-string",

                // Sliding Window API
                lists: {
                    "overview": {
                        ranges: lists_ranges["overview"],
                        sort: ["by_notification_level", "by_recency", "by_name"],
                        required_state: [
                            // needed to build sections
                            ["m.space.child", "*"],
                            ["m.space.parent", "*"],
                            ["m.room.create", ""],
                            // Room Avatar
                            ["m.room.avatar", "*"],
                        ],
                        timeline_limit: timeline_limit,
                        filters: {}
                    },
                },
                bump_event_types: ["m.room.message", "m.room.encrypted"],

                // Room Subscriptions API
                room_subscriptions: {},
                unsubscribe_rooms: []
            })
        });
        if (!resp.ok) {
            console.error(resp);
            throw Error("Error syncing. See console for error.");
        }
        const json = await resp.json() as ISlidingSyncResp;
        this.syncPos = json.pos;


        const syncInfoTX = this.database?.transaction('syncInfo', 'readwrite');
        await syncInfoTX?.store.put({
            userId: this.mxid!,
            syncPos: this.syncPos,
            initialSync: this.initialSync,
        });
        await syncInfoTX?.done;

        for (const listKey in json.lists) {
            const list = json.lists[listKey];
            if (list.ops) {
                for (const op of list.ops) {
                    if (isSyncOp(op)) {
                        const tx = this.database?.transaction('rooms', 'readwrite');
                        for (let i = op.range[0]; i <= op.range[1]; i++) {
                            // We shall first forget about these and "startover"
                            await tx?.store.delete(i);
                            this.roomToRoom.delete(i);

                            // We start to remember the Room now.
                            this.roomToRoom.set(i, new Room(op.room_ids[i], this.hostname!));
                        }
                        await tx?.done;
                    } else if (isInsertOp(op)) {
                        console.log("Got INSERT OP", op);
                        this.roomToRoom.set(op.index, new Room(op.room_id, this.hostname!));
                    } else if (isDeleteOp(op)) {
                        console.log("Got DELETE OP", op);
                        const tx = this.database?.transaction('rooms', 'readwrite');
                        await tx?.store.delete(op.index);
                        await tx?.done;
                        this.roomToRoom.delete(op.index);
                    } else if (isInvalidateOp(op)) {
                        const tx = this.database?.transaction('rooms', 'readwrite');
                        for (let i = op.range[0]; i <= op.range[1]; i++) {
                            // We shall first forget about these and "startover"
                            await tx?.store.delete(i);
                            this.roomToRoom.delete(i);
                        }
                        await tx?.done;
                    }
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
            const required_state = room.required_state;

            // Add the room data to the Room from this.roomToRoomID
            // Note that the map key does not mean the roomID but the sync position
            // RoomID is part of the value object of the map
            // value.roomID is the roomID
            const roomObj = [...this.roomToRoom.values()].find(room => room.roomID === roomID);

            if (!roomObj) {
                console.error("Could not find roomObj for roomID", roomID);
                continue;
            }

            roomObj.setName(name);
            roomObj.setNotificationCount(notification_count);
            roomObj.setNotificationHighlightCount(notification_highlight_count);
            roomObj.setJoinedCount(joined_count);
            roomObj.setInvitedCount(invited_count);
            roomObj.addEvents(events);
            if (required_state) {
                roomObj.addStateEvents(required_state);
            }

            // Write to database
            await tx?.store.put({
                windowID: [...this.roomToRoom.keys()].find(key => this.roomToRoom.get(key) === roomObj) as number,
                roomID: roomObj.roomID,
                name: roomObj.getName(),
                notification_count: roomObj.getNotificationCount(),
                highlight_count: roomObj.getNotificationHighlightCount(),
                joined_count: roomObj.getJoinedCount(),
                invited_count: roomObj.getInvitedCount(),
                events: events,
                stateEvents: required_state,
                avatarUrl: roomObj.getAvatarURL(),
                isSpace: roomObj.isSpace(),
            });
        }
        await tx?.done
        if (json.rooms && Object.keys(json.rooms).length > 0) {
            this.emit("rooms", [...this.roomToRoom.values()]);
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

    public getRooms(): Room[] {
        return [...this.roomToRoom.values()];
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
                // TODO: we might want to check for synapse support somehow
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
    const [rooms, setRooms] = useState<Room[]>(client.getRooms());

    useEffect(() => {
        // Listen for room updates
        client.on("rooms", (rooms: Room[]) => {
            setRooms(rooms);
        });
        // This is a no-op if there is already a sync
        client.startSync();
    }, [])
    return rooms;
}