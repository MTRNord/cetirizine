import { useInView } from "react-intersection-observer";
import Avatar from "../../avatar/avatar";
import { FC, memo, useContext } from "react";
import { MatrixContext, useRoom } from "../../../app/sdk/client";
import { OnlineState } from "../../../app/sdk/api/otherEnums";
import "./roomListItem.scss";

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
    online: OnlineState
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

const RoomListItem: FC<RoomListItemProps> = memo(({ roomId, avatarUrl, displayname, dm = false, online = OnlineState.Unknown, active = false, onClick, hidden }: RoomListItemProps) => {
    const matrixClient = useContext(MatrixContext);
    const room = useRoom(roomId);
    const { ref, inView } = useInView({
        triggerOnce: true,
        skip: hidden,
        threshold: 1,
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
                        <Avatar avatarUrl={avatarUrl} displayname={displayname} dm={dm} online={online} isBot={false} />
                        <span title={displayname} className='text-slate-900 font-normal text-base max-w-[32ch] overflow-hidden text-ellipsis w-full whitespace-nowrap'>{displayname}</span>
                        {(room?.getNotificationHighlightCount() !== 0 || room?.getNotificationCount() !== 0) && (room?.getNotificationHighlightCount() === 0 ?
                            <div className="notificationCount">{room?.getNotificationCount()}</div>
                            : <div className="notificationCount higlight">{room?.getNotificationCount() ?? 0 + (room?.getNotificationHighlightCount() ?? 0)}</div>)}
                    </div>
                ) : (
                    <div className="flex flex-row gap-2 p-1 hover:bg-gray-300 rounded-lg duration-200 ease-in-out items-center">
                        <Avatar avatarUrl={avatarUrl} displayname={displayname} dm={dm} online={online} isBot={false} />
                        <span title={displayname} className='text-slate-900 font-normal text-base max-w-[32ch] overflow-hidden text-ellipsis w-full whitespace-nowrap'>{displayname}</span>
                        {(room?.getNotificationHighlightCount() !== 0 || room?.getNotificationCount() !== 0) && (room?.getNotificationHighlightCount() === 0 ?
                            <div className="notificationCount">{room?.getNotificationCount()}</div>
                            : <div className="notificationCount higlight">{room?.getNotificationCount() ?? 0 + (room?.getNotificationHighlightCount() ?? 0)}</div>)}
                    </div>
                ))
            }
        </div>
    );
})

export default RoomListItem