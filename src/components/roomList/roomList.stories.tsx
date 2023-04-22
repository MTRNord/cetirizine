import { Meta, StoryObj } from '@storybook/react';
import RoomList from './roomList';
import { BADGE } from '@geometricpanda/storybook-addon-badges';

const meta: Meta<typeof RoomList> = {
    title: 'Chat/RoomList',
    tags: ['autodocs'],
    component: RoomList,
    parameters: {
        badges: [BADGE.EXPERIMENTAL]
    },
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
    }
};