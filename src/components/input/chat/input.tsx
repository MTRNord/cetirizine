
import { $generateHtmlFromNodes, } from '@lexical/html';
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
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { TRANSFORMERS, $convertToMarkdownString } from "@lexical/markdown";

import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import EditorTheme from './theme';

import './input.scss';
import { FC, memo, useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { useRoom } from '../../../app/sdk/client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { CLEAR_EDITOR_COMMAND } from 'lexical';
import { useLocation } from 'react-router-dom';

type ChatInputProps = {
    /**
     * The Namespace
     */
    namespace: string
    /**
     * The current Room
     */
    roomID?: string
};

function Placeholder() {
    return <div className="editor-placeholder" id="editor-placeholder">Enter message...</div>;
}

type SendButtonProps = {
    /**
     * The current Room
     */
    roomID?: string
    /** 
     * The HTML message
     */
    htmlMessage: string
    /**
     * The plain text message
     */
    plainMessage: string
};

const SendButton: FC<SendButtonProps> = memo(({ roomID, htmlMessage, plainMessage }: SendButtonProps) => {
    const room = useRoom(roomID || "");
    const [editor] = useLexicalComposerContext();

    return <Send size={45} stroke='unset' className='stroke-slate-600 rounded m-4 hover:bg-slate-300 hover:stroke-slate-500 p-2 cursor-pointer' onClick={async () => {
        // TODO: Sanitize the html and send message to room
        if (!room) {
            return;
        }
        console.log("Sending message to: ", roomID)

        // TODO: local echo
        if (htmlMessage === "" && plainMessage === "") {
            return;
        }
        if (htmlMessage !== '<p class="editor-paragraph"><br></p>') {
            try {
                await room.sendHtmlMessage(htmlMessage, plainMessage);
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
                localStorage.removeItem(`editor-${roomID}`);
            } catch (e: any) {
                console.log(e);
            }
        } else {
            try {
                await room.sendTextMessage(plainMessage);
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
                localStorage.removeItem(`editor-${roomID}`);
            } catch (e: any) {
                console.log(e);
            }
        }
    }} />
});


type RoomChangeProps = {
    /**
     * The current Room
     */
    roomID?: string
};

const RoomChangePlugin: FC<RoomChangeProps> = ({ roomID }) => {
    const [editor] = useLexicalComposerContext();
    const { pathname } = useLocation();
    const [prevRoom, setPrevRoom] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (roomID) {
            if (roomID !== prevRoom) {
                console.log("Saving editor state")
                // Save the editor state to local storage
                const editorState = editor.getEditorState();
                localStorage.setItem(`editor-${prevRoom}`, JSON.stringify(editorState.toJSON()));
            }
            setPrevRoom(roomID);
            const savedHtml = localStorage.getItem(`editor-${roomID}`);
            if (savedHtml) {
                const initialEditorState = editor.parseEditorState(savedHtml)
                editor.setEditorState(initialEditorState)
            } else {
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            }
        }
    }, [pathname, roomID]);

    return <></>
}

const ChatInput: FC<ChatInputProps> = memo(({ namespace, roomID }: ChatInputProps) => {
    const [htmlMessage, setHtmlMessage] = useState<string>("");
    const [plainMessage, setPlainMessage] = useState<string>("");

    const initialConfig: InitialConfigType = {
        namespace: namespace,
        theme: EditorTheme,
        onError: (e) => console.error(e),
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
        <div className='flex flex-row items-end'>
            <LexicalComposer initialConfig={initialConfig}>
                <div className="editor-container flex-1">
                    <ToolbarPlugin />
                    <div className="editor-inner">
                        <RichTextPlugin
                            contentEditable={<ContentEditable className="editor-input" ariaLabelledBy='editor-placeholder' />}
                            placeholder={<Placeholder />}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <OnChangePlugin onChange={(editorState, editor) => {
                            // Convert editor state to both html and markdown.
                            // If there is no formatting then just use the plain text.
                            editorState.read(() => {
                                const html = $generateHtmlFromNodes(editor);
                                // TODO: Make sure that we strip any non matrix stuff
                                setHtmlMessage(html);
                                const markdown = $convertToMarkdownString(TRANSFORMERS);
                                setPlainMessage(markdown);
                            });
                            // TODO: we need some send button
                        }} />
                        <HistoryPlugin />
                        <LinkPlugin />
                        <CodeHighlightPlugin />
                        <AutoLinkPlugin />
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                        <ClearEditorPlugin />
                        <RoomChangePlugin roomID={roomID} />
                    </div>
                </div>
                <SendButton roomID={roomID} htmlMessage={htmlMessage} plainMessage={plainMessage} />
            </LexicalComposer>

        </div>
    );
})

export default ChatInput;