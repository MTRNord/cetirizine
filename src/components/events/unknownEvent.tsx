import { memo } from "react";
import { IRoomEvent } from "../../app/sdk/api/apiTypes";
import { FC } from "react";
import { useRoom } from "../../app/sdk/client";
import Linkify from "linkify-react";
import Avatar from "../avatar/avatar";

type UnknownEventProps = {
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
    className: "text-blue-500 hover:text-blue-700 active:text-blue-700 visited:text-blue-500"
}

const UnknownEvent: FC<UnknownEventProps> = memo(({ event, roomID, hasPreviousEvent }) => {
    const room = useRoom(roomID);

    return (
        <div className={!hasPreviousEvent ? "flex flex-row gap-4 p-2 pb-1 hover:bg-gray-200 rounded-md duration-200 ease-in-out items-start" : "flex flex-row p-2 pb-1 pt-0 hover:bg-gray-200 rounded-md duration-200 ease-in-out"}>
            {!hasPreviousEvent && <Avatar
                displayname={room?.getMemberName(event.sender) || ""}
                avatarUrl={room?.getMemberAvatar(event.sender)}
                online={room?.isOnline() || false}
                dm={room?.isDM() || false}
            />}
            <div className={!hasPreviousEvent ? "flex flex-col gap-1" : "ml-[3.7rem]"}>
                {!hasPreviousEvent && <h2 className="text-sm font-medium text-red-500 whitespace-normal">{room?.getMemberName(event.sender)}</h2>}
                <Linkify options={linkifyOptions} as='p' className="whitespace-break-spaces text-black text-base font-normal">{JSON.stringify(event, null, 4)}</Linkify>
            </div>
        </div>
    )
});

export default UnknownEvent;

type UndecryptableEventProps = {
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

export const UndecryptableEvent: FC<UndecryptableEventProps> = memo(({ event, roomID, hasPreviousEvent }) => {
    const room = useRoom(roomID);

    return (
        <div className={!hasPreviousEvent ? "flex flex-row gap-4 p-2 pb-1 hover:bg-gray-200 rounded-md duration-200 ease-in-out items-start" : "flex flex-row p-2 pb-1 pt-0 hover:bg-gray-200 rounded-md duration-200 ease-in-out"}>
            {!hasPreviousEvent && <Avatar
                displayname={room?.getMemberName(event.sender) || ""}
                avatarUrl={room?.getMemberAvatar(event.sender)}
                online={room?.isOnline() || false}
                dm={room?.isDM() || false}
            />}
            <div className={!hasPreviousEvent ? "flex flex-col gap-1" : "ml-[3.7rem]"}>
                {!hasPreviousEvent && <h2 className="text-sm font-medium text-red-500 whitespace-normal">{room?.getMemberName(event.sender)}</h2>}
                <Linkify options={linkifyOptions} as='p' className="whitespace-normal text-base font-normal text-orange-600">Unable to decrypt event</Linkify>
            </div>
        </div>
    )
});

type RedactedEventProps = {
    /**
     * The original event
     */
    event: IRoomEvent;
    /**
     * The event to render
     */
    redacted_because?: string;
    /**
     * The roomID of the event to display
     */
    roomID?: string;
    /**
     * If the previous event was sent by the same user
     */
    hasPreviousEvent?: boolean;
};

export const RedactedEvent: FC<RedactedEventProps> = memo(({ event, redacted_because, roomID, hasPreviousEvent }) => {
    const room = useRoom(roomID);

    return (
        <div className={!hasPreviousEvent ? "flex flex-row gap-4 p-2 pb-1 hover:bg-gray-200 rounded-md duration-200 ease-in-out items-start" : "flex flex-row p-2 pb-1 pt-0 hover:bg-gray-200 rounded-md duration-200 ease-in-out"}>
            {!hasPreviousEvent && <Avatar
                displayname={room?.getMemberName(event.sender) || ""}
                avatarUrl={room?.getMemberAvatar(event.sender)}
                online={room?.isOnline() || false}
                dm={room?.isDM() || false}
            />}
            <div className={!hasPreviousEvent ? "flex flex-col gap-1" : "ml-[3.7rem]"}>
                {!hasPreviousEvent && <h2 className="text-sm font-medium text-red-500 whitespace-normal">{room?.getMemberName(event.sender)}</h2>}
                {redacted_because && <p className="whitespace-normal text-base font-normal text-blue-600 italic">{redacted_because}</p>}
                <p className="whitespace-normal text-base font-normal text-blue-600 italic">Message was redacted</p>
            </div>
        </div>
    )
});

