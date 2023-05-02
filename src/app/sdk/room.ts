import { IRoomEvent, IRoomStateEvent, isRoomAvatarEvent, isRoomCreateEvent, isSpaceChildEvent, isSpaceParentEvent } from "./api/apiTypes";

export class Room {
    private events: IRoomEvent[] = [];
    private stateEvents: IRoomStateEvent[] = [];
    private name: string = "Unknown Room";

    private notification_count: number = 0;
    private notification_highlight_count: number = 0;
    private joined_count: number = 0;
    private invited_count: number = 0;


    constructor(public roomID: string, private hostname: string) { }

    public addEvents(events: IRoomEvent[]) {
        this.events.push(...events);
    }

    public addStateEvents(state: IRoomStateEvent[]) {
        this.stateEvents.push(...state);
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
            isSpace = isRoomCreateEvent(event) && event.content.type === "m.space";
        });
        return isSpace;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
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

    public isDM(): boolean {
        // TODO: Implement this
        return false;
    }

    public isOnline(): boolean {
        // TODO: Implement this
        return false;
    }
}