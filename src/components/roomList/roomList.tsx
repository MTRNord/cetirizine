import { FC, memo, useContext, useEffect, useState } from "react";
import RoomListItem from "./roomListItem/roomListItem";
import { ChevronDown, ChevronRight } from "lucide-react";
import './roomList.scss';
import { useNavigate } from "react-router-dom";
import { MatrixContext } from "../../app/sdk/client";
import { useInView } from "react-intersection-observer";
import { OnlineState } from "../../app/sdk/api/otherEnums";

type Room = {
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
     * The roomid of the Room
     */
    roomID: string
};

export type Section = {
    /**
     * Section Name. Can be a Space or a Tag
     */
    sectionName: string
    /**
     * The Rooms within the Section
     */
    rooms: Room[]
    /**
     * The Subsections of the Section
     */
    subsections: Section[]
    /**
     * The roomid of the Space
     */
    roomID: string
}

type RoomListProps = {
    /**
     * The Sections available
     */
    sections: Section[]
    /**
     * Rooms outside of any Sections
     */
    rooms: Room[]
    /**
     * Rooms outside of any Sections and DM
     */
    dmRooms: Room[]
};

type RoomListRoomsProps = {
    /**
     * The roomid of the Space
     */
    sectionID: string
    /**
     * Rooms
     */
    rooms: Room[]
    /**
     * The onClick handler
     */
    onClick: (roomID: string) => void;
    /**
     * The activeRoom
     */
    activeRoom?: string;
    /**
     * If rooms are hidden
     */
    hidden: boolean
};

const RoomListRooms: FC<RoomListRoomsProps> = memo(({ sectionID, rooms, onClick, activeRoom, hidden }: RoomListRoomsProps) => {
    // Get room ids of rooms
    const roomsRendered = rooms.map(room => {
        return (
            <RoomListItem
                roomId={room.roomID}
                hidden={hidden}
                key={`${room.roomID}+${sectionID}`}
                avatarUrl={room.avatarUrl}
                displayname={room.displayname}
                dm={room.dm}
                online={room.online}
                active={room.roomID === activeRoom}
                onClick={() => { onClick(room.roomID) }}
            />
        );
    });
    return (
        <>
            {roomsRendered}
        </>
    );
})

const RoomSection: FC<{ section: Section, onRoomClick: (roomID: string) => void, activeRoom: string | undefined }> = memo(({ section, onRoomClick, activeRoom }: { section: Section, onRoomClick: (roomID: string) => void, activeRoom: string | undefined }) => {
    const [hidden, setHidden] = useState<boolean>(true);
    const matrixClient = useContext(MatrixContext);
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 1,
        onChange(inView) {
            if (section.roomID !== "other") {
                if (inView) {
                    matrixClient.addInViewRoom(section.roomID)
                } else {
                    matrixClient.removeInViewRoom(section.roomID)
                }
            }
        },
    });
    useEffect(() => {
        if (hidden) {
            matrixClient.removeSpaceOpen(section.roomID);
        } else {
            matrixClient.addSpaceOpen(section.roomID);
        }
    }, [hidden])
    return (
        <div ref={ref} key={section.roomID} className='room-section'>
            {
                inView && <div className="flex flex-row gap-2 py-1 items-center justify-start cursor-pointer h-8 text-slate-600" onClick={() => setHidden(prev => !prev)}>
                    {hidden ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    <span className='font-normal text-base capitalize max-w-[32ch] overflow-hidden text-ellipsis w-full whitespace-nowrap'>{section.sectionName}</span>
                </div >}
            {!hidden && inView && (<RoomListRooms
                hidden={hidden}
                sectionID={section.roomID}
                rooms={section.rooms}
                onClick={onRoomClick}
                activeRoom={activeRoom}
            />)}
            {!hidden && inView && (
                section.subsections.map(section => {
                    return (
                        <RoomSection
                            key={section.roomID}
                            section={section}
                            onRoomClick={onRoomClick}
                            activeRoom={activeRoom}
                        />
                    );
                })
            )}
        </div>
    );
})

const RoomList: FC<RoomListProps> = memo(({ sections, rooms, dmRooms }: RoomListProps) => {
    const [activeRoom, setActiveRoom] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    return (
        <div id='roomlist'>
            {dmRooms.length == 0 ? <></> :
                <RoomSection
                    section={{
                        sectionName: "DMs",
                        roomID: "dms",
                        subsections: [],
                        rooms: dmRooms
                    }}
                    onRoomClick={(roomID: string) => {
                        setActiveRoom(roomID);
                        navigate(`/${encodeURIComponent(roomID)}`);
                    }}
                    activeRoom={activeRoom}
                />}
            {
                sections.map(section => {
                    return (
                        <RoomSection
                            key={section.roomID}
                            section={section}
                            onRoomClick={(roomID: string) => {
                                setActiveRoom(roomID);
                                navigate(`/${encodeURIComponent(roomID)}`);
                            }}
                            activeRoom={activeRoom}
                        />
                    );
                })
            }
            {rooms.length > 0 ? <RoomSection
                section={{
                    sectionName: "Others",
                    roomID: "other",
                    subsections: [],
                    rooms: rooms
                }}
                onRoomClick={(roomID: string) => {
                    setActiveRoom(roomID);
                    navigate(`/${encodeURIComponent(roomID)}`);
                }}
                activeRoom={activeRoom}
            /> : <></>}

        </div>
    );
})

export default RoomList