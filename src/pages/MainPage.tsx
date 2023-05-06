import { Settings } from 'lucide-react';
import Avatar from '../components/avatar/avatar';
import ChatInput from '../components/input/chat/input';
import RoomList, { Section } from '../components/roomList/roomList';
import './MainPage.scss';
import { useProfile, useRoom, useRooms, useSpaces } from '../app/sdk/client';
import { Room, useEvents } from '../app/sdk/room';
import { FC, memo, useContext, useEffect, useRef, useState } from 'react';
import { MatrixContext } from '../app/sdk/client';
import { useLocation, useParams } from 'react-router-dom';
import MessageEvent from '../components/events/messageEvent';
import UnknownEvent, { UndecryptableEvent } from '../components/events/unknownEvent';
import MemberEvent from '../components/events/memberEvent';
import { IRoomEvent, IRoomMemberEvent } from '../app/sdk/api/apiTypes';
import Linkify from 'linkify-react';
import { RoomId } from '@matrix-org/matrix-sdk-crypto-js';

type ChatViewProps = {
    /**
     * The roomID of the room to display
     * If the roomID is empty, the ChatView will be empty
     * If the roomID is invalid, the ChatView will be empty
     * If the roomID is valid, the ChatView will display the room
     * If the roomID is valid, but the room is not joined, the ChatView will display a placeholder
     * If the roomID is valid, but the room is not loaded, the ChatView will display a placeholder
     */
    roomID?: string
    /**
     * Ref of the Scroll Container
     */
    scrollRef: React.RefObject<HTMLDivElement>
};

const ChatView: FC<ChatViewProps> = memo(({ roomID, scrollRef }) => {
    const room = useRoom(decodeURIComponent(roomID || ""));
    const client = useContext(MatrixContext);
    const events = useEvents(room);
    const { pathname } = useLocation();
    const [renderedEvents, setRenderedEvents] = useState<JSX.Element[]>([]);

    // Map events to components but also tell components if the previous event was from the same sender and which type it was
    const renderEvents = (events: IRoomEvent[]) => {
        const dedupedEvents = events?.filter((event, index, self) => {
            return self.findIndex(e => e.event_id === event.event_id) === index;
        });


        Promise.all(dedupedEvents?.filter(event => event.type !== "m.reaction" && !event.content["m.relates_to"]).map(async (event, index) => {
            let previousEvent = dedupedEvents?.filter(event => event.type !== "m.reaction")[index - 1];
            const previousEventIsFromSameSender = previousEvent?.sender === event.sender;
            let previousEventType = previousEvent?.type;

            // Make a list of events which are reactions for the current event we want to render
            const reactions = dedupedEvents?.filter((e) => {
                return e.type === "m.reaction" && e.content["m.relates_to"].event_id === event.event_id;
            });

            // Check if there is an edit (m.relates_to with rel_type of "m.replace")
            const edit = dedupedEvents?.find((e) => {
                if (!e.content["m.relates_to"]) {
                    return false;
                }
                return e.content["m.relates_to"].rel_type === "m.replace" && e.content["m.relates_to"].event_id === event.event_id;
            });

            // If there is an edit, use the edited event instead of the original event
            if (edit) {
                event = edit;
                if (edit.content["m.new_content"]) {
                    event.content.body = edit.content["m.new_content"].body;
                    event.content.formatted_body = edit.content["m.new_content"].formatted_body;
                    event.content.format = edit.content["m.new_content"].format;
                }
            }


            // Decrypt the event if it is encrypte
            if (event.type === "m.room.encrypted") {
                try {
                    const decrypted_event = await client.olmMachine?.decryptRoomEvent(JSON.stringify(event), new RoomId(roomID || ""));
                    if (decrypted_event) {
                        event = JSON.parse(decrypted_event.event) as IRoomEvent;
                        if (event.content["m.new_content"]) {
                            event.content.body = event.content["m.new_content"].body;
                            event.content.formatted_body = event.content["m.new_content"].formatted_body;
                            event.content.format = event.content["m.new_content"].format;
                        }
                    } else {
                        return (<UndecryptableEvent event={event} hasPreviousEvent={previousEventIsFromSameSender} roomID={roomID}></UndecryptableEvent>)
                    }
                } catch (e: any) {
                    console.error(e);
                    return (<UndecryptableEvent event={event} hasPreviousEvent={previousEventIsFromSameSender} roomID={roomID}></UndecryptableEvent>)
                }
            }

            // Decrypt previousEvent if it is encrypted
            if (previousEvent?.type === "m.room.encrypted") {
                try {
                    const decrypted_event = await client.olmMachine?.decryptRoomEvent(JSON.stringify(previousEvent), new RoomId(roomID || ""));
                    if (decrypted_event) {
                        previousEvent = JSON.parse(decrypted_event.event) as IRoomEvent;
                        previousEventType = previousEvent.type;
                        if (previousEvent.content["m.new_content"]) {
                            previousEvent.content.body = previousEvent.content["m.new_content"].body;
                            previousEvent.content.formatted_body = previousEvent.content["m.new_content"].formatted_body;
                            previousEvent.content.format = previousEvent.content["m.new_content"].format;
                        }
                    }
                } catch (e: any) {
                    console.error(e);
                }
            }

            return renderEvent(event, previousEventIsFromSameSender, previousEventType, reactions);
        })).then((renderedEvents) => {
            setRenderedEvents(renderedEvents);
        });
    }

    useEffect(() => {
        if (events) {
            renderEvents(events);
        }
    }, [events]);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current?.scrollHeight);
    }, [pathname]);

    // Render events based on the event type and content
    const renderEvent = (event: IRoomEvent, previousEventIsFromSameSender: boolean, previousEventType: string, reactions: IRoomEvent[]) => {
        switch (event.type) {
            case "m.room.message":
                return <MessageEvent reactions={reactions} event={event} roomID={roomID} key={event.event_id} hasPreviousEvent={previousEventIsFromSameSender && previousEventType === "m.room.message"} />
            case "m.room.member":
                return <MemberEvent event={event as IRoomMemberEvent} key={event.event_id} />
            case "m.room.redaction":
                return <></>;
            default:
                return <UnknownEvent event={event} key={event.event_id} />
        }
    }

    return <div className='max-w-[130ch] flex flex-col'>{renderedEvents}</div>;
});


