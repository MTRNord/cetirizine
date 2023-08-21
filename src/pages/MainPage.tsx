import { Brush, Pencil, PersonStanding, Search, Settings, User, X } from 'lucide-react';
import Avatar from '../components/avatar/avatar';
import ChatInput from '../components/input/chat/input';
import RoomList, { Section } from '../components/roomList/roomList';
import './MainPage.scss';
import { useProfile, useRoom, useRooms, useSpaces } from '../app/sdk/client';
import { Room } from '../app/sdk/room';
import { FC, memo, useCallback, useContext, useEffect, useState } from 'react';
import { MatrixContext } from '../app/sdk/client';
import { useLocation, useParams } from 'react-router-dom';
import MessageEvent from '../components/events/messageEvent';
import UnknownEvent, { RedactedEvent, UndecryptableEvent } from '../components/events/unknownEvent';
import MemberEvent from '../components/events/memberEvent';
import { IRoomEvent, IRoomMemberEvent } from '../app/sdk/api/events';
import Linkify from 'linkify-react';
import { OnlineState } from '../app/sdk/api/otherEnums';
import { Virtuoso } from 'react-virtuoso';
import ReactModal from 'react-modal';

type ChatViewProps = {
    /**
     * The roomID of the room to display
     * If the roomID is empty, the ChatView will be empty
     * If the roomID is invalid, the ChatView will be empty
     * If the roomID is valid, the ChatView will display the room
     * If the roomID is valid, but the room is not joined, the ChatView will display a placeholder
     * If the roomID is valid, but the room is not loaded, the ChatView will display a placeholder
     */
    room?: Room,
    id?: string
};

