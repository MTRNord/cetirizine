import { Meta, StoryObj } from '@storybook/react';
import MainPage from './MainPage';
import { withRouter } from 'storybook-addon-react-router-v6';

const meta: Meta<typeof MainPage> = {
    title: 'Pages/MainPage',
    tags: ['autodocs'],
    component: MainPage,
    decorators: [withRouter],

};

export default meta;
type Story = StoryObj<typeof MainPage>;

export const Default: Story = {};