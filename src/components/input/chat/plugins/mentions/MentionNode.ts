import type { Spread } from "lexical";

import {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedTextNode,
    TextNode
} from "lexical";
import { IRoomMemberEvent } from "../../../../../app/sdk/api/events";

export type SerializedMentionNode = Spread<
    {
        mentionEvent: IRoomMemberEvent;
        type: "mention";
        version: 1;
    },
    SerializedTextNode
>;

function convertMentionElement(
    domNode: HTMLElement
): DOMConversionOutput | null {
    const textContent = domNode.textContent;
    const mxid = domNode.getAttribute("data-lexical-mention-mxid");

    if (textContent && mxid) {
        const node = $createMentionNode({
            state_key: mxid,
            content: {
                displayname: textContent,
            }
        } as IRoomMemberEvent);
        return {
            node
        };
    }

    return null;
}

export class MentionNode extends TextNode {
    __mention: IRoomMemberEvent;

    static getType(): string {
        return "mention";
    }

    static clone(node: MentionNode): MentionNode {
        return new MentionNode(node.__mention, node.__text, node.__key);
    }
    static importJSON(serializedNode: SerializedMentionNode): MentionNode {
        const node = $createMentionNode(serializedNode.mentionEvent);
        node.setTextContent(serializedNode.text);
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }

    constructor(memberEvent: IRoomMemberEvent, text?: string, key?: NodeKey) {
        super(text ?? (memberEvent.content.displayname || memberEvent.state_key), key);
        this.__mention = memberEvent;
    }

    exportJSON(): SerializedMentionNode {
        return {
            ...super.exportJSON(),
            mentionEvent: this.__mention,
            type: "mention",
            version: 1
        };
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = super.createDOM(config);
        dom.className = "mention";
        return dom;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("a");
        element.setAttribute("href", `matrix:u/${this.__mention.state_key.replace("@", "")}`);
        element.setAttribute("data-lexical-mention", "true");
        element.setAttribute("data-lexical-mention-mxid", this.__mention.state_key);
        element.textContent = this.__text;
        return { element };
    }

    isSegmented(): false {
        return false;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            a: (domNode: HTMLElement) => {
                if (!domNode.hasAttribute("data-lexical-mention") && !domNode.hasAttribute("data-lexical-mention-mxid")) {
                    return null;
                }
                return {
                    conversion: convertMentionElement,
                    priority: 1
                };
            }
        };
    }

    isTextEntity(): true {
        return true;
    }

    isToken(): true {
        return true;
    }
}

export function $createMentionNode(memberEvent: IRoomMemberEvent,): MentionNode {
    const mentionNode = new MentionNode(memberEvent);
    mentionNode.setMode("segmented").toggleDirectionless();
    return mentionNode;
}

export function $isMentionNode(
    node: LexicalNode | null | undefined
): node is MentionNode {
    return node instanceof MentionNode;
}
