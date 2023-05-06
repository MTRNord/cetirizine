import { Meta, StoryObj } from '@storybook/react';
import { RedactedEvent } from './unknownEvent';

const meta: Meta<typeof RedactedEvent> = {
    title: 'Chat/Events/RedactedEvent',
    component: RedactedEvent,
};

export default meta;
type Story = StoryObj<typeof RedactedEvent>;

export const RedactedEventEvent: Story = {
    name: "Redacted Event",
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

export const RedactedEventReasonEvent: Story = {
    name: "Redacted Event with Reason",
    args: {
        redacted_because: "Because I can",
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