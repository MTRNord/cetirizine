import { Settings } from 'lucide-react';
import Avatar from '../components/avatar/avatar';
import ChatInput from '../components/input/chat/input';
import RoomList, { Section } from '../components/roomList/roomList';
import './MainPage.scss';
import { useProfile, useRooms, useSpaces } from '../app/sdk/client';
import { Room } from '../app/sdk/room';
export default function MainPage() {
    const profile = useProfile();
    const spacesWithRooms = useSpaces();
    const rooms = useRooms();

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
    const otherRooms = [...rooms].filter(room => !room.isSpace()).map(room => {
        return {
            roomID: room.roomID,
            displayname: room.getName(),
            avatarUrl: room.getAvatarURL(),
            dm: room.isDM(),
            online: room.isOnline(),
        }
    });

    return <div className='flex flex-row w-full gap-2 min-h-screen h-screen'>
        < div className='flex flex-col bg-gradient-to-br from-slate-100 via-gray-200 to-orange-200 border-r-[1px] border-slate-300' >
            <div className='flex flex-row gap-2 m-2 p-1  items-center border-b-2'>
                {profile?.avatar_url && <Avatar displayname='Test' avatarUrl={profile?.avatar_url} dm={false} online={false} />}
                <div className='flex flex-row justify-between items-center w-full'>
                    <span className='text-base font-semibold'>{profile?.displayname}</span>
                    <Settings size={28} stroke='unset' className='stroke-slate-600 rounded-full hover:bg-slate-300 p-1 cursor-pointer' />
                </div>
            </div>
            <RoomList sections={sections} rooms={otherRooms} />
        </div >
        <div className='flex-1 flex flex-col'>
            <div className='flex-1'>
            </div>
            <ChatInput namespace='Editor' onChange={() => { }} onError={(e) => console.error(e)} />
        </div>
    </div >
}