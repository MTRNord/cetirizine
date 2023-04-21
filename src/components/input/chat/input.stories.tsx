import { Meta, StoryObj } from '@storybook/react';
import ChatInput from './input';
import { BADGE } from '@geometricpanda/storybook-addon-badges';
import { $getRoot, EditorState, LexicalEditor } from 'lexical';
import { TRANSFORMERS, $convertToMarkdownString } from "@lexical/markdown";
import { $generateHtmlFromNodes } from "@lexical/html";

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
        onChange: (editorState: EditorState, editor: LexicalEditor) => {
            editorState.read(() => {
                // Read the contents of the EditorState here.
                const root = $getRoot();
                // make it markdown
                const markdown = $convertToMarkdownString(TRANSFORMERS, root);
                const html = $generateHtmlFromNodes(editor, null);

                console.log(markdown);
                console.log(html);
            });
        },
        onError: (error) => { console.error(error); },
        namespace: "Editor"
    }
};