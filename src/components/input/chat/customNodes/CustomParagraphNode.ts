import { $applyNodeReplacement, $getRoot, DOMExportOutput, LexicalEditor, ParagraphNode, SerializedElementNode, SerializedParagraphNode } from "lexical";

export class CustomParagraphNode extends ParagraphNode {
    static getType(): string {
        return "custom-paragraph";
    }

    static clone(node: CustomParagraphNode): CustomParagraphNode {
        return new CustomParagraphNode(node.__key);
    }

    exportDOM(editor: LexicalEditor): DOMExportOutput {
        const { element } = super.exportDOM(editor);

        if (this.isEmpty()) {
            const root = $getRoot();
            let foundFurtherText = false;
            for (const child of root.getChildren()) {
                if (child === this) {
                    continue;
                }
                if (child instanceof CustomParagraphNode || child instanceof ParagraphNode) {
                    if (!child.isEmpty()) {
                        foundFurtherText = true;
                    }
                }
            }
            if (!foundFurtherText) {
                return { element: null };
            }
        }

        return { element };
    }

    exportJSON(): SerializedElementNode {
        const node = super.exportJSON();
        node.type = "custom-paragraph";
        return node;
    }

    static importJSON(node: SerializedParagraphNode): CustomParagraphNode {
        return super.importJSON(node);
    }
}

export function $createCustomParagraphNode(): CustomParagraphNode {
    return $applyNodeReplacement(new CustomParagraphNode());
}