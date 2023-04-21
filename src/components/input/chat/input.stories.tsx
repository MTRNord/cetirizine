import { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { store } from '../../../app/store';
import ChatInput from './input';
import { BADGE } from '@geometricpanda/storybook-addon-badges';
import { $getRoot, EditorState } from 'lexical';
import { TRANSFORMERS, $convertToMarkdownString } from "@lexical/markdown";

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
        onChange: {
            description: "The onChange handler of the editor.",
            required: true,
        },
        onError: {
            description: "The error handler of the editor.",
            required: true,
        },
    }
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Default: Story = {
    args: {
        onChange: (editorState: EditorState) => {
            editorState.read(() => {
                // Read the contents of the EditorState here.
                const root = $getRoot();
                // make it markdown
                const markdown = $convertToMarkdownString(TRANSFORMERS, root);

                console.log(markdown);
            });
        },
        onError: (error) => { console.error(error); }
    },
    render: (args) => <Provider store={store}>
        <ChatInput {...args} />
    </Provider>,
};