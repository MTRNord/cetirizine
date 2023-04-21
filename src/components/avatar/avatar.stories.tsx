import { Meta, StoryObj } from '@storybook/react';
import Avatar from './avatar';
import { BADGE } from '@geometricpanda/storybook-addon-badges';

const meta: Meta<typeof Avatar> = {
    title: 'Chat/Avatar',
    tags: ['autodocs'],
    component: Avatar,
    parameters: {
        badges: [BADGE.EXPERIMENTAL]
    },
    argTypes: {
        avatarUrl: {
            required: false,
            name: "Avatar URL",
            description: "The URL of the avatar image",
        },
        userID: {
            required: true,
            name: "User ID",
            description: "The DISPLAY name of the User",
        },
        dm: {
            required: false,
            defaultValue: false,
            control: "boolean",
            name: "DM",
            description: "Wether the Avatar is used for a DM",
        },
        online: {
            required: false,
            defaultValue: false,
            control: "boolean",
            name: "Online",
            description: "Wether the user is online. Only used if dm is true",
        },
    }
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Fallback: Story = {
    args: {
        userID: "test",
        dm: false,
        online: false,
        avatarUrl: ""
    }
};

export const Image: Story = {
    args: {
        userID: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: false,
        online: false,
    }
};

export const DMOffline: Story = {
    args: {
        userID: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: true,
        online: false,
    }
};

export const DMOnline: Story = {
    args: {
        userID: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: true,
        online: true,
    }
};

export const DMNoAvatarOffline: Story = {
    args: {
        userID: "test",
        avatarUrl: "",
        dm: true,
        online: false,
    }
};

export const DMNoAvatarOnline: Story = {
    args: {
        userID: "test",
        avatarUrl: "",
        dm: true,
        online: true,
    }
};