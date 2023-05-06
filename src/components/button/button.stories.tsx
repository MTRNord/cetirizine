import { Meta, StoryObj } from '@storybook/react';
import Button from './button';

const meta: Meta<typeof Button> = {
    title: 'Fundamentals/Buttons/BasicButton',
    component: Button,
    argTypes: {
        children: {
            required: true,
            name: "Label",
            description: "The button label",
        },
        onClick: {
            description: "The button onClick handler",
            required: true,
        },
        type: {
            description: "The button type",
            control: "select",
            options: ["button", "submit", "reset"],
            defaultValue: "button",
        },
        style: {
            description: "The button styling",
            control: "select",
            options: ["primary", "secondary", "abort"],
            defaultValue: "primary",
        }
    }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
    args: {
        children: 'Click me',
        type: 'button',
        style: 'primary',
    },
};

export const Submit: Story = {
    args: {
        children: 'Submit',
        type: 'submit',
        style: 'primary',
    },
};

export const Reset: Story = {
    args: {
        children: 'Reset',
        type: 'reset',
        style: 'primary',
    },
};

export const DefaultSecondary: Story = {
    args: {
        children: 'Click me',
        type: 'button',
        style: 'secondary',
    },
};

export const SubmitSecondary: Story = {
    args: {
        children: 'Submit',
        type: 'submit',
        style: 'secondary',
    },
};

export const ResetSecondary: Story = {
    args: {
        children: 'Reset',
        type: 'reset',
        style: 'secondary',
    },
};

export const Abort: Story = {
    args: {
        children: 'Abort',
        type: 'button',
        style: 'abort',
    },
};