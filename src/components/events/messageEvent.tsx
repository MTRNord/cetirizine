import { memo, useContext, useEffect, useState } from "react";
import { IRoomEvent, isRoomMessageImageEvent, isRoomMessageTextEvent } from "../../app/sdk/api/apiTypes";
import { FC } from "react";
import Avatar from "../avatar/avatar";
import { MatrixContext, useRoom } from "../../app/sdk/client";
import Linkify from "linkify-react";
import DOMPurify from "dompurify";
import { UndecryptableEvent } from "./unknownEvent";
import { decryptAttachment } from "matrix-encrypt-attachment";

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
    className: "text-blue-500 hover:text-blue-700 active:text-blue-700 visited:text-blue-500"
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
        } else if (isRoomMessageImageEvent(event)) {
            const client = useContext(MatrixContext);
            const [url, setUrl] = useState<string | undefined>(undefined);
            const [unableToDecrypt, setUnableToDecrypt] = useState<boolean>(event.content.file !== undefined);

            const decryptImage = (event: IRoomEvent) => {
                console.log("Downloading image:", event.event_id);
                fetch(client.convertMXC(event.content.file.url), {
                    headers: {
                        Authorization: `Bearer ${client.accessToken}`
                    }
                }).then((response) => {
                    if (!response.ok) {
                        // TODO: display error?
                        console.log("Unable to decrypt image:", response.text());
                        return;
                    }
                    console.log("Downloaded image:", event.event_id);
                    response.arrayBuffer().then((responseData) => {
                        // Decrypt the array buffer using the information taken from the event content.
                        decryptAttachment(responseData, event.content.file).then((dataArray) => {
                            // Turn the array into a Blob and give it the correct MIME-type.

                            // IMPORTANT: we must not allow scriptable mime-types into Blobs otherwise
                            // they introduce XSS attacks if the Blob URI is viewed directly in the
                            // browser (e.g. by copying the URI into a new tab or window.)
                            // See warning at top of file.
                            let mimetype = event.content.info?.mimetype ? event.content.info.mimetype.split(";")[0].trim() : "";
                            mimetype = getBlobSafeMimeType(mimetype);

                            const blob = new Blob([dataArray], { type: mimetype });
                            setUrl(URL.createObjectURL(blob));
                            setUnableToDecrypt(false);
                            console.log("Decrypted image:", event.event_id);
                        }).catch((e: any) => {
                            console.log("Unable to decrypt image due to decryption error:", e);
                            setUnableToDecrypt(true);
                        });
                    });
                });
            }

            useEffect(() => {
                if (isRoomMessageImageEvent(event)) {
                    if (event.content.url) {
                        setUrl(client.convertMXC(event.content.url));
                    } else {
                        // Image is encrypted and we need to download and decrypt it
                        if (event.content.file) {
                            decryptImage(event);
                        }
                    }
                }
            }, [event])

            if (unableToDecrypt) {
                return (<UndecryptableEvent event={event} roomID={roomID} hasPreviousEvent={hasPreviousEvent} />)
            }

            return (
                <div className={!hasPreviousEvent ? "flex flex-row gap-4 p-2 pb-1 hover:bg-gray-200 rounded-md duration-200 ease-in-out items-start" : "flex flex-row p-2 pb-1 pt-1 hover:bg-gray-200 rounded-md duration-200 ease-in-out"}>
                    {!hasPreviousEvent && <Avatar
                        displayname={room?.getMemberName(event.sender) || ""}
                        avatarUrl={room?.getMemberAvatar(event.sender)}
                        online={room?.isOnline() || false}
                        dm={room?.isDM() || false}
                    />}
                    <div className={!hasPreviousEvent ? "flex flex-col gap-1" : "ml-[3.7rem]"}>
                        {!hasPreviousEvent && <h2 className="text-sm font-medium text-red-500 whitespace-normal">{room?.getMemberName(event.sender)}</h2>}
                        {/* TODO: Loading circle while image is loading */}
                        <img
                            src={url}
                            alt={event.content.body}
                            title={event.content.body}
                            className="rounded-md object-cover border-slate-400 border-2 max-h-[512px] max-w-[512px] h-[unset]"
                        />
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
    }

    return renderCorrectMessage(event);
});

export default MessageEvent;


// WARNING: We have to be very careful about what mime-types we allow into blobs,
// as for performance reasons these are now rendered via URL.createObjectURL()
// rather than by converting into data: URIs.
//
// This means that the content is rendered using the origin of the script which
// called createObjectURL(), and so if the content contains any scripting then it
// will pose a XSS vulnerability when the browser renders it.  This is particularly
// bad if the user right-clicks the URI and pastes it into a new window or tab,
// as the blob will then execute with access to Element's full JS environment(!)
//
// See https://github.com/matrix-org/matrix-react-sdk/pull/1820#issuecomment-385210647
// for details.
//
// We mitigate this by only allowing mime-types into blobs which we know don't
// contain any scripting, and instantiate all others as application/octet-stream
// regardless of what mime-type the event claimed.  Even if the payload itself
// is some malicious HTML, the fact we instantiate it with a media mimetype or
// application/octet-stream means the browser doesn't try to render it as such.
//
// One interesting edge case is image/svg+xml, which empirically *is* rendered
// correctly if the blob is set to the src attribute of an img tag (for thumbnails)
// *even if the mimetype is application/octet-stream*.  However, empirically JS
// in the SVG isn't executed in this scenario, so we seem to be okay.
//
// Tested on Chrome 65 and Firefox 60
//
// The list below is taken mainly from
// https://developer.mozilla.org/en-US/docs/Web/HTML/Supported_media_formats
// N.B. Matrix doesn't currently specify which mimetypes are valid in given
// events, so we pick the ones which HTML5 browsers should be able to display
//
// For the record, mime-types which must NEVER enter this list below include:
//   text/html, text/xhtml, image/svg, image/svg+xml, image/pdf, and similar.

const ALLOWED_BLOB_MIMETYPES = [
    "image/jpeg",
    "image/gif",
    "image/png",
    "image/apng",
    "image/webp",
    "image/avif",

    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",

    "audio/mp4",
    "audio/webm",
    "audio/aac",
    "audio/mpeg",
    "audio/ogg",
    "audio/wave",
    "audio/wav",
    "audio/x-wav",
    "audio/x-pn-wav",
    "audio/flac",
    "audio/x-flac",
];

export function getBlobSafeMimeType(mimetype: string): string {
    if (!ALLOWED_BLOB_MIMETYPES.includes(mimetype)) {
        return "application/octet-stream";
    }
    return mimetype;
}