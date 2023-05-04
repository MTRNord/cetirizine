import { memo } from "react";
import { IRoomEvent, isRoomMessageTextEvent } from "../../app/sdk/api/apiTypes";
import { FC } from "react";
import Avatar from "../avatar/avatar";
import { useRoom } from "../../app/sdk/client";
import Linkify from "linkify-react";

type MessageEventProps = {
    /**
     * The event to render
     */
    event: IRoomEvent;
    /**
     * The roomID of the event to display
     */
    roomID?: string;
    /**
     * If the previous event was sent by the same user
     */
    hasPreviousEvent?: boolean;
};

const linkifyOptions = {
    defaultProtocol: "https",
    rel: "noopener",
    target: "_blank",
}

const MessageEvent: FC<MessageEventProps> = memo(({ event, roomID, hasPreviousEvent }) => {
    const room = useRoom(roomID);

    const renderCorrectMessage = (event: IRoomEvent) => {
        if (isRoomMessageTextEvent(event)) {
            if (event.content.format === "org.matrix.custom.html") {
                // TODO: Sanitize HTML
                return (
                    <div className={!hasPreviousEvent ? "flex flex-row gap-4 p-2 pb-1 hover:bg-gray-200 rounded-md duration-200 ease-in-out" : "flex flex-row p-2 pt-0 hover:bg-gray-200 rounded-md duration-200 ease-in-out"}>
                        {!hasPreviousEvent && <Avatar
                            displayname={room?.getMemberName(event.sender) || ""}
                            avatarUrl={room?.getMemberAvatar(event.sender)}
                            online={room?.isOnline() || false}
                            dm={room?.isDM() || false}
                        />}
                        <div className={!hasPreviousEvent ? "flex flex-col gap-1" : "ml-[3.7rem]"}>
                            {!hasPreviousEvent && <h2 className="text-sm font-medium text-red-500 whitespace-normal">{room?.getMemberName(event.sender)}</h2>}
                            {/* TODO: Fixme */}
                            <p className="whitespace-normal" dangerouslySetInnerHTML={{ __html: event.content.formatted_body! }}></p>
                        </div>
                    </div>
                )
            } else {
                return (
                    <div className="flex flex-row gap-4 p-2 hover:bg-gray-200 rounded-md duration-200 ease-in-out">
                        <Avatar
                            displayname={room?.getMemberName(event.sender) || ""}
                            avatarUrl={room?.getMemberAvatar(event.sender)}
                            online={room?.isOnline() || false}
                            dm={room?.isDM() || false}
                        />
                        <div className="flex flex-col gap-2">
                            <h2 className="text-sm font-medium text-red-500 whitespace-normal">{room?.getMemberName(event.sender)}</h2>
                            <Linkify options={linkifyOptions} as='p' className="whitespace-normal">{event.content.body}</Linkify>
                        </div>
                    </div>
                )
            }
        } else {
            return (
                <p>{event.content.body}</p>
            )
        }
    }

    return renderCorrectMessage(event);
});

export default MessageEvent;