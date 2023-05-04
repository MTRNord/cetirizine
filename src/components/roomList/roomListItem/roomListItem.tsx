import { useInView } from "react-intersection-observer";
import Avatar from "../../avatar/avatar";
import { FC, memo, useContext } from "react";
import { MatrixContext } from "../../../app/sdk/client";

type RoomListItemProps = {
    /**
     * Room id
     */
    roomId: string
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
     * The onClick handler
     */
    onClick: () => void;
    /**
     * If room is hidden
     */
    hidden: boolean
};

const RoomListItem: FC<RoomListItemProps> = memo(({ roomId, avatarUrl, displayname, dm = false, online = false, active = false, onClick, hidden }: RoomListItemProps) => {
    const matrixClient = useContext(MatrixContext);
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
        skip: hidden,
        onChange(inView) {
            if (inView) {
                matrixClient.addInViewRoom(roomId)
            } else {
                matrixClient.removeInViewRoom(roomId)
            }
        },
    });
    return (
        <div ref={ref} onClick={onClick} className="w-full cursor-pointer">
            {
                inView && (active ? (
                    <div className="flex flex-row gap-2 p-1 bg-gray-300 hover:bg-gray-400 rounded-lg duration-200 ease-in-out items-center">
                        <Avatar avatarUrl={avatarUrl} displayname={displayname} dm={dm} online={online} />
                        <span title={displayname} className='text-slate-900 font-normal text-base max-w-[32ch] overflow-hidden text-ellipsis w-full whitespace-nowrap'>{displayname}</span>
                    </div>
                ) : (
                    <div className="flex flex-row gap-2 p-1 hover:bg-gray-300 rounded-lg duration-200 ease-in-out items-center">
                        <Avatar avatarUrl={avatarUrl} displayname={displayname} dm={dm} online={online} />
                        <span title={displayname} className='text-slate-900 font-normal text-base max-w-[32ch] overflow-hidden text-ellipsis w-full whitespace-nowrap'>{displayname}</span>
                    </div>
                ))
            }
        </div>
    );
})

export default RoomListItem