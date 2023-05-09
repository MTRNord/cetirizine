import { Meta, StoryObj } from '@storybook/react';
import Avatar from './avatar';
import { OnlineState } from '../../app/sdk/api/otherEnums';

const meta: Meta<typeof Avatar> = {
    title: 'Chat/Avatar',
    component: Avatar,
    argTypes: {
        avatarUrl: {
            required: false,
            name: "Avatar URL",
            description: "The URL of the avatar image",
        },
        displayname: {
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
        displayname: "test",
        dm: false,
        online: OnlineState.Unknown,
        avatarUrl: ""
    }
};

export const Image: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: false,
        online: OnlineState.Unknown,
    }
};

export const DMOffline: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: true,
        online: OnlineState.Offline,
    }
};


export const DMUnknown: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: true,
        online: OnlineState.Unknown,
    }
};

export const DMOnline: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: true,
        online: OnlineState.Online,
    }
};

export const DMNoAvatarOffline: Story = {
    args: {
        displayname: "test",
        avatarUrl: "",
        dm: true,
        online: OnlineState.Offline,
    }
};

export const DMNoAvatarUnknown: Story = {
    args: {
        displayname: "test",
        avatarUrl: "",
        dm: true,
        online: OnlineState.Unknown,
    }
};

export const DMNoAvatarOnline: Story = {
    args: {
        displayname: "test",
        avatarUrl: "",
        dm: true,
        online: OnlineState.Online,
    }
};