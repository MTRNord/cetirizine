import { memo } from "react";
import { IRoomEvent } from "../../app/sdk/api/events";
import { FC } from "react";
import Linkify from "linkify-react";
import Avatar from "../avatar/avatar";
import { OnlineState } from "../../app/sdk/api/otherEnums";
import { Room } from "../../app/sdk/room";

type UnknownEventProps = {
    /**
     * The event to render
     */
    event: IRoomEvent;
    /**
     * The room of the event to display
     */
    room?: Room;
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

const UnknownEvent: FC<UnknownEventProps> = memo(({ event, room, hasPreviousEvent }) => {
    return (
        <div className={!hasPreviousEvent ? "flex flex-row gap-4 p-2 pb-1 hover:bg-gray-200 rounded-md duration-200 ease-in-out items-start" : "flex flex-row p-2 pb-1 pt-0 hover:bg-gray-200 rounded-md duration-200 ease-in-out"}>
            {!hasPreviousEvent && <Avatar
                displayname={room?.getMemberName(event.sender) || event.sender}
                avatarUrl={room?.getMemberAvatar(event.sender)}
                online={room?.presence || OnlineState.Unknown}
                dm={room?.isDM() || false}
            />}
            <div className={!hasPreviousEvent ? "flex flex-col gap-1" : "ml-[3.7rem]"}>
                {!hasPreviousEvent && <h2 className="text-xl font-medium text-red-500 whitespace-pre-wrap">{room?.getMemberName(event.sender) || event.sender}</h2>}
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
     * The room of the event to display
     */
    room?: Room;
    /**
     * If the previous event was sent by the same user
     */
    hasPreviousEvent?: boolean;
};

export const UndecryptableEvent: FC<UndecryptableEventProps> = memo(({ event, room, hasPreviousEvent }) => {
    return (
        <div className={!hasPreviousEvent ? "flex flex-row gap-4 p-2 pb-1 hover:bg-gray-200 rounded-md duration-200 ease-in-out items-start" : "flex flex-row p-2 pb-1 pt-0 hover:bg-gray-200 rounded-md duration-200 ease-in-out"}>
            {!hasPreviousEvent && <Avatar
                displayname={room?.getMemberName(event.sender) || event.sender}
                avatarUrl={room?.getMemberAvatar(event.sender)}
                online={room?.presence || OnlineState.Unknown}
                dm={room?.isDM() || false}
            />}
            <div className={!hasPreviousEvent ? "flex flex-col gap-1" : "ml-[3.7rem]"}>
                {!hasPreviousEvent && <h2 className="text-xl font-medium text-red-500 whitespace-pre-wrap">{room?.getMemberName(event.sender) || event.sender}</h2>}
                <Linkify options={linkifyOptions} as='p' className="whitespace-pre-wrap text-base font-normal text-orange-600">Unable to decrypt event</Linkify>
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
     * The room of the event to display
     */
    room?: Room;
    /**
     * If the previous event was sent by the same user
     */
    hasPreviousEvent?: boolean;
};

export const RedactedEvent: FC<RedactedEventProps> = memo(({ event, redacted_because, room, hasPreviousEvent }) => {
    return (
        <div className={!hasPreviousEvent ? "flex flex-row gap-4 p-2 pb-1 hover:bg-gray-200 rounded-md duration-200 ease-in-out items-start" : "flex flex-row p-2 pb-1 pt-0 hover:bg-gray-200 rounded-md duration-200 ease-in-out"}>
            {!hasPreviousEvent && <Avatar
                displayname={room?.getMemberName(event.sender) || event.sender}
                avatarUrl={room?.getMemberAvatar(event.sender)}
                online={room?.presence || OnlineState.Unknown}
                dm={room?.isDM() || false}
            />}
            <div className={!hasPreviousEvent ? "flex flex-col gap-1" : "ml-[3.7rem]"}>
                {!hasPreviousEvent && <h2 className="text-xl font-medium text-red-500 whitespace-pre-wrap">{room?.getMemberName(event.sender) || event.sender}</h2>}
                {redacted_because && <p className="whitespace-pre-wrap text-base font-normal text-blue-600 italic">Message was redacted: {redacted_because}</p>}
                {!redacted_because && <p className="whitespace-pre-wrap text-base font-normal text-blue-600 italic">Message was redacted</p>}
            </div>
        </div>
    )
});

