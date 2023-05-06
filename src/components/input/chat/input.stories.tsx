import { Meta, StoryObj } from '@storybook/react';
import ChatInput from './input';
import { BADGE } from '@geometricpanda/storybook-addon-badges';

const meta: Meta<typeof ChatInput> = {
    title: 'Chat/Input',
    tags: ['autodocs'],
    component: ChatInput,
    parameters: {
        badges: [BADGE.EXPERIMENTAL]
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