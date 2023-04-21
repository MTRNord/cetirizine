import Avatar from "../../avatar/avatar";

type RoomListItemProps = {
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
};

export default function RoomListItem({ avatarUrl, displayname, dm = false, online = false, active = false }: RoomListItemProps) {
    if (!active) {
        return (
            <div className="flex flex-row gap-2 p-1 hover:bg-gray-300 hover:rounded duration-150 ease-in items-center">
                <Avatar avatarUrl={avatarUrl} displayname={displayname} dm={dm} online={online} />
                <span className='text-black font-normal text-xl capitalize'>{displayname}</span>
            </div>
        );
    } else {
        return (
            <div className="flex flex-row gap-2 p-1 bg-gray-300 rounded duration-150 ease-in items-center">
                <Avatar avatarUrl={avatarUrl} displayname={displayname} dm={dm} online={online} />
                <span className='text-black font-normal text-xl capitalize'>{displayname}</span>
            </div>
        );
    }
}