import { createContext, useEffect, useState } from "react";
import { IErrorResp, ILoginFlows, ILoginResponse, IRateLimitError, ISlidingSyncResp, IWellKnown, isDeleteOp, isInsertOp, isInvalidateOp, isSyncOp } from "./api/apiTypes";
import { Room } from "./room";
import EventEmitter from "events";

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


export class MatrixClient extends EventEmitter {
    private static _instance: MatrixClient;
    // TODO: This needs to be stored
    private access_token?: string;
    // TODO: This needs to be stored
    // @ts-ignore Not used currently but needed
    private device_id?: string;
    // TODO: This needs to be stored
    // @ts-ignore Not used currently but needed
    private mxid?: string;
    // TODO: This needs to be stored
    // Hostname including "https://"
    private hostname?: string;
    // TODO: This needs to be stored
    private slidingSyncHostname?: string;
    private syncing = false;
    private roomsInView: string[] = [];
    // TODO: This needs to be stored
    private roomToRoom: Map<number, Room> = new Map();
    // TODO: This needs to be stored
    private syncPos?: string;
    // TODO: This needs to be stored
    private initialSync = true;

    public get isLoggedIn(): boolean {
        return this.access_token !== undefined;
    }

    public static get Instance() {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());
    }

    private set setHostname(hostname: string) {
        if (!hostname.startsWith("https://")) {
            throw Error("Hostname must start with 'https://'");
        }
        this.hostname = hostname;
    }

    public async startSync() {
        if (!this.isLoggedIn) {
            throw Error("Not logged in");
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


        console.log(url)
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
        for (const listKey in json.lists) {
            const list = json.lists[listKey];
            if (list.ops) {
                for (const op of list.ops) {
                    if (isSyncOp(op)) {
                        for (let i = op.range[0]; i <= op.range[1]; i++) {
                            // We shall first forget about these and "startover"
                            this.roomToRoom.delete(i);

                            // We start to remember the Room now.
                            this.roomToRoom.set(i, new Room(op.room_ids[i]));
                        }
                    } else if (isInsertOp(op)) {
                        console.log("Got INSERT OP", op);
                    } else if (isDeleteOp(op)) {
                        this.roomToRoom.delete(op.index);
                    } else if (isInvalidateOp(op)) {
                        for (let i = op.range[0]; i <= op.range[1]; i++) {
                            // We shall first forget about these and "startover"
                            this.roomToRoom.delete(i);
                        }
                    }
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
        }
        this.emit("rooms", [...this.roomToRoom.values()]);
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
        this.setHostname = `https://${username.split(':')[1]}`;

        try {
            const well_known = await this.getWellKnown();
            if (well_known["m.homeserver"]?.base_url) {
                this.setHostname = well_known["m.homeserver"].base_url;
            }
            if (well_known["org.matrix.msc3575.proxy"]?.url) {
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

export const defaultMatrixClient = MatrixClient.Instance;
export const MatrixContext = createContext(defaultMatrixClient);

// List of rooms
export function useRooms() {
    const client = MatrixClient.Instance;
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        // This is a no-op if there is already a sync
        client.startSync();
        // Listen for room updates
        client.on("rooms", (rooms: Room[]) => {
            setRooms(rooms);
        });
    }, [])
    return rooms;
}