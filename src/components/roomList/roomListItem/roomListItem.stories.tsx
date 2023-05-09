import { Meta, StoryObj } from '@storybook/react';
import RoomListItem from './roomListItem';
import { OnlineState } from '../../../app/sdk/api/otherEnums';

const meta: Meta<typeof RoomListItem> = {
    title: 'Chat/RoomList/Item',
    component: RoomListItem,
    argTypes: {
        avatarUrl: {
            required: false,
            name: "Avatar URL",
            description: "The URL of the avatar image",
        },
        displayname: {
            required: true,
            name: "Displayname",
            description: "The displayname of the Room",
        },
        dm: {
            required: false,
            defaultValue: false,
            control: "boolean",
            name: "DM",
            description: "Wether the room is a DM",
        },
        online: {
            required: false,
            defaultValue: false,
            control: "boolean",
            name: "Online",
            description: "Wether the user is online. Only used if dm is true",
        },
        active: {
            required: false,
            defaultValue: false,
            control: "boolean",
            name: "Active",
            description: "Wether the room is currently selected",
        },
    }
};

export default meta;
type Story = StoryObj<typeof RoomListItem>;

export const Fallback: Story = {
    args: {
        displayname: "test",
        dm: false,
        online: OnlineState.Unknown,
        avatarUrl: "",
        active: false,
    }
};

export const FallbackActive: Story = {
    args: {
        displayname: "test",
        dm: false,
        online: OnlineState.Unknown,
        avatarUrl: "",
        active: true,
    }
};


export const Image: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: false,
        online: OnlineState.Unknown,
        active: false,
    }
};


export const ImageActive: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: false,
        online: OnlineState.Unknown,
        active: true,
    }
};

export const DMOffline: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: true,
        online: OnlineState.Offline,
        active: false,
    }
};

export const DMOfflineActive: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: true,
        online: OnlineState.Online,
        active: true,
    }
};

export const DMUnknown: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: true,
        online: OnlineState.Unknown,
        active: false,
    }
};

export const DMUnknownActive: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: true,
        online: OnlineState.Unknown,
        active: true,
    }
};


export const DMOnline: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: true,
        online: OnlineState.Online,
        active: false,
    }
};

export const DMOnlineActive: Story = {
    args: {
        displayname: "test",
        avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
        dm: true,
        online: OnlineState.Online,
        active: true,
    }
};

export const DMNoAvatarOffline: Story = {
    args: {
        displayname: "test",
        avatarUrl: "",
        dm: true,
        online: OnlineState.Offline,
        active: false,
    }
};

export const DMNoAvatarOnline: Story = {
    args: {
        displayname: "test",
        avatarUrl: "",
        dm: true,
        online: OnlineState.Online,
        active: false,
    }
};