import { Meta, StoryObj } from '@storybook/react';
import Header from './header';

const meta: Meta<typeof Header> = {
    title: 'Fundamentals/Typography/Header',
    component: Header,
    argTypes: {
        children: {
            required: true,
            name: "Content",
            description: "The Headertext",
        },
    }
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
    args: {
        children: 'Header',
    },
};