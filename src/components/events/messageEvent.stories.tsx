import { Meta, StoryObj } from '@storybook/react';
import MessageEvent from './messageEvent';
import { defaultMatrixClient } from '../../app/sdk/client';

const meta: Meta<typeof MessageEvent> = {
    title: 'Chat/Events/MessageEvents',
    component: MessageEvent,
};

export default meta;
type Story = StoryObj<typeof MessageEvent>;

export const TextEvent: Story = {
    args: {
        event: {
            content: {
                body: "._.",
                msgtype: "m.text"
            },
            origin_server_ts: 1683125956695,
            sender: "@example:example.org",
            type: "m.room.message",
            unsigned: {},
            event_id: "$143273582443PhrSn:example.org",
            room_id: "!jEsUZKDJdhlrceRyVU:example.org"
        }
    }
};

export const FormattedEvent: Story = {
    args: {
        event: {
            content: {
                body: "I think it's mostly a matter of doing the right `padding-block` in `.content`",
                format: "org.matrix.custom.html",
                formatted_body: "I think it's mostly a matter of doing the right <code>padding-block</code> in <code>.content</code>",
                msgtype: "m.text"
            },
            origin_server_ts: 1683125956695,
            sender: "@example:example.org",
            type: "m.room.message",
            unsigned: {},
            event_id: "$143273582443PhrSn:example.org",
            room_id: "!jEsUZKDJdhlrceRyVU:example.org"
        }
    }
};

// @ts-ignore
defaultMatrixClient.hostname = "https://matrix.org";

export const ImageEvent: Story = {
    args: {
        event: {
            content: {
                body: "image.png",
                info: {
                    h: 680,
                    mimetype: "image/png",
                    size: 252133,
                    thumbnail_info: {
                        h: 600,
                        mimetype: "image/png",
                        size: 223185,
                        w: 600
                    },
                    thumbnail_url: "mxc://midnightthoughts.space/9824fd09c998f8304935bf78c047146332fea9f7",
                    w: 680,
                    "xyz.amorgan.blurhash": "UaQ]+tElbcs,NFR*bIj@_4$ejYWXxas:n$oL"
                },
                msgtype: "m.image",
                url: "mxc://midnightthoughts.space/59ced67d3dfbcc5c129c3e12d3083bf5652f6ff5"
            },
            origin_server_ts: 1683125956695,
            sender: "@example:example.org",
            type: "m.room.message",
            unsigned: {},
            event_id: "$143273582443PhrSn:example.org",
            room_id: "!jEsUZKDJdhlrceRyVU:example.org"
        }
    }
};