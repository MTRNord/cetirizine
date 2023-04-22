type Room = {
    /**
     * The URL of the Avatar image
     */
    avatarUrl?: string
    /**
     * The displayname of the room list item
     */
    displayname: string
    /**
     * Wether it is a DM or not
     */
    dm: boolean
    /**
     * Wether the user is online. Only used if dm is true.
     */
    online: boolean
    /**
     * Wether the current room is selected
     */
    active: boolean
    /**
     * The roomid of the Room
     */
    roomID: string
};

type Section = {
    /**
     * Section Name. Can be a Space or a Tag
     */
    sectionName: string
    /**
     * The Rooms within the Section
     */
    rooms: Room[]
    /**
     * The Subsections of the Section
     */
    subsections: Section[]
}

type RoomListProps = {
    /**
     * The Sections available
     */
    sections: Section[]
    /**
     * Rooms outside of any Sections
     */
    rooms: Room[]
};

export default function RoomList({ sections, rooms }: RoomListProps) {
    return (
        <div>
            
        </div>
    );
}