const MainPage = memo(() => {
    const profile = useProfile();
    const spacesWithRooms = useSpaces();
    const rooms = useRooms();
    const client = useContext(MatrixContext);
    let params = useParams();
    const room = useRoom(decodeURIComponent(params.roomIdOrAlias || ""));
    client.setCurrentRoom(params.roomIdOrAlias ? decodeURIComponent(params.roomIdOrAlias) : undefined)

    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter toplevel spaces.
    // A toplevel space is a space that is not a child of another space.
    // We can not rely only on the parent. We need to check in both directions.
    const toplevelSpaces = [...spacesWithRooms].filter(({ spaceRoom }) => {
        const not_a_child = ![...spacesWithRooms].some(({ children: otherChildren }) => {
            return [...otherChildren].some(room => room.roomID === spaceRoom.roomID);
        });
        // Also check if there are no parents set
        const no_parents = spaceRoom.getSpaceParentIDs().length === 0;
        return not_a_child && no_parents;
    });

    // Filter rooms which are not part of any space and are not a space.
    // A room is not part of any space if it is not a child of any space.
    // A room is not a space if it has not any space as parent.
    const leftOverRooms = [...rooms].filter(room => {
        const not_a_child = ![...spacesWithRooms].some(({ children }) => {
            return [...children].some(otherRoom => otherRoom.roomID === room.roomID);
        });
        const no_parents = room.getSpaceParentIDs().length === 0;
        const not_a_space = !room.isSpace();
        return not_a_child && no_parents && not_a_space;
    });

    // Generate a list of sections.
    // Each section apart from special toplevel ones is a space.
    // Each space has a list of rooms and subsections.
    // Each subsection has a list of rooms and subsections.
    // Subsections can nest infinitely.
    // Rooms are always within a section.
    // A section represents a space.
    // If a room is not within a space it is in the toplevel section "Other" which is at the end of the list.
    // The toplevel section "Other" is always present.
    // The toplevel section "Other" is always the last section.
    const sections = toplevelSpaces.map(space => {
        const rooms = [...space.children].filter(room => !room.isSpace()).map(room => {
            return {
                roomID: room.roomID,
                displayname: room.getName(),
                avatarUrl: room.getAvatarURL(),
                dm: room.isDM(),
                online: room.isOnline(),
            }
        });

        const generateSubsections = (subspace: Room): Section | undefined => {
            const subspaceMeta = [...spacesWithRooms].find(space => space.spaceRoom.roomID === subspace.roomID);
            if (subspaceMeta) {
                const rooms = [...subspaceMeta?.children].map(room => {
                    return {
                        roomID: room.roomID,
                        displayname: room.getName(),
                        avatarUrl: room.getAvatarURL(),
                        dm: room.isDM(),
                        online: room.isOnline(),
                    }
                });

                return {
                    sectionName: subspace.getName(),
                    rooms: rooms,
                    roomID: subspace.roomID,
                    subsections: [...subspaceMeta?.children]
                        .filter(room => room.isSpace()).map(generateSubsections)
                        .filter(section => section !== undefined) as Section[],
                }
            }
        }

        // Its a little weird sicne there are no children attached to the room object. Only to spacesWithRooms.
        // Each subsection can have further subsections and rooms.
        return {
            sectionName: space.spaceRoom.getName(),
            rooms: rooms,
            roomID: space.spaceRoom.roomID,
            subsections: [...space.children]
                .filter(room => room.isSpace())
                .map(generateSubsections),
        } as Section;
    });

    // Add the toplevel section "Other" to the end of the list.
    const otherRooms = leftOverRooms.filter(room => !room.isSpace()).map(room => {
        return {
            roomID: room.roomID,
            displayname: room.getName(),
            avatarUrl: room.getAvatarURL(),
            dm: room.isDM(),
            online: room.isOnline(),
        }
    });

    // Check and print if otherRooms has duplicates.
    const otherRoomsIDs = otherRooms.map(room => room.roomID);
    const otherRoomsDuplicates = otherRoomsIDs.filter((id, index) => otherRoomsIDs.indexOf(id) !== index);
    if (otherRoomsDuplicates.length > 0) {
        console.error('otherRooms has duplicates', otherRoomsDuplicates);
    }

    const linkifyOptions = {
        defaultProtocol: "https",
        rel: "noopener",
        target: "_blank",
        className: "text-blue-500 hover:text-blue-700 active:text-blue-700 visited:text-blue-500"
    }

    return <div className='flex flex-row gap-2 min-h-screen h-screen'>
        <div className='flex flex-col bg-gradient-to-br from-slate-100 via-gray-200 to-orange-200 border-r-[1px] border-slate-300'>
            <div className='flex flex-row gap-2 m-2 p-1 items-center border-b-2'>
                <Avatar displayname={profile.displayname || client.mxid!} avatarUrl={profile?.avatar_url} dm={false} online={false} />
                <div className='flex flex-row justify-between items-center w-full'>
                    <span className='text-base font-semibold'>{profile?.displayname}</span>
                    <Settings size={28} stroke='unset' className='stroke-slate-600 rounded-full hover:bg-slate-300 p-1 cursor-pointer' />
                </div>
            </div>
            <RoomList sections={sections} rooms={otherRooms} />
        </div>
        {
            room && <div className='flex-1 flex flex-col'>
                <div className='pb-2 flex flex-row items-center border-b-2 mt-4 ml-2'>
                    <Avatar displayname={room.getName()} avatarUrl={room.getAvatarURL()} dm={room.isDM()} online={room.isOnline()} />
                    <div className='flex flex-row items-start'>
                        <h1 className='text-black font-semibold text-lg flex-shrink-0'>{room.getName()}</h1>
                        <Linkify options={linkifyOptions} as='p' className="ml-4 text-slate-700 font-normal text-base line-clamp-2 text-ellipsis">{room.getTopic()}</Linkify>
                    </div>
                </div>
                <div ref={scrollRef} className='overflow-y-auto overflow-x-hidden scrollbarSmall mr-2 my-1 flex-1 w-full flex flex-col-reverse'>
                    <ChatView roomID={params.roomIdOrAlias} scrollRef={scrollRef} />
                </div>
                <ChatInput namespace='Editor' roomID={decodeURIComponent(params.roomIdOrAlias || "")} />
            </div>
        }
    </div >
})

export default MainPage;