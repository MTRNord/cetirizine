
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
//import TreeViewPlugin from "./plugins/DebugPlugin";
import { CustomParagraphNode } from './customNodes/CustomParagraphNode';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import EditorTheme from './theme';

import './input.scss';
import { FC, memo, useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { useRoom } from '../../../app/sdk/client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, CLEAR_EDITOR_COMMAND, CLEAR_HISTORY_COMMAND, COMMAND_PRIORITY_CRITICAL, INSERT_PARAGRAPH_COMMAND, KEY_ENTER_COMMAND, ParagraphNode } from 'lexical';
import { useLocation } from 'react-router-dom';

export const CAN_USE_DOM: boolean =
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined';


declare global {
    interface Document {
        documentMode?: unknown;
    }

    interface Window {
        MSStream?: unknown;
    }
}

const documentMode =
    CAN_USE_DOM && 'documentMode' in document ? document.documentMode : null;

export const CAN_USE_BEFORE_INPUT: boolean =
    CAN_USE_DOM && 'InputEvent' in window && !documentMode
        ? 'getTargetRanges' in new window.InputEvent('input')
        : false;

export const IS_SAFARI: boolean =
    CAN_USE_DOM && /Version\/[\d.]+.*Safari/.test(navigator.userAgent);

export const IS_IOS: boolean =
    CAN_USE_DOM &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;


// Keep these in case we need to use them in the future.
// export const IS_WINDOWS: boolean = CAN_USE_DOM && /Win/.test(navigator.platform);
export const IS_CHROME: boolean =
    CAN_USE_DOM && /^(?=.*Chrome).*/i.test(navigator.userAgent);
// export const canUseTextInputEvent: boolean = CAN_USE_DOM && 'TextEvent' in window && !documentMode;

export const IS_APPLE_WEBKIT =
    CAN_USE_DOM && /AppleWebKit\/[\d.]+/.test(navigator.userAgent) && !IS_CHROME;

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
     * Callback when sending starts
     */
    onStartSending: () => void
    /**
     * Callback when sending stops
     */
    onStopSending: () => void
};

const SendButton: FC<SendButtonProps> = memo(({ roomID, onStartSending, onStopSending }: SendButtonProps) => {
    const room = useRoom(roomID || "");
    const [editor] = useLexicalComposerContext();

    const sendMessage = async () => {
        // TODO: Sanitize the html and send message to room
        if (!room) {
            return;
        }

        let htmlMessage = $generateHtmlFromNodes(editor);
        // TODO: Make sure that we strip any non matrix stuff
        const codeRegex = /(?<all><code .* (?:data-highlight-language="(?<language>.*?)")(?: .*?)?>(?<code>[\s\S]*?)<\/code>)/;
        let matched = codeRegex.exec(htmlMessage);
        while (matched !== null) {
            if (matched) {
                const { groups } = matched;
                if (groups) {
                    let { all, language, code } = groups;

                    const spanRegex = /<span(?: class=".*?")?>(?<content>.*?)<\/span>/;
                    let matchedspans = spanRegex.exec(code);
                    while (matchedspans !== null) {
                        if (matchedspans) {
                            const { groups } = matchedspans;
                            if (groups) {
                                const { content } = groups;

                                code = code.replaceAll(matchedspans[0], content)
                            }
                        }
                        matchedspans = spanRegex.exec(code)
                    }

                    code = code.replaceAll("<br>", "\n")
                    htmlMessage = htmlMessage.replace(all, `<pre><code class="language-${language}">${code}</code></pre>`)
                }
            }
            matched = codeRegex.exec(htmlMessage)
        }
        const plainMessage = $convertToMarkdownString(TRANSFORMERS);

        console.log(htmlMessage)
        // TODO: local echo
        if ((htmlMessage === "" && plainMessage === "") || htmlMessage === '<p class="editor-paragraph"><br></p>') {
            return;
        }
        onStartSending();
        console.log("Sending message to: ", roomID)

        if (htmlMessage !== '<p class="editor-paragraph"><br></p>') {
            try {
                await room.sendHtmlMessage(htmlMessage, plainMessage);
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
                editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
                localStorage.removeItem(`editor-${roomID}`);
            } catch (e: any) {
                console.log(e);
            }
        } else {
            try {
                await room.sendTextMessage(plainMessage);
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
                editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
                localStorage.removeItem(`editor-${roomID}`);
            } catch (e: any) {
                console.log(e);
            }
        }
        onStopSending();
    }

    useEffect(() => {
        editor.registerCommand<KeyboardEvent | null>(
            KEY_ENTER_COMMAND,
            (event) => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) {
                    return false;
                }
                if (event !== null) {
                    // If we have beforeinput, then we can avoid blocking
                    // the default behavior. This ensures that the iOS can
                    // intercept that we're actually inserting a paragraph,
                    // and autocomplete, autocapitalize etc work as intended.
                    // This can also cause a strange performance issue in
                    // Safari, where there is a noticeable pause due to
                    // preventing the key down of enter.
                    if (
                        (IS_IOS || IS_SAFARI || IS_APPLE_WEBKIT) &&
                        CAN_USE_BEFORE_INPUT
                    ) {
                        return false;
                    }
                    event.preventDefault();
                    if (event.shiftKey) {
                        return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
                    }
                }
                sendMessage();
                return editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
            },
            COMMAND_PRIORITY_CRITICAL,
        )
    }, [editor])

    return <Send
        size={45}
        stroke='unset'
        className='stroke-slate-600 rounded m-4 hover:bg-slate-300 hover:stroke-slate-500 p-2 cursor-pointer'
        onClick={sendMessage} />
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
                editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
            }
        }
    }, [pathname, roomID]);

    return <></>
}

const ChatInput: FC<ChatInputProps> = memo(({ namespace, roomID }: ChatInputProps) => {
    const [sending, setSending] = useState(false);

    const initialConfig: InitialConfigType = {
        namespace: namespace,
        theme: EditorTheme,
        onError: (e) => console.error(e),
        editable: !sending,
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
            LinkNode,
            CustomParagraphNode,
            {
                replace: ParagraphNode,
                with: (_node: ParagraphNode) => {
                    return new CustomParagraphNode();
                }
            }
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
                        {/*<TreeViewPlugin />*/}
                    </div>
                </div>
                <SendButton roomID={roomID} onStartSending={() => { console.log("Sending"); setSending(true) }} onStopSending={() => { setSending(false) }} />
            </LexicalComposer>

        </div>
    );
})

export default ChatInput;