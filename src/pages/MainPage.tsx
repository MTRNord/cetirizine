import { Settings } from 'lucide-react';
import Avatar from '../components/avatar/avatar';
import ChatInput from '../components/input/chat/input';
import RoomList from '../components/roomList/roomList';
import './MainPage.scss';
import { useRooms } from '../app/sdk/client';
export default function MainPage() {
    const matrixRooms = useRooms();
    console.log(matrixRooms.length);
    const sections = [
        {
            sectionName: "Test Section",
            rooms: [
                {
                    roomID: "2",
                    displayname: "test1",
                    dm: false,
                    online: false,
                },
                {
                    roomID: "3",
                    displayname: "test2",
                    dm: false,
                    online: false,
                }
            ],
            roomID: "12",
            subsections: [
                {
                    sectionName: "Test Subsection",
                    rooms: [
                        {
                            roomID: "1",
                            displayname: "test",
                            avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
                            dm: true,
                            online: true,
                        }
                    ],
                    roomID: "14",
                    subsections: []
                }
            ]
        }
    ];

    const rooms = [
        {
            roomID: "1",
            displayname: "test1234144222222",
            avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
            dm: true,
            online: true,
        },
        {
            roomID: "2",
            displayname: "test1",
            dm: false,
            online: false,
        },
        {
            roomID: "3",
            displayname: "test2",
            dm: false,
            online: false,
        },
    ];
    return <div className='flex flex-row w-full gap-2 min-h-screen'>
        <div className='flex flex-col bg-gradient-to-br from-slate-100 via-gray-200 to-orange-200 border-r-[1px] border-slate-300'>
            <div className='flex flex-row gap-2 m-2 p-1  items-center border-b-2'>
                <Avatar displayname='Test' avatarUrl='https://randomuser.me/api/portraits/men/62.jpg' dm={false} online={false} />
                <div className='flex flex-row justify-between items-center w-full'>
                    <span className='text-base font-semibold'>Abcd</span>
                    <Settings size={28} stroke='unset' className='stroke-slate-600 rounded-full hover:bg-slate-300 p-1 cursor-pointer' />
                </div>
            </div>
            <RoomList sections={sections} rooms={rooms} />
        </div>
        <div className='flex-1 flex flex-col'>
            <div className='flex-1'>
            </div>
            <ChatInput namespace='Editor' onChange={() => { }} onError={(e) => console.error(e)} />
        </div>
    </div>
}