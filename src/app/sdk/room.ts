import { IRoomEvent, IRoomStateEvent, isRoomAvatarEvent, isRoomCreateEvent, isRoomTopicEvent, isSpaceChildEvent, isSpaceParentEvent } from "./api/apiTypes";

export class Room {
    private events: IRoomEvent[] = [];
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


    constructor(public roomID: string, private hostname: string) { }

    public addEvents(events: IRoomEvent[]) {
        // if the event id is already known then we update the event instead of pushing it on to the Array
        events.forEach((newEvent) => {
            const index = this.events.findIndex((oldEvent) => oldEvent.event_id === newEvent.event_id);
            if (index !== -1) {
                this.events[index] = newEvent;
            } else {
                this.events.push(newEvent);
            }
        });
    }

    public addStateEvents(state: IRoomStateEvent[]) {
        // if the state event id is already known then we update the event instead of pushing it on to the Array
        state.forEach((newEvent) => {
            const index = this.stateEvents.findIndex((oldEvent) => oldEvent.event_id === newEvent.event_id);
            if (index !== -1) {
                this.stateEvents[index] = newEvent;
            } else {
                this.stateEvents.push(newEvent);
            }
        });
    }

    public getStateEvents(): IRoomStateEvent[] {
        return this.stateEvents;
    }

    public getAvatarURL(): string | undefined {
        let avatarURL: string | undefined = undefined;
        this.stateEvents.forEach((event) => {
            if (isRoomAvatarEvent(event)) {
                const rawAvatarURL = event.content.url;
                if (rawAvatarURL?.startsWith("mxc://")) {
                    avatarURL = `${this.hostname}/_matrix/media/r0/download/${rawAvatarURL.substring(6)}`;
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

    public setName(name: string) {
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

    public setNotificationCount(count: number) {
        this.notification_count = count;
    }

    public getNotificationCount(): number {
        return this.notification_count;
    }

    public setNotificationHighlightCount(count: number) {
        this.notification_highlight_count = count;
    }

    public getNotificationHighlightCount(): number {
        return this.notification_highlight_count;
    }

    public setJoinedCount(count: number) {
        this.joined_count = count;
    }

    public getJoinedCount(): number {
        return this.joined_count;
    }

    public setInvitedCount(count: number) {
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

    public setDM(isDM: boolean) {
        this.is_dm = isDM;
    }

    public isDM(): boolean {
        return this.is_dm;
    }

    public isOnline(): boolean {
        // TODO: Implement this
        return false;
    }

    public getEvents(): IRoomEvent[] {
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

    public getMemberAvatar(userID: string): string | undefined {
        let avatarURL: string | undefined = undefined;
        this.stateEvents.forEach((event) => {
            if (event.type === "m.room.member") {
                if (event.state_key === userID && event.content.membership == "join") {
                    const rawAvatarURL = event.content.avatar_url;
                    if (rawAvatarURL?.startsWith("mxc://")) {
                        avatarURL = `${this.hostname}/_matrix/media/r0/download/${rawAvatarURL.substring(6)}`;
                    }
                }
            }
        });
        return avatarURL;
    }
}