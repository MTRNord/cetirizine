import { memo } from "react";
import { IRoomEvent } from "../../app/sdk/api/events";
import { FC } from "react";
import Linkify from "linkify-react";
import { OnlineState } from "../../app/sdk/api/otherEnums";
import { Room } from "../../app/sdk/room";
import { MessageWrapper } from "./wrapper";

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
        <MessageWrapper
            displayname={room?.getMemberName(event.sender) || event.sender}
            avatar_url={room?.getMemberAvatar(event.sender) || ""}
            onlineState={room?.presence || OnlineState.Unknown}
            isBot={room?.isBot(event.sender) || false}
            dm={room?.isDM() || false}
            hasPreviousEvent={hasPreviousEvent}
        >
            <Linkify options={linkifyOptions} as='p' className="whitespace-break-spaces text-black text-base font-normal">{JSON.stringify(event, null, 4)}</Linkify>
        </MessageWrapper>
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
        <MessageWrapper
            displayname={room?.getMemberName(event.sender) || event.sender}
            avatar_url={room?.getMemberAvatar(event.sender) || ""}
            onlineState={room?.presence || OnlineState.Unknown}
            isBot={room?.isBot(event.sender) || false}
            dm={room?.isDM() || false}
            hasPreviousEvent={hasPreviousEvent}
        >
            <Linkify options={linkifyOptions} as='p' className="whitespace-pre-wrap text-base font-normal text-orange-600">Unable to decrypt event</Linkify>
        </MessageWrapper>
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
        <MessageWrapper
            displayname={room?.getMemberName(event.sender) || event.sender}
            avatar_url={room?.getMemberAvatar(event.sender) || ""}
            onlineState={room?.presence || OnlineState.Unknown}
            isBot={room?.isBot(event.sender) || false}
            dm={room?.isDM() || false}
            hasPreviousEvent={hasPreviousEvent}
        >
            {redacted_because && <p className="whitespace-pre-wrap text-base font-normal text-blue-600 italic">Message was redacted: {redacted_because}</p>}
            {!redacted_because && <p className="whitespace-pre-wrap text-base font-normal text-blue-600 italic">Message was redacted</p>}
        </MessageWrapper>
    )
});

