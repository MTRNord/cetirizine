import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";
import { OwnUser } from "./ownUser";
import {
    IProfileInfo,
    IRateLimitError,
} from "./api/apiTypes";
import { IRoomEvent, IRoomStateEvent } from './api/events';
import { Room } from "./room";
import EventEmitter from "events";
import {
    DBSchema,
    IDBPDatabase,
    deleteDB,
    openDB
} from "idb";
import { DeviceId, UserId } from "@mtrnord/matrix-sdk-crypto-js";
import { MatrixSlidingSync } from "./slidingSync";
import { isTesting } from './testUtil';

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
            to_device_since?: string;
        };
        // User ID
        key: string;
    }
}

export class MatrixClient extends EventEmitter {
    private static _instance: MatrixClient;
    public roomsInView: string[] = [];
    public spacesInView: string[] = [];
    public spaceOpen: string[] = [];
    public database?: IDBPDatabase<MatrixDB>;
    public profileInfo?: IProfileInfo;
    public currentRoom?: string;
    private user: OwnUser = new OwnUser(this);
    private sync: MatrixSlidingSync = new MatrixSlidingSync(this, this.user);

    public get accessToken(): string | undefined {
        return this.user.access_token;
    }

    public get hostname(): string | undefined {
        return this.user.hostname;
    }

    public get isLoggedIn(): boolean {
        return this.user.access_token !== undefined;
    }

    public get mxid(): string | undefined {
        return this.user.mxid;
    }

    private onSyncRooms(rooms: Set<Room>) {
        this.emit("rooms", rooms);
    }

    public async passwordLogin(username: string, password: string) {
        await this.user.passwordLogin(username, password);
        this.sync.on("rooms", (rooms) => this.onSyncRooms(rooms));
    }

    public convertMXC(url: string, size?: number): string {
        if (size) {
            return `${this.user.hostname}/_matrix/media/v3/thumbnail/${url.substring(6)}?width=${size}&height=${size}&method=scale`;
        }
        return `${this.user.hostname}/_matrix/media/v3/download/${url.substring(6)}`;
    }

