import { Meta, StoryObj } from '@storybook/react';
import { UndecryptableEvent } from './unknownEvent';

const meta: Meta<typeof UndecryptableEvent> = {
    title: 'Chat/Events/UndecryptableEvent',
    component: UndecryptableEvent,
};

export default meta;
type Story = StoryObj<typeof UndecryptableEvent>;

export const UndecryptableEventEvent: Story = {
    name: "Undecryptable Event",
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