const ChatView: FC<ChatViewProps> = memo(({ room, id }) => {
    const client = useContext(MatrixContext);
    const [events, setEvents] = useState<IRoomEvent[]>([]);
    const [eventsFull, setEventsFull] = useState<IRoomEvent[]>([]);
    const { pathname } = useLocation();
    const [previousPathname, setPreviousPathname] = useState<string | undefined>(undefined);
    const [firstItemIndex, setFirstItemIndex] = useState<number | undefined>(undefined)

    const decryptEvents = async (index: number, event: IRoomEvent, eventsFull: IRoomEvent[]) => {
        let previousEvent = eventsFull?.[index - 1];
        const previousEventIsFromSameSender = previousEvent?.sender === event.sender;
        // Check if event is redacted
        const redaction = eventsFull?.find((e) => {
            return e.type === "m.room.redaction" && e.redacts === event.event_id;
        });
        const redacted = redaction !== undefined;
        let redacted_because = undefined;
        let redaction_id = undefined;
        if (redacted) {
            redaction_id = redaction?.event_id;
            if (redaction.content.reason) {
                redacted_because = redaction.content.reason;
            }
        }

        // Decrypt the event if it is encrypted
        if (event.type === "m.room.encrypted" && room?.roomID) {
            try {
                const decrypted_event = await client.decryptRoomEvent(room.roomID, event);
                if (decrypted_event) {
                    event = JSON.parse(decrypted_event.event) as IRoomEvent;
                    if (event.content["m.new_content"]) {
                        event.content.body = event.content["m.new_content"].body;
                        event.content.formatted_body = event.content["m.new_content"].formatted_body;
                        event.content.format = event.content["m.new_content"].format;
                    }
                } else {
                    if (redacted) {
                        return {
                            ...event,
                            unsigned: {
                                ...event.unsigned,
                                redacted: true,
                                redacted_because: redacted_because,
                                hasPreviousEvent: previousEventIsFromSameSender,
                                redaction_id: redaction_id
                            }
                        }
                    }
                    return {
                        ...event,
                        unsigned: {
                            ...event.unsigned,
                            undecryptable: true,
                            key: event.event_id,
                            hasPreviousEvent: previousEventIsFromSameSender
                        }
                    }
                }
            } catch (e: any) {
                if (redacted) {
                    return {
                        ...event,
                        unsigned: {
                            ...event.unsigned,
                            redacted: true,
                            redacted_because: redacted_because,
                            hasPreviousEvent: previousEventIsFromSameSender,
                            redaction_id: redaction_id
                        }
                    }
                }
                return {
                    ...event,
                    unsigned: {
                        ...event.unsigned,
                        undecryptable: true,
                        hasPreviousEvent: previousEventIsFromSameSender
                    }
                }
            }
        }

        return event;
    }

    useEffect(() => {
        if (previousPathname !== pathname) {
            console.log("Resetting events because we changed rooms");
            setEvents([]);
            setEventsFull([]);
            setFirstItemIndex(0);
            setPreviousPathname(pathname);
        }

        if ((eventsFull.length === 0) && room) {
            const eventsAll = room?.getEvents().filter((event, index, self) => {
                return self.findIndex(e => e.event_id === event.event_id) === index;
            }).sort((a, b) => {
                return b.origin_server_ts - a.origin_server_ts;
            }).reverse();

            Promise.all(eventsAll.map(async (event, index) => {
                return await decryptEvents(index, event, eventsAll);
            })).then((eventsRaw: IRoomEvent[]) => {
                const no_relations = eventsRaw.filter(event => event.type !== "m.reaction" &&
                    event.type !== "m.room.redaction" &&
                    event.content["m.relates_to"]?.["rel_type"] !== "m.replace"
                );
                if (no_relations.length > 0) {
                    const events = [...no_relations];
                    setEventsFull(() => [...eventsRaw]);
                    setEvents(() => events);
                    setFirstItemIndex(events.length);
                }
            })
        }
    }, [room, events, setEvents, eventsFull, setEventsFull, pathname, previousPathname, firstItemIndex, setFirstItemIndex])


    useEffect(() => {
        if (room) {
            // Listen for event updates
            const listenForEvents = (eventsListened: IRoomEvent[]) => {
                const eventsAll = eventsListened.filter((event, index, self) => {
                    return self.findIndex(e => e.event_id === event.event_id) === index;
                }).sort((a, b) => {
                    return b.origin_server_ts - a.origin_server_ts;
                }).reverse();

                Promise.all(eventsAll.map(async (event, index) => {
                    return await decryptEvents(index, event, eventsAll);
                })).then((eventsRaw: IRoomEvent[]) => {
                    const no_relations = eventsRaw.filter(event => event.type !== "m.reaction" &&
                        event.type !== "m.room.redaction" &&
                        event.content["m.relates_to"]?.["rel_type"] !== "m.replace"
                    );


                    // If there are no events or no changes, do nothing
                    if (no_relations.length > 0 && events.length > 0) {
                        const newEvents = [...no_relations];
                        if (eventsRaw.length !== eventsFull.length || newEvents.length !== events.length) {
                            setEventsFull(() => [...eventsRaw]);
                            setEvents(() => newEvents);
                        }
                    }
                })
            };
            console.log("Adding listener for events")
            room.on("events", listenForEvents);
            return () => {
                console.log("Removing listener for events")
                room.off("events", listenForEvents);
            }
        }
    }, [room, eventsFull, events, setEventsFull, setEvents, pathname])

    const renderEventPure = useCallback((_index: number, event: IRoomEvent) => {
        const index = eventsFull.findIndex(e => e.event_id === event.event_id);
        if (event.unsigned?.redacted) {
            return (<RedactedEvent event={event} redacted_because={event.unsigned.redacted_because} key={event.unsigned.redaction_id} room={room} hasPreviousEvent={event.unsigned.hasPreviousEvent} />)
        }

        if (event.unsigned?.undecryptable) {
            return (<UndecryptableEvent key={event.event_id} event={event} hasPreviousEvent={event.unsigned.hasPreviousEvent} room={room} />)
        }

        let previousEvent = eventsFull?.[index - 1];
        const previousEventIsFromSameSender = previousEvent?.sender === event.sender;

        let previousEventType = previousEvent?.type;

        // Make a list of events which are reactions for the current event we want to render
        const reactions = eventsFull?.filter((e) => {
            return e.type === "m.reaction" && e.content["m.relates_to"].event_id === event.event_id;
        });

        // Check if event is redacted
        const redaction = eventsFull?.find((e) => {
            return e.type === "m.room.redaction" && e.redacts === event.event_id;
        });
        const redacted = redaction !== undefined;
        let redacted_because = undefined;
        let redaction_id = undefined;
        if (redacted) {
            redaction_id = redaction?.event_id;
            if (redaction.content.reason) {
                redacted_because = redaction.content.reason;
            }
        }

        // Check if there is an edit (m.relates_to with rel_type of "m.replace")
        const edit = eventsFull?.find((e) => {
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

        return (
            <div className='max-w-[130ch]'>
                {renderEvent(event, previousEventIsFromSameSender, previousEventType, reactions, redacted, redacted_because, redaction_id, room)}
            </div>
        )
    }, [eventsFull])


    if (events.length === 0 || !room || eventsFull.length === 0) {
        return (
            <></>
        )
    }

    return (
        <Virtuoso
            id={id}
            alignToBottom
            className='flex overflow-y-auto overflow-x-hidden scrollbarSmall'
            data={events}
            firstItemIndex={firstItemIndex}
            initialTopMostItemIndex={events.length - 1}
            overscan={200}
            itemContent={renderEventPure}
            components={{ Header }}
            followOutput={(isAtBottom: boolean) => {
                if (isAtBottom) {
                    return 'smooth'
                } else {
                    return false
                }
            }}
        />
    );
});


const Header = () => {
    return (
        <div
            style={{
                padding: '2rem',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            Loading...
        </div>
    )
}

// Render events based on the event type and content
const renderEvent = (event: IRoomEvent, previousEventIsFromSameSender: boolean, previousEventType: string, reactions: IRoomEvent[], redacted: boolean, redacted_because: string, redaction_id?: string, room?: Room,) => {
    if (redacted) {
        return (<RedactedEvent event={event} redacted_because={redacted_because} room={room} hasPreviousEvent={previousEventIsFromSameSender} key={redaction_id} />)
    }
    switch (event.type) {
        case "m.room.message":
            return <MessageEvent reactions={reactions} event={event} room={room} key={event.event_id} hasPreviousEvent={previousEventIsFromSameSender && previousEventType === "m.room.message"} />
        case "m.room.member":
            return <MemberEvent event={event as IRoomMemberEvent} key={event.event_id} />
        default:
            return <UnknownEvent event={event} key={event.event_id} />
    }
}

const MainPage = memo(() => {
    const profile = useProfile();
    const spacesWithRooms = useSpaces();
    const rooms = useRooms();
    const client = useContext(MatrixContext);
    const params = useParams();
    const room = useRoom(decodeURIComponent(params.roomIdOrAlias || ""));
    client.setCurrentRoom(params.roomIdOrAlias ? decodeURIComponent(params.roomIdOrAlias) : undefined)

    const [showSettings, setShowSettings] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string | null>(null);

    // Filter toplevel spaces.
    // A toplevel space is a space that is not a child of another space.
    // We can not rely only on the parent. We need to check in both directions.
    const toplevelSpaces = [...spacesWithRooms].filter(({ spaceRoom }) => {
        const not_tombstoned = !spaceRoom.isTombstoned();
        const not_a_child = ![...spacesWithRooms].some(({ children: otherChildren }) => {
            return [...otherChildren].some(room => room.roomID === spaceRoom.roomID);
        });
        // Also check if there are no parents set
        const no_parents = spaceRoom.getSpaceParentIDs().length === 0;
        return not_a_child && no_parents && not_tombstoned;
    });

    // Filter rooms which are not part of any space and are not a space.
    // A room is not part of any space if it is not a child of any space.
    // A room is not a space if it has not any space as parent.
    const leftOverRooms = [...rooms].filter(room => {
        const not_tombstoned = !room.isTombstoned();
        const not_a_child = ![...spacesWithRooms].some(({ children }) => {
            return [...children].some(otherRoom => otherRoom.roomID === room.roomID);
        });
        const no_parents = room.getSpaceParentIDs().length === 0;
        const not_a_space = !room.isSpace();
        return not_a_child && no_parents && not_a_space && not_tombstoned;
    }).sort((a, b) => {
        // Sort rooms by sliding sync list order of overview list,

        // Get the index of the room in the sync list.
        const a_index = a.windowPos["overview"];
        const b_index = b.windowPos["overview"];

        // If the room is not in the sync list, it will be at the end of the list.
        // This is the same as the index being -1.
        // So we need to check for that.
        if (a_index === -1) {
            return 1;
        }
        if (b_index === -1) {
            return -1;
        }

        // If the room is in the sync list, we can compare the indexes.
        return a_index - b_index;
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
        const rooms = [...space.children].filter(room => !room.isSpace() && !room.isTombstoned() && !room.isDM()).sort((a, b) => {
            // Sort rooms by sliding sync list order of the spaces list,

            // Get the index of the room in the sync list.
            const a_index = a.windowPos[space.spaceRoom.roomID];
            const b_index = b.windowPos[space.spaceRoom.roomID];

            // If the room is not in the sync list, it will be at the end of the list.
            // This is the same as the index being -1.
            // So we need to check for that.
            if (a_index === -1) {
                return 1;
            }
            if (b_index === -1) {
                return -1;
            }

            // If the room is in the sync list, we can compare the indexes.
            return a_index - b_index;
        }).filter(room => {
            if (searchTerm) {
                return room.getName().toLowerCase().includes(searchTerm.toLowerCase())
            } else {
                return true;
            }
        }).map(room => {
            return {
                roomID: room.roomID,
                displayname: room.getName(),
                avatarUrl: room.getAvatarURL(),
                dm: room.isDM(),
                online: room.presence,
            }
        });

        const generateSubsections = (subspace: Room): Section | undefined => {
            const subspaceMeta = [...spacesWithRooms].find(space => space.spaceRoom.roomID === subspace.roomID);
            if (subspaceMeta) {
                const rooms = [...subspaceMeta?.children].filter(room => !room.isSpace() && !room.isTombstoned() && !room.isDM()).filter(room => {
                    if (searchTerm) {
                        return room.getName().toLowerCase().includes(searchTerm.toLowerCase())
                    } else {
                        return true;
                    }
                }).map(room => {
                    return {
                        roomID: room.roomID,
                        displayname: room.getName(),
                        avatarUrl: room.getAvatarURL(),
                        dm: room.isDM(),
                        online: room.presence,
                    }
                });

                const subsections = [...subspaceMeta?.children]
                    .filter(room => room.isSpace() && !room.isTombstoned()).map(generateSubsections)
                    .filter(section => section !== undefined) as Section[];
                if (searchTerm && rooms.length === 0 && subsections.length == 0) {
                    return undefined;
                }

                return {
                    sectionName: subspace.getName(),
                    rooms: rooms,
                    roomID: subspace.roomID,
                    subsections: subsections,
                }
            }
        }
        if (searchTerm && rooms.length === 0) {
            return undefined;
        }

        // Its a little weird sicne there are no children attached to the room object. Only to spacesWithRooms.
        // Each subsection can have further subsections and rooms.
        return {
            sectionName: space.spaceRoom.getName(),
            rooms: rooms,
            roomID: space.spaceRoom.roomID,
            subsections: [...space.children]
                .filter(room => room.isSpace())
                .map(generateSubsections).filter(section => section !== undefined),
        } as Section;
    }).filter(section => section !== undefined) as Section[];

    // Add the toplevel section "Other" to the end of the list.
    const otherRooms = leftOverRooms.filter(room => !room.isSpace() && !room.isDM()).filter(room => {
        if (searchTerm) {
            return room.getName().toLowerCase().includes(searchTerm.toLowerCase())
        } else {
            return true;
        }
    }).map(room => {
        return {
            roomID: room.roomID,
            displayname: room.getName(),
            avatarUrl: room.getAvatarURL(),
            dm: room.isDM(),
            online: room.presence,
        }
    });

    const dmRooms = leftOverRooms.filter(room => !room.isSpace() && room.isDM()).filter(room => {
        if (searchTerm) {
            return room.getName().toLowerCase().includes(searchTerm.toLowerCase())
        } else {
            return true;
        }
    }).map(room => {
        return {
            roomID: room.roomID,
            displayname: room.getName(),
            avatarUrl: room.getAvatarURL(),
            dm: room.isDM(),
            online: room.presence,
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

    return <div id='main-container'>
        <div id='sidebar'>
            <div id="user-info">
                <Avatar displayname={profile.displayname || client.mxid!} avatarUrl={profile?.avatar_url} dm={false} online={OnlineState.Unknown} isBot={false} />
                <div id='username-container'>

                    <span>{profile?.displayname}</span>
                    <Settings size={28} stroke='unset' className='stroke-slate-600 rounded-full hover:bg-slate-300 p-1 cursor-pointer' onClick={() => { setShowSettings(true) }} />
                </div>
                <div id='search-container'>
                    <label className='flex relative flex-row items-center justify-start hover:bg-slate-400/25 bg-slate-400/50 flex-1 rounded-lg group'>
                        <Search size={20} stroke='unset' className='stroke-slate-600 absolute top-2 left-2' />
                        <input className='placeholder:text-slate-600 bg-transparent py-2 rounded-lg pl-8 group-hover:outline outline-slate-700 w-full outline-2 text-black' placeholder='Search' onInput={(e) => {
                            e.preventDefault();
                            const value = e.currentTarget.value;
                            if (value === "") {
                                setSearchTerm(null);
                            } else {
                                setSearchTerm(value);
                            }
                        }} />
                    </label>
                </div>
            </div>
            <RoomList sections={sections} rooms={otherRooms} dmRooms={dmRooms} />
        </div>
        {
            room ? <>
                <div className="room-wrapper"></div>
                <div id='room-info'>
                    <Avatar displayname={room.getName()} avatarUrl={room.getAvatarURL()} dm={room.isDM()} online={room.presence} isBot={false} />
                    <div className='flex mr-2'>
                        <h1 id='room-name'>{room.getName()}</h1>
                        <Linkify options={linkifyOptions} as='p' className="ml-2 text-slate-700 dark:text-slate-400 font-normal text-base line-clamp-2 text-ellipsis">{room.getTopic()}</Linkify>
                    </div>
                </div>
                <ChatView id='chat-view' room={room} />
                <ChatInput id='chat-editor' namespace='Editor' room={room} />
            </> : <></>
        }

        <ReactModal
            isOpen={showSettings}
            id="modal"
            overlayClassName="fixed top-0 bottom-0 right-0 left-0 bg-slate-700/75"
            onRequestClose={() => { setShowSettings(false) }}
        >
            <SettingsView onClose={() => { setShowSettings(false) }} />
        </ReactModal>
    </div >
})

export default MainPage;

type SettingsViewProps = {
    onClose: () => void
}

const SettingsView: FC<SettingsViewProps> = memo(({ onClose }) => {
    const [currentSettingsView, setCurrentSettingsView] = useState("profile");
    return (
        <>
            <X id="modal-cross" size={28} stroke='unset' onClick={onClose}>Close Modal</X>
            <nav id="modal-sidebar">
                <button className={'p-1 bg-white w-full text-left hover:bg-slate-200 rounded flex items-center gap-1 ' + (currentSettingsView === "profile" ? '!bg-slate-200' : '')} onClick={() => { setCurrentSettingsView("profile") }}>
                    <User size={28} stroke='unset' className='stroke-slate-600 p-1' /> Profile
                </button>
                <button className={'p-1 bg-white w-full text-left hover:bg-slate-200 rounded flex items-center gap-1 ' + (currentSettingsView === "design" ? '!bg-slate-200' : '')} onClick={() => { setCurrentSettingsView("design") }}>
                    <Brush size={28} stroke='unset' className='stroke-slate-600 p-1' /> Design
                </button>
            </nav>
            <div id='modal-content'>
                {
                    currentSettingsView === "profile" ?
                        <SettingsProfileView /> :
                        <SettingsDesignView />
                }

            </div>
        </>
    );
});


const SettingsProfileView = memo(() => {
    const client = useContext(MatrixContext);
    const profile = useProfile();
    const [displayname, setDisplayname] = useState(profile.displayname);

    return (
        <div id="profile-view">
            <h1 id="title"><User size={28} stroke='unset' className='stroke-slate-600 p-1' /> Profile</h1>

            <div id="inputs">
                <div id='displayname-container'>
                    <span className='text-slate-700 font-semibold'>Displayname</span>
                    <label>
                        <Pencil size={20} stroke='unset' className='stroke-slate-600 absolute top-2 left-2' />
                        <input value={displayname} onInput={(e) => {
                            e.preventDefault();
                            const value = e.currentTarget.value;
                            setDisplayname(value);
                        }} />
                    </label>
                </div>
                <div id='matrixid'>
                    <span className='text-slate-700 font-semibold'>MatrixID</span>
                    <label>
                        <PersonStanding size={20} stroke='unset' className='stroke-slate-600 absolute top-2 left-2' />
                        <input disabled placeholder={client.mxid} />
                    </label>
                </div>
            </div>
            <div id="avatar">
                <Avatar size='14rem' displayname={profile.displayname || client.mxid!} avatarUrl={profile?.avatar_url} dm={false} online={OnlineState.Unknown} isBot={false} />
            </div>
        </div>
    )
})

const SettingsDesignView = memo(() => {
    return (
        <>
            <h1 className='text-xl font-bold text-black flex items-center'><Brush size={28} stroke='unset' className='stroke-slate-600 p-1' /> Design</h1>
        </>
    )
})