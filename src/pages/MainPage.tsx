import { Settings } from 'lucide-react';
import Avatar from '../components/avatar/avatar';
import ChatInput from '../components/input/chat/input';
import RoomList, { Section } from '../components/roomList/roomList';
import './MainPage.scss';
import { useProfile, useRoom, useRooms, useSpaces } from '../app/sdk/client';
import { Room } from '../app/sdk/room';
import { FC, memo, useContext, useState } from 'react';
import { MatrixContext } from '../app/sdk/client';
import { useParams } from 'react-router-dom';
import { $generateHtmlFromNodes } from '@lexical/html';
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import MessageEvent from '../components/events/messageEvent';
import UnknownEvent from '../components/events/unknownEvent';
import MemberEvent from '../components/events/memberEvent';
import { IRoomEvent } from '../app/sdk/api/apiTypes';

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
};

const ChatView: FC<ChatViewProps> = memo(({ roomID }) => {
    const room = useRoom(decodeURIComponent(roomID || ""));
    const events = room?.getEvents();

    // Render events based on the event type and content
    const renderEvent = (event: IRoomEvent, previousEventIsFromSameSender: boolean, previousEventType: string) => {
        switch (event.type) {
            case "m.room.message":
                return <MessageEvent event={event} roomID={roomID} key={event.event_id} />
            case "m.room.member":
                return <MemberEvent event={event} key={event.event_id} />
            case "m.room.redaction":
                return <></>;
            default:
                return <UnknownEvent event={event} key={event.event_id} />
        }
    }

    const dedupedEvents = events?.filter((event, index, self) => {
        return self.findIndex(e => e.event_id === event.event_id) === index;
    });

    // Map events to components but also tell components if the previous event was from the same sender and which type it was
    const renderedEvents = dedupedEvents?.map((event, index) => {
        const previousEvent = dedupedEvents[index - 1];
        const previousEventIsFromSameSender = previousEvent?.sender === event.sender;
        const previousEventType = previousEvent?.type;
        return renderEvent(event, previousEventIsFromSameSender, previousEventType);
    });
    return <div className='max-w-[130ch] flex flex-col gap-2'>{renderedEvents}</div>;
});


const MainPage = memo(() => {
    const profile = useProfile();
    const spacesWithRooms = useSpaces();
    const rooms = useRooms();
    const client = useContext(MatrixContext);
    let params = useParams();
    const room = useRoom(decodeURIComponent(params.roomIdOrAlias || ""));

    const [htmlMessage, setHtmlMessage] = useState<string>("");
    const [plainMessage, setPlainMessage] = useState<string>("");

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
        {room && <div className='flex-1 flex flex-col'>
            <div className='pb-2 flex flex-row items-center border-b-2 mt-4 ml-2'>
                <Avatar displayname={room.getName()} avatarUrl={room.getAvatarURL()} dm={room.isDM()} online={room.isOnline()} />
                <div className='flex flex-row items-center'>
                    <h1 className='text-black font-semibold text-lg flex-shrink-0'>{room.getName()}</h1>
                    <p className='ml-4 text-slate-700 font-normal text-base'>{room.getTopic()}</p>
                </div>
            </div>
            <div className='overflow-y-auto overflow-x-hidden scrollbarSmall mr-2 my-1 flex-1 w-full flex flex-col-reverse'>
                <ChatView roomID={params.roomIdOrAlias} />
            </div>
            <ChatInput namespace='Editor' onChange={(editorState, editor) => {
                // Convert editor state to both html and markdown.
                // If there is no formatting then just use the plain text.
                editorState.read(() => {
                    const html = $generateHtmlFromNodes(editor);
                    // TODO: Make sure that we strip any non matrix stuff
                    setHtmlMessage(html);
                    console.log(html);
                    const markdown = $convertToMarkdownString(TRANSFORMERS);
                    setPlainMessage(markdown);
                    console.log(markdown);
                });
                // TODO: we need some send button
            }} onError={(e) => console.error(e)} />
        </div>}
    </div >
})

export default MainPage;