import { memo } from "react";
import { IRoomEvent, isRoomMessageTextEvent } from "../../app/sdk/api/apiTypes";
import { FC } from "react";
import Avatar from "../avatar/avatar";
import { useRoom } from "../../app/sdk/client";
import Linkify from "linkify-react";
import DOMPurify from "dompurify";

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
    /**
     * Reactions to the event
     */
    reactions?: IRoomEvent[];
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
                const sanitized = DOMPurify.sanitize(event.content.formatted_body!, {
                    ADD_TAGS: [
                        "font",
                        "del",
                        "h1",
                        "h2",
                        "h3",
                        "h4",
                        "h5",
                        "h6",
                        "blockquote",
                        "p",
                        "a",
                        "ul",
                        "ol",
                        "sup",
                        "sub",
                        "li",
                        "b",
                        "i",
                        "u",
                        "strong",
                        "em",
                        "strike",
                        "code",
                        "hr",
                        "br",
                        "div",
                        "table",
                        "thead",
                        "tbody",
                        "tr",
                        "th",
                        "td",
                        "caption",
                        "pre",
                        "span",
                        "img",
                        "details",
                        "summary"
                    ]
                })
                // TODO: sanitize the attributes allowed by matrix spec

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
                            {/* TODO: Fixme */}
                            <p className="whitespace-normal text-black text-base font-normal" dangerouslySetInnerHTML={{ __html: sanitized }}></p>
                        </div>
                    </div>
                )
            } else {
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
                            <Linkify options={linkifyOptions} as='p' className="whitespace-normal text-black text-base font-normal">{event.content.body}</Linkify>
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