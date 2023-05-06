import { Meta, StoryObj } from '@storybook/react';
import UnknownEvent from './unknownEvent';

const meta: Meta<typeof UnknownEvent> = {
    title: 'Chat/Events/UnknownEvent',
    component: UnknownEvent,
};

export default meta;
type Story = StoryObj<typeof UnknownEvent>;

export const UnknownEventEvent: Story = {
    name: "Unknown Event",
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