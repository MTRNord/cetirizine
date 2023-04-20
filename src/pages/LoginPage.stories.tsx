import { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { store } from '../app/store';
import LoginPage from './LoginPage';

const meta: Meta<typeof LoginPage> = {
    title: 'Pages/LoginPage',
    tags: ['autodocs'],
    component: LoginPage,
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {
    render: () => <Provider store={store}>
        <LoginPage />
    </Provider>,
};