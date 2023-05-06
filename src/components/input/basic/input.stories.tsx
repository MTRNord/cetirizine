import { Meta, StoryObj } from '@storybook/react';
import Input from './input';

const meta: Meta<typeof Input> = {
    title: 'Fundamentals/Inputs/BasicInput',
    component: Input,
    argTypes: {
        placeholder: {
            required: true,
            name: "Placeholder",
            description: "The Placeholder for the input field. Shown if it is empty.",
        },
        password: {
            required: false,
            name: "Password",
            control: "boolean",
            defaultValue: false,
            description: "If the input field takes a password.",
        },
        autoFocus: {
            required: false,
            name: "Auto Focus",
            control: "boolean",
            defaultValue: false,
            description: "If the field should be focused automatically.",
        },
        value: {
            required: true,
            name: "Value",
            description: "The current value of the input.",
        },
        onChange: {
            description: "The onChange handler of the input field.",
            required: true,
        },
    }
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
    args: {
        placeholder: "Placeholder",
        password: false,
        autoFocus: false,
    }
};