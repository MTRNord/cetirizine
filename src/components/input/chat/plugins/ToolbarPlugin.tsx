import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    ChangeEventHandler,
    ChangeEvent,
    MutableRefObject,
    Dispatch,
    SetStateAction,
    createElement
} from "react";
import {
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    REDO_COMMAND,
    UNDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    FORMAT_TEXT_COMMAND,
    $getSelection,
    $isRangeSelection,
    $createParagraphNode,
    $getNodeByKey,
    LexicalEditor,
    RangeSelection,
    NodeSelection,
    GridSelection
} from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
    $isParentElementRTL,
    $wrapNodes,
    $isAtNodeEnd
} from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    REMOVE_LIST_COMMAND,
    $isListNode,
    ListNode
} from "@lexical/list";
import { createPortal } from "react-dom";
import {
    $createHeadingNode,
    $createQuoteNode,
    $isHeadingNode
} from "@lexical/rich-text";
import {
    $createCodeNode,
    $isCodeNode,
    getDefaultCodeLanguage,
    getCodeLanguages
} from "@lexical/code";
import { Bold, ChevronDown, Code, Heading1, Heading2, Heading4, Heading5, Italic, Link, List, ListOrdered, Quote, Redo, Strikethrough, Text, Underline, Undo } from "lucide-react";
import { Heading3 } from "lucide-react";

const LowPriority = 1;

const supportedBlockTypes = new Set([
    "paragraph",
    "quote",
    "code",
    "h1",
    "h2",
    "ul",
    "ol"
]);

interface BlockTypes {
    code: string,
    h1: string,
    h2: string,
    h3: string,
    h4: string,
    h5: string,
    ol: string,
    paragraph: string,
    quote: string,
    ul: string
}

const blockTypeToBlockName: BlockTypes = {
    code: "Code Block",
    h1: "Large Heading",
    h2: "Small Heading",
    h3: "Heading",
    h4: "Heading",
    h5: "Heading",
    ol: "Numbered List",
    paragraph: "Normal",
    quote: "Quote",
    ul: "Bulleted List"
} as const;

type BlockType = keyof typeof blockTypeToBlockName;

function Divider() {
    return <div className="divider" />;
}

function positionEditorElement(editor: HTMLDivElement, rect: DOMRect | undefined) {
    if (!rect) {
        editor.style.opacity = "0";
        editor.style.top = "-1000px";
        editor.style.left = "-1000px";
    } else {
        editor.style.opacity = "1";
        editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
        editor.style.left = `${rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2
            }px`;
    }
}

