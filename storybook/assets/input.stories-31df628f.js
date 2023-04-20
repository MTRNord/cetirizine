import{j as a}from"./jsx-runtime-055a4fc0.js";import{P as l,s as d}from"./store-2017857c.js";import{I as n}from"./input-08fe527b.js";import{e as u}from"./index-9ff52a90.js";import"./index-c6eaa83f.js";import"./_commonjsHelpers-042e6b4d.js";import"./extends-98964cd2.js";const P={title:"Fundamentals/Inputs/BasicInput",tags:["autodocs"],component:n,parameters:{badges:[u.EXPERIMENTAL]},argTypes:{placeholder:{required:!0,name:"Placeholder",description:"The Placeholder for the input field. Shown if it is empty."},password:{required:!1,name:"Password",control:"boolean",defaultValue:!1,description:"If the input field takes a password."},autoFocus:{required:!1,name:"Auto Focus",control:"boolean",defaultValue:!1,description:"If the field should be focused automatically."},value:{required:!0,name:"Value",description:"The current value of the input."},onChange:{description:"The onChange handler of the input field.",required:!0}}},e={args:{placeholder:"Placeholder",password:!1,autoFocus:!1,value:"",onChange:r=>{}},render:r=>a.jsx(l,{store:d,children:a.jsx(n,{...r})})};var o,s,t;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    placeholder: "Placeholder",
    password: false,
    autoFocus: false,
    value: "",
    onChange: _ => {}
  },
  render: args => <Provider store={store}>
        <Input {...args} />
    </Provider>
}`,...(t=(s=e.parameters)==null?void 0:s.docs)==null?void 0:t.source}}};const I=["Default"];export{e as Default,I as __namedExportsOrder,P as default};
//# sourceMappingURL=input.stories-31df628f.js.map
