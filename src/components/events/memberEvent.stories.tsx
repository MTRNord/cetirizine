import { Meta, StoryObj } from '@storybook/react';
import MemberEvent from './memberEvent';

const meta: Meta<typeof MemberEvent> = {
    title: 'Chat/Events/MembershipEvents',
    component: MemberEvent,
};

export default meta;
type Story = StoryObj<typeof MemberEvent>;

export const JoinEvent: Story = {
    args: {
        event: {
            content: {
                avatar_url: "mxc://example.org/SEsfnsuifSDFSSEF",
                displayname: "Alice Margatroid",
                membership: "join",
                reason: "Looking for support"
            },
            event_id: "$143273582443PhrSn:example.org",
            origin_server_ts: 1432735824653,
            room_id: "!jEsUZKDJdhlrceRyVU:example.org",
            sender: "@example:example.org",
            state_key: "@alice:example.org",
            type: "m.room.member",
            unsigned: {
                "age": 1234
            }
        }

    }
};

export const LeaveEvent: Story = {
    args: {
        event: {
            content: {
                avatar_url: "mxc://example.org/SEsfnsuifSDFSSEF",
                displayname: "Alice Margatroid",
                membership: "leave",
                reason: "Looking for support"
            },
            event_id: "$143273582443PhrSn:example.org",
            origin_server_ts: 1432735824653,
            room_id: "!jEsUZKDJdhlrceRyVU:example.org",
            sender: "@example:example.org",
            state_key: "@alice:example.org",
            type: "m.room.member",
            unsigned: {
                "age": 1234
            }
        }

    }
};

export const InviteEvent: Story = {
    args: {
        event: {
            content: {
                avatar_url: "mxc://example.org/SEsfnsuifSDFSSEF",
                displayname: "Alice Margatroid",
                membership: "invite",
                reason: "Looking for support"
            },
            event_id: "$143273582443PhrSn:example.org",
            origin_server_ts: 1432735824653,
            room_id: "!jEsUZKDJdhlrceRyVU:example.org",
            sender: "@example:example.org",
            state_key: "@alice:example.org",
            type: "m.room.member",
            unsigned: {
                "age": 1234
            }
        }

    }
};

export const KnockEvent: Story = {
    args: {
        event: {
            content: {
                avatar_url: "mxc://example.org/SEsfnsuifSDFSSEF",
                displayname: "Alice Margatroid",
                membership: "knock",
                reason: "Looking for support"
            },
            event_id: "$143273582443PhrSn:example.org",
            origin_server_ts: 1432735824653,
            room_id: "!jEsUZKDJdhlrceRyVU:example.org",
            sender: "@example:example.org",
            state_key: "@alice:example.org",
            type: "m.room.member",
            unsigned: {
                "age": 1234
            }
        }

    }
};

export const BanEvent: Story = {
    args: {
        event: {
            content: {
                avatar_url: "mxc://example.org/SEsfnsuifSDFSSEF",
                displayname: "Alice Margatroid",
                membership: "ban",
                reason: "Looking for support"
            },
            event_id: "$143273582443PhrSn:example.org",
            origin_server_ts: 1432735824653,
            room_id: "!jEsUZKDJdhlrceRyVU:example.org",
            sender: "@example:example.org",
            state_key: "@alice:example.org",
            type: "m.room.member",
            unsigned: {
                "age": 1234
            }
        }

    }
};