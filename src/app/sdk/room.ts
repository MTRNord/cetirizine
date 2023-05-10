import EventEmitter from "events";
import {
    IRoomEvent,
    IRoomStateEvent,
    isRoomAvatarEvent,
    isRoomCreateEvent,
    isRoomTopicEvent,
    isSpaceChildEvent,
    isSpaceParentEvent
} from "./api/events";
import { MatrixClient } from "./client";
import { useEffect, useState } from "react";
import { EncryptionAlgorithm, EncryptionSettings, RoomId } from "@mtrnord/matrix-sdk-crypto-js";
import { OnlineState } from "./api/otherEnums";
import { MatrixE2EE } from "./e2ee";

export interface RoomEvents {
    // Used to notify about changes to the event list
    'events': (events: IRoomEvent[]) => void;
    'state_events': (stateEvents: IRoomStateEvent[]) => void;
}

export declare interface Room {
    on<U extends keyof RoomEvents>(
        event: U, listener: RoomEvents[U]
    ): this;

    emit<U extends keyof RoomEvents>(
        event: U, ...args: Parameters<RoomEvents[U]>
    ): boolean;
}

export class Room extends EventEmitter {
    private events: IRoomEvent[] = [];
    private pendingEvents: IRoomEvent[] = [];
    private stateEvents: IRoomStateEvent[] = [];
    private name?: string;

    private notification_count: number = 0;
    private notification_highlight_count: number = 0;
    private joined_count: number = 0;
    private invited_count: number = 0;
    private is_dm: boolean = false;

    public windowPos: {
        [list: string]: number
    } = {}


    constructor(public roomID: string, private hostname: string, private client: MatrixClient, private e2ee: MatrixE2EE) {
        super();
    }

    public addEvents(events: IRoomEvent[]): void {
        console.log("Adding events")
        events.forEach((newEvent) => {
            if (newEvent.unsigned?.transaction_id) {
                this.pendingEvents = this.pendingEvents.filter((event) => event.unsigned?.transaction_id !== newEvent.unsigned?.transaction_id);
            }

            this.events.push(newEvent);
        });

        this.emit("events", this.getEvents());
    }

    public addStateEvents(state: IRoomStateEvent[]): void {
        // if the state event id is already known then we update the event instead of pushing it on to the Array
        state.forEach((newEvent) => {
            const index = this.stateEvents.findIndex((oldEvent) => oldEvent.state_key === newEvent.state_key && oldEvent.type === newEvent.type);
            if (index !== -1) {
                this.stateEvents[index] = newEvent;
            } else {
                this.stateEvents.push(newEvent);
            }
        });
        this.emit("state_events", this.stateEvents);
    }

    public getStateEvents(): IRoomStateEvent[] {
        return this.stateEvents;
    }

    public isTombstoned(): boolean {
        let isTombstoned: boolean = false;
        this.stateEvents.forEach((event) => {
            if (event.type === "m.room.tombstone") {
                isTombstoned = true;
            }
        });
        return isTombstoned;
    }

    public getAvatarURL(): string | undefined {
        let avatarURL: string | undefined = undefined;
        this.stateEvents.forEach((event) => {
            if (isRoomAvatarEvent(event)) {
                const rawAvatarURL = event.content.url;
                if (rawAvatarURL?.startsWith("mxc://")) {
                    avatarURL = this.client.convertMXC(rawAvatarURL);
                }
            }
        });
        return avatarURL;
    }

