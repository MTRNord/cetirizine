import { createContext, useContext, useEffect, useState } from "react";
import { IErrorResp, ILoginFlows, ILoginResponse, IProfileInfo, IRateLimitError, IRoomEvent, IRoomStateEvent, ISlidingSyncResp, IWellKnown, isDeleteOp, isInsertOp, isInvalidateOp, isSyncOp } from "./api/apiTypes";
import { Room } from "./room";
import EventEmitter from "events";
import { DBSchema, IDBPDatabase, openDB } from "idb";

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

    private findNextFreeIndex(list: string): number {
        const keys = [...this.rooms].map(room => room.windowPos[list]);
        const max = Math.max(...keys); // Will find highest number
        const min = 0;
        // Basically "append"
        let missing = max + 1;

        console.log("Max:", max)
        console.log("Min:", min)
        console.log("Keys:", keys)
        for (let i = min; i <= max; i++) {
            if (!keys.includes(i)) {
                console.log("Missing:", i)
                missing = i;
                break
            }
        }
        return missing;
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
        let lists_ranges: {
            "overview": number[][];
            [key: string]: number[][];
        } = {
            "overview": [[0, 10]]
        };
        let timeline_limit = 1;
        if (!this.initialSync) {
            for (const list in lists_ranges) {
                // Set higher timeline limit for subsequent syncs
                timeline_limit = 10;
                // Calculate overlap between this.roomsInView and this.roomToRoomID and then
                // calculate the ranges for each list
                const rawRangeInView = [...this.rooms]
                    .filter(room => this.roomsInView.includes(room.roomID))
                    .map(room => room.windowPos[list])
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

                lists_ranges[list] = rangesInView;
            }
        }


        if (this.lastRanges && Object.entries(lists_ranges).toString() !== Object.entries(this.lastRanges).toString()) {
            console.log("Ranges changed, resetting sync txn_id")
            this.lastRanges = lists_ranges;
            this.lastTxnID = Date.now().toString();
        }

        if (!this.lastRanges) {
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
            throw Error("Error syncing. See console for error.");
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

        for (const listKey in json.lists) {
            const list = json.lists[listKey];
            if (list.ops) {
                for (const op of list.ops) {
                    if (isSyncOp(op)) {
                        const tx = this.database?.transaction('rooms', 'readwrite');
                        for (let i = op.range[0]; i <= op.range[1]; i++) {
                            // We shall first forget about these and "startover"
                            await tx?.store.delete(op.room_ids[i]);
                            const roomObj = [...this.rooms].find(room => room.windowPos[listKey] === i);
                            if (roomObj) {
                                this.rooms.delete(roomObj)
                            }
                            // We start to remember the Room now.
                            const newRoom = new Room(op.room_ids[i], this.hostname!);
                            newRoom.setName("Unknown Room");
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
                            });
                        }
                        await tx?.done;
                    } else if (isInsertOp(op)) {
                        console.log("Got INSERT OP", op);
                        console.warn("INSERT not implemented")
                    } else if (isDeleteOp(op)) {
                        console.log("Got DELETE OP", op);
                        const roomObj = [...this.rooms].find(room => room.windowPos[listKey] === op.index);
                        if (roomObj) {
                            const tx = this.database?.transaction('rooms', 'readwrite');
                            await tx?.store.delete(roomObj.roomID);
                            await tx?.done;
                            this.rooms.delete(roomObj)
                        }
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
            if (events) {
                roomObj.addEvents(events);
            }
            if (required_state) {
                roomObj.addStateEvents(required_state);
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
                events: events,
                stateEvents: required_state,
                avatarUrl: roomObj.getAvatarURL(),
                isSpace: roomObj.isSpace(),
            });
        }
        await tx?.done
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

    public getRooms(): Set<Room> {
        return this.rooms;
    }

    private getSpaces(): Room[] {
        return [...this.rooms].filter(room => room.isSpace());
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