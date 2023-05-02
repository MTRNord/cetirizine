import { FC, useState } from "react";
import RoomListItem from "./roomListItem/roomListItem";
import { ChevronDown, ChevronRight } from "lucide-react";
import './roomList.scss';

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
    online: boolean
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

const RoomListRooms: FC<RoomListRoomsProps> = ({ sectionID, rooms, onClick, activeRoom, hidden }: RoomListRoomsProps) => {
    const roomsRendered = rooms.map(room => {
        return (
            <RoomListItem
                roomId={room.roomID}
                hidden={hidden}
                key={room.roomID + sectionID}
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
}

const RoomSection: FC<{ section: Section, onRoomClick: (roomID: string) => void, activeRoom: string | undefined }> = ({ section, onRoomClick, activeRoom }: { section: Section, onRoomClick: (roomID: string) => void, activeRoom: string | undefined }) => {
    const [hidden, setHidden] = useState<boolean>(true);
    return (
        <div key={section.roomID} className="flex flex-col gap-1 pl-4">
            <div className="flex flex-row gap-2 py-1  items-center justify-start cursor-pointer h-8 text-slate-600" onClick={() => setHidden(prev => !prev)}>
                {hidden ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                <span className='font-normal text-sm capitalize max-w-[32ch] overflow-hidden text-ellipsis w-full whitespace-nowrap'>{section.sectionName}</span>
            </div >
            {!hidden && (<RoomListRooms
                hidden={hidden}
                sectionID={section.roomID}
                rooms={section.rooms}
                onClick={onRoomClick}
                activeRoom={activeRoom}
            />)}
            {!hidden && (
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
}

const RoomList: FC<RoomListProps> = ({ sections, rooms }: RoomListProps) => {
    const [activeRoom, setActiveRoom] = useState<string | undefined>(undefined);

    return (
        <div className="flex flex-col gap-1 flex-1 p-2 min-w-[33ch] h-full overflow-y-auto overflow-x-hidden scrollbarSmall">
            {
                sections.map(section => {
                    return (
                        <RoomSection
                            key={section.roomID}
                            section={section}
                            onRoomClick={(roomID: string) => { setActiveRoom(roomID) }}
                            activeRoom={activeRoom}
                        />
                    );
                })
            }
            <RoomSection
                section={{
                    sectionName: "Others",
                    roomID: "other",
                    subsections: [],
                    rooms: rooms
                }}
                onRoomClick={(roomID: string) => { setActiveRoom(roomID) }}
                activeRoom={activeRoom}
            />

        </div>
    );
}

export default RoomList