import{A as o}from"./avatar-aa8bc704.js";import{e as m}from"./index-9ff52a90.js";import"./jsx-runtime-ccada58e.js";import"./index-f1f749bf.js";import"./_commonjsHelpers-042e6b4d.js";const u={title:"Chat/Avatar",tags:["autodocs"],component:o,parameters:{badges:[m.EXPERIMENTAL]},argTypes:{avatarUrl:{required:!1,name:"Avatar URL",description:"The URL of the avatar image"},displayname:{required:!0,name:"User ID",description:"The DISPLAY name of the User"},dm:{required:!1,defaultValue:!1,control:"boolean",name:"DM",description:"Wether the Avatar is used for a DM"},online:{required:!1,defaultValue:!1,control:"boolean",name:"Online",description:"Wether the user is online. Only used if dm is true"}}},a={args:{displayname:"test",dm:!1,online:!1,avatarUrl:""}},e={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!1,online:!1}},r={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!1}},s={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!0}},t={args:{displayname:"test",avatarUrl:"",dm:!0,online:!1}},n={args:{displayname:"test",avatarUrl:"",dm:!0,online:!0}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    dm: false,
    online: false,
    avatarUrl: ""
  }
}`,...a.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: false,
    online: false
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: true,
    online: false
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: true,
    online: true
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "",
    dm: true,
    online: false
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "",
    dm: true,
    online: true
  }
}`,...n.parameters?.docs?.source}}};const f=["Fallback","Image","DMOffline","DMOnline","DMNoAvatarOffline","DMNoAvatarOnline"];export{t as DMNoAvatarOffline,n as DMNoAvatarOnline,r as DMOffline,s as DMOnline,a as Fallback,e as Image,f as __namedExportsOrder,u as default};
//# sourceMappingURL=avatar.stories-701e7cbd.js.map