    public isSpace(): boolean {
        let isSpace: boolean = false;
        this.stateEvents.forEach((event) => {
            if (isRoomCreateEvent(event)) {
                isSpace = event.content.type === "m.space";
            }
        });
        return isSpace;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getName(): string {
        if (!this.name) {
            return this.roomID;
        }
        return this.name;
    }

    public getTopic(): string | undefined {
        let topic: string | undefined = undefined;
        this.stateEvents.forEach((event) => {
            if (isRoomTopicEvent(event)) {
                topic = event.content.topic;
            }
        });
        return topic;
    }

    public setNotificationCount(count: number): void {
        this.notification_count = count;
    }

    public getNotificationCount(): number {
        return this.notification_count;
    }

    public setNotificationHighlightCount(count: number): void {
        this.notification_highlight_count = count;
    }

    public getNotificationHighlightCount(): number {
        return this.notification_highlight_count;
    }

    public setJoinedCount(count: number): void {
        this.joined_count = count;
    }

    public getJoinedCount(): number {
        return this.joined_count;
    }

    public setInvitedCount(count: number): void {
        this.invited_count = count;
    }

    public getInvitedCount(): number {
        return this.invited_count;
    }

    public getSpaceChildrenIDs(): string[] {
        const children: string[] = [];
        this.stateEvents.forEach((event) => {
            if (isSpaceChildEvent(event)) {
                children.push(event.state_key);
            }
        });
        return children;
    }

    public getSpaceParentIDs(): { roomID: string, canonical: boolean }[] {
        const parents: { roomID: string, canonical: boolean }[] = [];
        this.stateEvents.forEach((event) => {
            if (isSpaceParentEvent(event)) {
                parents.push({ roomID: event.state_key, canonical: event.content.canonical || false });
            }
        });
        return parents;
    }

    public setDM(isDM: boolean): void {
        this.is_dm = isDM;
    }

    public isDM(): boolean {
        return this.is_dm;
    }

    public get presence(): OnlineState {
        // TODO: Implement this
        return OnlineState.Unknown;
    }

    public getEvents(): IRoomEvent[] {
        return [...this.events, ...this.pendingEvents];
    }

    public getPureEvents(): IRoomEvent[] {
        return this.events;
    }

    public getMemberName(userID: string): string {
        let name: string = userID;
        this.stateEvents.forEach((event) => {
            if (event.type === "m.room.member") {
                if (event.state_key === userID && event.content.membership == "join") {
                    name = event.content.displayname;
                }
            }
        });
        return name;
    }

    public getMemberAvatar(userID: string, size: number = 32): string | undefined {
        let avatarURL: string | undefined = undefined;
        this.stateEvents.forEach((event) => {
            if (event.type === "m.room.member") {
                if (event.state_key === userID && event.content.membership == "join") {
                    const rawAvatarURL = event.content.avatar_url;
                    if (rawAvatarURL?.startsWith("mxc://")) {
                        avatarURL = this.client.convertMXC(rawAvatarURL, size);
                    }
                }
            }
        });
        return avatarURL;
    }

    public isEncrypted(): boolean {
        let isEncrypted: boolean = false;
        this.stateEvents.forEach((event) => {
            if (event.type === "m.room.encryption" && event.content.algorithm === "m.megolm.v1.aes-sha2" && event.state_key === "") {
                isEncrypted = true;
            }
        });
        return isEncrypted;
    }

    // TODO: Workaround since txn id doesnt come down sync
    private deletePendingByEventID(eventID: string): void {
        this.pendingEvents = this.pendingEvents.filter((event) => event.eventID !== eventID);
        this.emit("events", this.getEvents());
    }

    public async sendHtmlMessage(html: string, plainText: string, callbackLocalEcho: () => void): Promise<string> {
        const txn_id = Date.now().toString();
        // @ts-ignore: Intentionally incomplete
        const event = {
            type: "m.room.message",
            unsigned: {
                transaction_id: txn_id
            },
            origin_server_ts: txn_id,
            sender: this.client.mxid,
            event_id: txn_id,
            content: {
                "msgtype": "m.text",
                "body": plainText,
                "format": "org.matrix.custom.html",
                "formatted_body": html
            }
        } as IRoomEvent;
        this.pendingEvents.push(event);
        this.emit("events", this.getEvents());
        callbackLocalEcho();

        if (!this.isEncrypted()) {
            const resp = await fetch(`${this.hostname}/_matrix/client/v3/rooms/${this.roomID}/send/m.room.message/${event.unsigned?.transaction_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.client.accessToken}`
                },
                body: JSON.stringify(event.content)
            });
            if (!resp.ok) {
                this.deletePendingByEventID(event.event_id);
                throw new Error(`Failed to send message: ${resp.status} ${resp.statusText}`);
            }
            const json = await resp.json();
            this.deletePendingByEventID(event.event_id);
            return json.event_id;
        } else {
            console.log("Sending encrypted message");
            await this.e2ee.getMissingSessions();
            await this.e2ee.shareKeysForRoom(this);
            const encrypted = await this.e2ee.encryptRoomEvent(
                new RoomId(this.roomID),
                "m.room.message",
                JSON.stringify(event.content)
            );
            const resp = await fetch(`${this.hostname}/_matrix/client/v3/rooms/${this.roomID}/send/m.room.encrypted/${event.unsigned?.transaction_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.client.accessToken}`
                },
                body: encrypted
            });
            if (!resp.ok) {
                this.deletePendingByEventID(event.event_id);
                throw new Error(`Failed to send message: ${resp.status} ${resp.statusText}`);
            }
            const json = await resp.json();
            this.deletePendingByEventID(event.event_id);
            return json.event_id;
        }
    }

    public async sendTextMessage(text: string, callbackLocalEcho: () => void): Promise<string> {
        const txn_id = Date.now().toString();
        // @ts-ignore: Intentionally incomplete
        const event = {
            type: "m.room.message",
            unsigned: {
                transaction_id: txn_id
            },
            origin_server_ts: txn_id,
            event_id: txn_id,
            sender: this.client.mxid,
            content: {
                "msgtype": "m.text",
                "body": text,
            }
        } as IRoomEvent;
        this.pendingEvents.push(event);
        this.emit("events", this.getEvents());
        callbackLocalEcho();

        if (!this.isEncrypted()) {
            const resp = await fetch(`${this.hostname}/_matrix/client/v3/rooms/${this.roomID}/send/m.room.message/${event.unsigned?.transaction_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.client.accessToken}`
                },
                body: JSON.stringify(event.content)
            });
            if (!resp.ok) {
                this.deletePendingByEventID(event.event_id);
                throw new Error(`Failed to send message: ${resp.status} ${resp.statusText}`);
            }
            const json = await resp.json();
            this.deletePendingByEventID(event.event_id);
            return json.event_id;
        } else {
            console.log("Sending encrypted message2");
            await this.e2ee.getMissingSessions();
            await this.e2ee.shareKeysForRoom(this);
            const encrypted = await this.e2ee.encryptRoomEvent(
                new RoomId(this.roomID),
                "m.room.message",
                JSON.stringify(event.content)
            );
            const resp = await fetch(`${this.hostname}/_matrix/client/v3/rooms/${this.roomID}/send/m.room.encrypted/${event.unsigned?.transaction_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.client.accessToken}`
                },
                body: encrypted
            });
            if (!resp.ok) {
                this.deletePendingByEventID(event.event_id);
                throw new Error(`Failed to send message: ${resp.status} ${resp.statusText}`);
            }
            const json = await resp.json();
            this.deletePendingByEventID(event.event_id);
            return json.event_id;
        }
    }

    public getJoinedMemberIDs(): string[] {
        const members: string[] = [];
        this.stateEvents.forEach((event) => {
            if (event.type === "m.room.member" && event.content.membership === "join") {
                members.push(event.state_key);
            }
        });
        return members;
    }

    public getEncryptionSettings(): EncryptionSettings | undefined {
        let settings: EncryptionSettings | undefined = undefined;
        this.stateEvents.forEach((event) => {
            if (event.type === "m.room.encryption" && event.state_key === "") {
                if (!settings) {
                    settings = new EncryptionSettings();
                }
                settings.algorithm = event.content.algorithm === "m.megolm.v1.aes-sha2" ? EncryptionAlgorithm.MegolmV1AesSha2 : EncryptionAlgorithm.OlmV1Curve25519AesSha2;
                if (event.content.rotation_period_ms) {
                    settings.rotationPeriod = BigInt(event.content.rotation_period_ms);
                }
                if (event.content.rotation_period_msgs) {
                    settings.rotationPeriodMessages = BigInt(event.content.rotation_period_msgs);
                }
            }
            if (event.type === "m.room.history_visibility" && event.state_key === "") {
                if (!settings) {
                    settings = new EncryptionSettings();
                }
                settings.historyVisibility = event.content.history_visibility;
            }
        });
        if (settings) {
            (settings as EncryptionSettings).onlyAllowTrustedDevices = false;
        }
        return settings;
    }

    public isJoined(): boolean {
        let isJoined: boolean = false;
        this.stateEvents.forEach((event) => {
            if (event.type === "m.room.member" && event.state_key === this.client.mxid) {
                isJoined = event.content.membership === "join";
            }
        });
        return isJoined;
    }
}

export function useEvents(room?: Room) {
    const [events, setEvents] = useState<IRoomEvent[]>(room?.getEvents() || []);

    useEffect(() => {
        if (room) {
            setEvents(room?.getEvents() || []);
            // Listen for event updates
            const listenForEvents = (events: IRoomEvent[]) => {
                setEvents(events);
            };
            room.on("events", listenForEvents);
            return () => {
                room.off("events", listenForEvents);
            }
        } else {
            setEvents([]);
        }
    }, [room])
    return events;
}

export function useStateEvents(room?: Room) {
    const [events, setEvents] = useState<IRoomStateEvent[]>(room?.getStateEvents() || []);

    useEffect(() => {
        if (room) {
            setEvents(room?.getStateEvents() || []);
            // Listen for event updates
            const listenForStateEvents = (events: IRoomStateEvent[]) => {
                setEvents(events);
            };
            room.on("state_events", listenForStateEvents);
            return () => {
                room.off("state_events", listenForStateEvents);
            }
        } else {
            setEvents([]);
        }
    }, [room])
    return events;
}