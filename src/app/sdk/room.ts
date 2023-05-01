export class Room {
    private events: any[] = [];
    private name: string = "Unknown Room";

    private notification_count: number = 0;
    private notification_highlight_count: number = 0;
    private joined_count: number = 0;
    private invited_count: number = 0;


    constructor(public roomID: string) { }

    public addEvent(event: any) {
        this.events.push(event);
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
}