import { Meta, StoryObj } from '@storybook/react';
import ChatInput from './input';
import { BADGE } from '@geometricpanda/storybook-addon-badges';
import { withRouter } from 'storybook-addon-react-router-v6';

const meta: Meta<typeof ChatInput> = {
    title: 'Chat/Input',
    component: ChatInput,
    decorators: [withRouter],
    parameters: {
        //badges: [BADGE.EXPERIMENTAL]
    },
    argTypes: {
        namespace: {
            required: true,
            name: "Namespace",
            description: "The Namespace of the editor.",
        },
    }
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {
    args: {
        namespace: "Editor"
    }
};