function FloatingLinkEditor({ editor }: { editor: LexicalEditor }) {
    const editorRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
    const inputRef: MutableRefObject<HTMLInputElement | null> = useRef(null);
    const mouseDownRef = useRef(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [isEditMode, setEditMode] = useState(false);
    const [lastSelection, setLastSelection] = useState<RangeSelection | GridSelection | NodeSelection | null>(null);

    const updateLinkEditor = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ($isLinkNode(parent)) {
                setLinkUrl(parent.getURL());
            } else if ($isLinkNode(node)) {
                setLinkUrl(node.getURL());
            } else {
                setLinkUrl("");
            }
        }
        const editorElem = editorRef.current;
        const nativeSelection = window.getSelection();
        const activeElement = document.activeElement;

        if (editorElem === null) {
            return;
        }

        const rootElement = editor.getRootElement();
        if (
            selection !== null &&
            !nativeSelection?.isCollapsed &&
            rootElement !== null &&
            rootElement.contains(nativeSelection?.anchorNode as (Node | null))
        ) {
            const domRange = nativeSelection?.getRangeAt(0);
            let rect;
            if (nativeSelection?.anchorNode === rootElement) {
                let inner = rootElement;
                while (inner.firstElementChild != null) {
                    inner = inner.firstElementChild as HTMLElement;
                }
                rect = inner.getBoundingClientRect();
            } else {
                rect = domRange?.getBoundingClientRect();
            }

            if (!mouseDownRef.current) {
                positionEditorElement(editorElem, rect);
            }
            setLastSelection(selection);
        } else if (!activeElement || activeElement.className !== "link-input") {
            positionEditorElement(editorElem, undefined);
            setLastSelection(null);
            setEditMode(false);
            setLinkUrl("");
        }

        return true;
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateLinkEditor();
                });
            }),

            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateLinkEditor();
                    return true;
                },
                LowPriority
            )
        );
    }, [editor, updateLinkEditor]);

    useEffect(() => {
        editor.getEditorState().read(() => {
            updateLinkEditor();
        });
    }, [editor, updateLinkEditor]);

    useEffect(() => {
        if (isEditMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditMode]);

    const safeLink = createElement("a", { href: linkUrl, target: "_blank", rel: "noopener noreferrer" }, linkUrl);

    return (
        <div ref={editorRef} className="link-editor">
            {isEditMode ? (
                <input
                    ref={inputRef}
                    className="link-input"
                    value={linkUrl}
                    onChange={(event) => {
                        setLinkUrl(event.target.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            if (lastSelection !== null) {
                                if (linkUrl !== "") {
                                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                                }
                                setEditMode(false);
                            }
                        } else if (event.key === "Escape") {
                            event.preventDefault();
                            setEditMode(false);
                        }
                    }}
                />
            ) : (
                <>
                    <div className="link-input">
                        {safeLink}
                        <div
                            className="link-edit"
                            role="button"
                            tabIndex={0}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                setEditMode(true);
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

function Select({ onChange, className, options, value }: { onChange: ChangeEventHandler<HTMLSelectElement>, className: string, options: string[], value: string | ReadonlyArray<string> | number }) {
    return (
        <select className={className} onChange={onChange} value={value}>
            <option hidden={true} value="" />
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}

function getSelectedNode(selection: RangeSelection | GridSelection) {
    const anchor = selection.anchor;
    const focus = selection.focus;
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    if (anchorNode === focusNode) {
        return anchorNode;
    }
    const isBackward = selection.isBackward();
    if (isBackward) {
        return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
        return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
    }
}

function BlockOptionsDropdownList({
    editor,
    blockType,
    toolbarRef,
    setShowBlockOptionsDropDown
}: { editor: LexicalEditor, blockType: BlockType, toolbarRef: MutableRefObject<HTMLDivElement | null>, setShowBlockOptionsDropDown: Dispatch<SetStateAction<boolean>> }) {
    const dropDownRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

    useEffect(() => {
        const toolbar = toolbarRef.current;
        const dropDown = dropDownRef.current;

        if (toolbar !== null && dropDown !== null) {
            const { top, left } = toolbar.getBoundingClientRect();
            dropDown.style.top = `${top + 40}px`;
            dropDown.style.left = `${left}px`;
        }
    }, [dropDownRef, toolbarRef]);

    useEffect(() => {
        const dropDown = dropDownRef.current;
        const toolbar = toolbarRef.current;

        if (dropDown !== null && toolbar !== null) {
            const handle = (event: MouseEvent) => {
                const target = event.target;

                if (!dropDown.contains(target as Node) && !toolbar.contains(target as Node)) {
                    setShowBlockOptionsDropDown(false);
                }
            };
            document.addEventListener("click", handle);

            return () => {
                document.removeEventListener("click", handle);
            };
        }
    }, [dropDownRef, setShowBlockOptionsDropDown, toolbarRef]);

    const formatParagraph = () => {
        if (blockType !== "paragraph") {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createParagraphNode());
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };

    const formatLargeHeading = () => {
        if (blockType !== "h1") {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createHeadingNode("h1"));
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };

    const formatSmallHeading = () => {
        if (blockType !== "h2") {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createHeadingNode("h2"));
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };

    const formatBulletList = () => {
        if (blockType !== "ul") {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
        setShowBlockOptionsDropDown(false);
    };

    const formatNumberedList = () => {
        if (blockType !== "ol") {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else {
            editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
        setShowBlockOptionsDropDown(false);
    };

    const formatQuote = () => {
        if (blockType !== "quote") {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createQuoteNode());
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };

    const formatCode = () => {
        if (blockType !== "code") {
            editor.update(() => {
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    $wrapNodes(selection, () => $createCodeNode());
                }
            });
        }
        setShowBlockOptionsDropDown(false);
    };

    return (
        <div className="dropdown" ref={dropDownRef}>
            <button className="item" onClick={formatParagraph}>
                <Text className="icon" size={20} />
                <span className="text">Normal</span>
                {blockType === "paragraph" && <span className="active" />}
            </button>
            <button className="item" onClick={formatLargeHeading}>
                <Heading1 className="icon" size={20} />
                <span className="text">Large Heading</span>
                {blockType === "h1" && <span className="active" />}
            </button>
            <button className="item" onClick={formatSmallHeading}>
                <Heading2 className="icon" size={20} />
                <span className="text">Small Heading</span>
                {blockType === "h2" && <span className="active" />}
            </button>
            <button className="item" onClick={formatBulletList}>
                <List className="icon" size={20} />
                <span className="text">Bullet List</span>
                {blockType === "ul" && <span className="active" />}
            </button>
            <button className="item" onClick={formatNumberedList}>
                <ListOrdered className="icon" size={20} />
                <span className="text">Numbered List</span>
                {blockType === "ol" && <span className="active" />}
            </button>
            <button className="item" onClick={formatQuote}>
                <Quote className="icon" size={20} />
                <span className="text">Quote</span>
                {blockType === "quote" && <span className="active" />}
            </button>
            <button className="item" onClick={formatCode}>
                <Code className="icon" size={20} />
                <span className="text">Code Block</span>
                {blockType === "code" && <span className="active" />}
            </button>
        </div>
    );
}

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const toolbarRef = useRef(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [blockType, setBlockType] = useState<BlockType>("paragraph");
    const [selectedElementKey, setSelectedElementKey] = useState(null);
    const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] = useState(
        false
    );
    const [codeLanguage, setCodeLanguage] = useState("");
    const [_isRTL, setIsRTL] = useState(false);
    const [isLink, setIsLink] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isCode, setIsCode] = useState(false);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            const element =
                anchorNode.getKey() === "root"
                    ? anchorNode
                    : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);
            if (elementDOM !== null) {
                setSelectedElementKey(elementKey);
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType(anchorNode, ListNode);
                    const type = parentList ? parentList.getTag() : element.getTag();
                    setBlockType(type);
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType();
                    setBlockType(type);
                    if ($isCodeNode(element)) {
                        setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage());
                    }
                }
            }
            // Update text format
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            setIsUnderline(selection.hasFormat("underline"));
            setIsStrikethrough(selection.hasFormat("strikethrough"));
            setIsCode(selection.hasFormat("code"));
            setIsRTL($isParentElementRTL(selection));

            // Update links
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ($isLinkNode(parent) || $isLinkNode(node)) {
                setIsLink(true);
            } else {
                setIsLink(false);
            }
        }
    }, [editor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, _newEditor) => {
                    updateToolbar();
                    return false;
                },
                LowPriority
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                LowPriority
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                LowPriority
            )
        );
    }, [editor, updateToolbar]);

    const codeLanguges = useMemo(() => getCodeLanguages(), []);
    const onCodeLanguageSelect = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            editor.update(() => {
                if (selectedElementKey !== null) {
                    const node = $getNodeByKey(selectedElementKey);
                    if ($isCodeNode(node)) {
                        node.setLanguage(e.target.value);
                    }
                }
            });
        },
        [editor, selectedElementKey]
    );

    const insertLink = useCallback(() => {
        if (!isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
        } else {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [editor, isLink]);

    return (
        <div className="toolbar" ref={toolbarRef}>
            <button
                disabled={!canUndo}
                onClick={() => {
                    editor.dispatchCommand(UNDO_COMMAND, undefined);
                }}
                className="toolbar-item spaced"
                aria-label="Undo"
            >
                <Undo className="format" size={20} />
            </button>
            <button
                disabled={!canRedo}
                onClick={() => {
                    editor.dispatchCommand(REDO_COMMAND, undefined);
                }}
                className="toolbar-item"
                aria-label="Redo"
            >
                <Redo className="format" size={20} />
            </button>
            <Divider />
            {supportedBlockTypes.has(blockType) && (
                <>
                    <button
                        className="toolbar-item block-controls"
                        onClick={() =>
                            setShowBlockOptionsDropDown(!showBlockOptionsDropDown)
                        }
                        aria-label="Formatting Options"
                    >
                        {
                            blockType === "h1" ?
                                <Heading1 className="icon" size={20} /> :
                                blockType === "h2" ?
                                    <Heading2 className="icon" size={20} /> :
                                    blockType === "h3" ?
                                        <Heading3 className="icon" size={20} /> :
                                        blockType === "h4" ?
                                            <Heading4 className="icon" size={20} /> :
                                            blockType === "h5" ?
                                                <Heading5 className="icon" size={20} /> :
                                                blockType === "code" ?
                                                    <Code className="icon" size={20} /> :
                                                    blockType === "paragraph" ?
                                                        <Text className="icon" size={20} /> :
                                                        blockType === "ol" ?
                                                            <ListOrdered className="icon" size={20} /> :
                                                            blockType === "ul" ?
                                                                <List className="icon" size={20} /> :
                                                                blockType === "quote" ?
                                                                    <Quote className="icon" size={20} /> :
                                                                    <></>
                        }
                        <span className="text">{blockTypeToBlockName[blockType]}</span>
                        <ChevronDown size={20} />
                    </button>
                    {showBlockOptionsDropDown &&
                        createPortal(
                            <BlockOptionsDropdownList
                                editor={editor}
                                blockType={blockType}
                                toolbarRef={toolbarRef}
                                setShowBlockOptionsDropDown={setShowBlockOptionsDropDown}
                            />,
                            document.body
                        )}
                    <Divider />
                </>
            )}
            {blockType === "code" ? (
                <>
                    <Select
                        className="toolbar-item code-language"
                        onChange={onCodeLanguageSelect}
                        options={codeLanguges}
                        value={codeLanguage}
                    />
                    <i className="chevron-down inside" />
                </>
            ) : (
                <>
                    <button
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                        }}
                        className={"toolbar-item spaced " + (isBold ? "active" : "")}
                        aria-label="Format Bold"
                    >
                        <Bold className="format" size={20} />
                    </button>
                    <button
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
                        }}
                        className={"toolbar-item spaced " + (isItalic ? "active" : "")}
                        aria-label="Format Italics"
                    >
                        <Italic className="format" size={20} />
                    </button>
                    <button
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
                        }}
                        className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
                        aria-label="Format Underline"
                    >
                        <Underline className="format" size={20} />
                    </button>
                    <button
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
                        }}
                        className={
                            "toolbar-item spaced " + (isStrikethrough ? "active" : "")
                        }
                        aria-label="Format Strikethrough"
                    >
                        <Strikethrough className="format" size={20} />
                    </button>
                    <button
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
                        }}
                        className={"toolbar-item spaced " + (isCode ? "active" : "")}
                        aria-label="Insert Code"
                    >
                        <Code className="format" size={20} />
                    </button>
                    <button
                        onClick={insertLink}
                        className={"toolbar-item spaced " + (isLink ? "active" : "")}
                        aria-label="Insert Link"
                    >
                        <Link className="format" size={20} />
                    </button>
                    {isLink &&
                        createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
                    {" "}
                </>
            )}
        </div>
    );
}
