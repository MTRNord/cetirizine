import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../app/store';
import Button from './button';
import { BADGE } from '@geometricpanda/storybook-addon-badges';

const meta: Meta<typeof Button> = {
    title: 'Button',
    tags: ['autodocs'],
    component: Button,
    parameters: {
        badges: [BADGE.EXPERIMENTAL]
    },
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
    render: (args) => <Provider store={store}>
        <Button {...args} />
    </Provider>,
};

export const Submit: Story = {
    args: {
        children: 'Submit',
        type: 'submit',
        style: 'primary',
    },
    render: (args) => <Provider store={store}>
        <Button {...args} />
    </Provider>,
};

export const Reset: Story = {
    args: {
        children: 'Reset',
        type: 'reset',
        style: 'primary',
    },
    render: (args) => <Provider store={store}>
        <Button {...args} />
    </Provider>,
};

export const DefaultSecondary: Story = {
    args: {
        children: 'Click me',
        type: 'button',
        style: 'secondary',
    },
    render: (args) => <Provider store={store}>
        <Button {...args} />
    </Provider>,
};

export const SubmitSecondary: Story = {
    args: {
        children: 'Submit',
        type: 'submit',
        style: 'secondary',
    },
    render: (args) => <Provider store={store}>
        <Button {...args} />
    </Provider>,
};

export const ResetSecondary: Story = {
    args: {
        children: 'Reset',
        type: 'reset',
        style: 'secondary',
    },
    render: (args) => <Provider store={store}>
        <Button {...args} />
    </Provider>,
};

export const Abort: Story = {
    args: {
        children: 'Abort',
        type: 'button',
        style: 'abort',
    },
    render: (args) => <Provider store={store}>
        <Button {...args} />
    </Provider>,
};