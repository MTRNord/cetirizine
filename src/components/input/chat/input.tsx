import React from 'react';
import { EditorState, LexicalEditor } from 'lexical';

import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import EditorTheme from './theme';

import './input.scss';

type ChatInputProps = {
    /**
     * The Namespace
     */
    namespace: string
    /**
     * Handler for the onChange event
     */
    onChange: (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => void;
    /**
     * Handler for the onError event
     */
    onError: (error: Error, editor: LexicalEditor) => void;
};

function Placeholder() {
    return <div className="editor-placeholder">Enter some rich text...</div>;
}

export default function ChatInput({ namespace, onChange, onError }: ChatInputProps) {
    const initialConfig: InitialConfigType = {
        namespace: namespace,
        theme: EditorTheme,
        onError,
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            AutoLinkNode,
            LinkNode
        ]
    }
    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="editor-container">
                <ToolbarPlugin />
                <div className="editor-inner">
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-input" />}
                        placeholder={<Placeholder />}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <OnChangePlugin onChange={onChange} />
                    <HistoryPlugin />
                    <LinkPlugin />
                    <CodeHighlightPlugin />
                    <AutoLinkPlugin />
                    <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                </div>
            </div>
        </LexicalComposer>
    );
}