    public setCurrentRoom(roomID?: string) {
        if (roomID !== this.currentRoom) {
            this.currentRoom = roomID;
            console.log("Current room changed to", roomID, "restarting sync");
            this.sync.mustUpdateTxnID = true;
            //this.abortController.abort();
            //this.abortController = new AbortController();
        }
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
                instance.user.mxid = loginInfo[0].userId;
                instance.user.hostname = loginInfo[0].hostname;
                instance.user.slidingSyncHostname = loginInfo[0].slidingSyncHostname;
                instance.user.access_token = loginInfo[0].access_token;
                instance.user.device_id = loginInfo[0].device_id;
                instance.profileInfo = {
                    avatar_url: loginInfo[0].avatarUrl,
                    displayname: loginInfo[0].displayName,
                };
                if (instance.user.mxid && instance.user.hostname && instance.user.access_token && instance.user.device_id) {
                    await instance.user.e2ee.initOlmMachine(new UserId(instance.user.mxid), new DeviceId(instance.user.device_id));
                }

                // Load sync info
                const syncTx = instance.database?.transaction('syncInfo', 'readonly');
                const syncInfo = await syncTx?.store.get(instance.user.mxid!);
                await syncTx?.done;

                if (syncInfo) {
                    instance.sync.applyStoredSyncInfo(syncInfo);
                }

                // Load rooms
                const roomTx = instance.database?.transaction('rooms', 'readonly');
                const rooms = await roomTx?.store.getAll();
                await roomTx?.done;

                if (rooms) {
                    instance.sync.rooms = new Set(rooms.map(room => {
                        const roomObj = new Room(room.roomID, instance.user.hostname!, instance, instance.user.e2ee);
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
                    instance.emit("rooms", instance.sync.rooms);
                }
            }
            instance.setMaxListeners(60);
            instance.sync.on("rooms", (rooms) => instance.onSyncRooms(rooms));
        }


        return instance;
    }

    public async createDatabase() {
        this.database = await openDB<MatrixDB>("matrix", 4, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
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
            }
        });
    }

    public async decryptRoomEvent(roomID: string, event: IRoomEvent): Promise<IRoomEvent> {
        if (!this.isLoggedIn) {
            if (isTesting()) {
                return { content: {}, event_id: "", type: "", sender: "", origin_server_ts: 0 };
            }
            throw Error("Not logged in");
        }
        const decryptedEvent = this.user.e2ee.decryptRoomEvent(roomID, event);
        return decryptedEvent;
    }

    public async logout() {
        this.sync.logout();
        this.sync.off("rooms", this.onSyncRooms);
        await this.user.logout();
        this.user.e2ee.logoutE2ee();
        if (this.user.mxid) {
            const syncInfoTX = this.database?.transaction('syncInfo', 'readwrite');
            await syncInfoTX?.store.delete(this.user.mxid);
            await syncInfoTX?.done;
            const loginInfoTX = this.database?.transaction('loginInfo', 'readwrite');
            await loginInfoTX?.store.delete(this.user.mxid);
            await loginInfoTX?.done;
        }
        const roomTX = this.database?.transaction('rooms', 'readwrite');
        await roomTX?.store.clear();
        await roomTX?.done;
        this.user.mxid = undefined;
        this.sync.resetAbortController();
        await deleteDB("cetirizine-crypto", {
            blocked() {
                location.reload();
            },
        });
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

    public addInViewSpace(roomID: string) {
        this.spacesInView.push(roomID);
    }

    public removeInViewSpace(roomID: string) {
        this.spacesInView = this.spacesInView.filter(room => room !== roomID);
    }

    public addSpaceOpen(roomID: string) {
        if (roomID === "other") {
            return;
        }
        this.spaceOpen.push(roomID);

        console.log("Space opened", roomID, "restarting sync");
        this.sync.mustUpdateTxnID = true;
        //this.abortController.abort();
        //this.abortController = new AbortController();
    }

    public removeSpaceOpen(roomID: string) {
        if (roomID === "other") {
            return;
        }
        this.spaceOpen = this.spaceOpen.filter(room => room !== roomID);
        this.sync.mustUpdateTxnID = true;

        // We intentionally do not restart the sync here since it will update in the next sync anyway.
    }

    public getRooms(): Set<Room> {
        return this.sync.rooms;
    }

    public getSpaces(): Room[] {
        return [...this.sync.rooms].filter(room => room.isSpace() && !room.isTombstoned()).sort((a: Room, b: Room) => {
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
            if (room.isSpace() || room.isTombstoned()) {
                continue;
            }
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

    public async startSync() {
        await this.sync.startSync();
    }

    public async fetchProfileInfo(userId: string): Promise<IProfileInfo> {
        // @ts-ignore
        if (globalThis.IS_STORYBOOK) {
            await new Promise(r => setTimeout(r, 5000))
        }
        if (this.profileInfo) {
            return this.profileInfo;
        }
        if (!this.user.hostname) {
            throw Error("Hostname must be set first");
        }
        if (!this.database) {
            await this.createDatabase();
        }
        if (!this.user.access_token) {
            throw Error("Access token must be set first");
        }
        const resp = await fetch(`${this.user.hostname}/_matrix/client/v3/profile/${userId}`, {
            headers: {
                "Authorization": `Bearer ${this.user.access_token}`
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
        if (json.avatar_url) {
            json.avatar_url = this.convertMXC(json.avatar_url);
        }
        this.profileInfo = json;
        const tx = this.database?.transaction('loginInfo', 'readwrite');
        await tx?.store.put({
            userId: this.user.mxid!,
            device_id: this.user.device_id!,
            hostname: this.user.hostname,
            slidingSyncHostname: this.user.slidingSyncHostname,
            access_token: this.user.access_token,
            displayName: json.displayname,
            avatarUrl: json.avatar_url,
        });
        await tx?.done

        return json;
    }
}

export function isRateLimitError(arg: any): arg is IRateLimitError {
    return arg.retry_after_ms !== undefined;
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
            client.off("rooms", listenForRooms);
        }
    }, [])
    return rooms;
}

export function useRoom(roomID?: string): Room | undefined {
    const rooms = useRooms();

    return [...rooms].find(room => room.roomID === roomID);
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
            client.off("rooms", listenForRooms);
        }
    }, [])
    return spacesWithRooms;
}


export function useProfile() {
    const client = useContext(MatrixContext);
    const [profile, setProfile] = useState<IProfileInfo>(client.profileInfo || {
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