import { Meta, StoryObj } from '@storybook/react';
import RoomList from './roomList';
import { withRouter } from 'storybook-addon-react-router-v6';
import { OnlineState } from '../../app/sdk/api/otherEnums';

const meta: Meta<typeof RoomList> = {
    title: 'Chat/RoomList',
    component: RoomList,
    decorators: [withRouter],
    argTypes: {
        sections: {
            required: true,
            defaultValue: [],
            name: "Sections",
            description: "The Sections available",
        },
        rooms: {
            required: true,
            defaultValue: [],
            name: "Rooms",
            description: "Rooms outside of any Sections",
        },
    }
};

export default meta;
type Story = StoryObj<typeof RoomList>;

export const RootList: Story = {
    args: {
        rooms: [
            {
                roomID: "1",
                displayname: "test",
                avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
                dm: true,
                online: OnlineState.Online,
            },
            {
                roomID: "2",
                displayname: "test1",
                dm: false,
                online: OnlineState.Unknown,
            },
            {
                roomID: "3",
                displayname: "test2",
                dm: false,
                online: OnlineState.Unknown,
            }
        ],
        sections: [
            {
                sectionName: "Test Section",
                rooms: [
                    {
                        roomID: "2",
                        displayname: "test1",
                        dm: false,
                        online: OnlineState.Unknown,
                    },
                    {
                        roomID: "3",
                        displayname: "test2",
                        dm: false,
                        online: OnlineState.Unknown,
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
                                online: OnlineState.Online,
                            }
                        ],
                        roomID: "14",
                        subsections: []
                    }
                ]
            }
        ]
    }
};