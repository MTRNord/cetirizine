import{C as d,L as c,a as r,b as i}from"./input-3b9dc5dd.js";import{e as m}from"./index-9ff52a90.js";import"./jsx-runtime-ccada58e.js";import"./index-f1f749bf.js";import"./_commonjsHelpers-042e6b4d.js";import"./index-67faaf7e.js";import"./chevron-down-2d8ad7a7.js";const R={title:"Chat/Input",tags:["autodocs"],component:d,parameters:{badges:[m.EXPERIMENTAL]},argTypes:{namespace:{required:!0,name:"Namespace",description:"The Namespace of the editor."},onChange:{description:"The onChange handler of the editor.",required:!0},onError:{description:"The error handler of the editor.",required:!0}}},e={args:{onChange:(o,t)=>{o.read(()=>{const n=c.$getRoot(),a=r.$convertToMarkdownString(r.TRANSFORMERS,n),s=i.$generateHtmlFromNodes(t,null);console.log(a),console.log(s)})},onError:o=>{console.error(o)},namespace:"Editor"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
    onError: error => {
      console.error(error);
    },
    namespace: "Editor"
  }
}`,...e.parameters?.docs?.source}}};const f=["Default"];export{e as Default,f as __namedExportsOrder,R as default};
//# sourceMappingURL=input.stories-aef31029.js.map
