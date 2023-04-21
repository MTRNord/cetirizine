import{A as S}from"./avatar-96fdaf75.js";import{e as j}from"./index-9ff52a90.js";import"./jsx-runtime-ccada58e.js";import"./index-f1f749bf.js";import"./_commonjsHelpers-042e6b4d.js";const L={title:"Chat/Avatar",tags:["autodocs"],component:S,parameters:{badges:[j.EXPERIMENTAL]},argTypes:{avatarUrl:{required:!1,name:"Avatar URL",description:"The URL of the avatar image"},displayname:{required:!0,name:"User ID",description:"The DISPLAY name of the User"},dm:{required:!1,defaultValue:!1,control:"boolean",name:"DM",description:"Wether the Avatar is used for a DM"},online:{required:!1,defaultValue:!1,control:"boolean",name:"Online",description:"Wether the user is online. Only used if dm is true"}}},a={args:{displayname:"test",dm:!1,online:!1,avatarUrl:""}},e={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!1,online:!1}},r={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!1}},s={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!0}},t={args:{displayname:"test",avatarUrl:"",dm:!0,online:!1}},n={args:{displayname:"test",avatarUrl:"",dm:!0,online:!0}};var o,m,l;a.parameters={...a.parameters,docs:{...(o=a.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    dm: false,
    online: false,
    avatarUrl: ""
  }
}`,...(l=(m=a.parameters)==null?void 0:m.docs)==null?void 0:l.source}}};var i,p,d;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: false,
    online: false
  }
}`,...(d=(p=e.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var c,u,f;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: true,
    online: false
  }
}`,...(f=(u=r.parameters)==null?void 0:u.docs)==null?void 0:f.source}}};var g,v,U;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: true,
    online: true
  }
}`,...(U=(v=s.parameters)==null?void 0:v.docs)==null?void 0:U.source}}};var h,y,D;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "",
    dm: true,
    online: false
  }
}`,...(D=(y=t.parameters)==null?void 0:y.docs)==null?void 0:D.source}}};var A,M,O;n.parameters={...n.parameters,docs:{...(A=n.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "",
    dm: true,
    online: true
  }
}`,...(O=(M=n.parameters)==null?void 0:M.docs)==null?void 0:O.source}}};const T=["Fallback","Image","DMOffline","DMOnline","DMNoAvatarOffline","DMNoAvatarOnline"];export{t as DMNoAvatarOffline,n as DMNoAvatarOnline,r as DMOffline,s as DMOnline,a as Fallback,e as Image,T as __namedExportsOrder,L as default};
//# sourceMappingURL=avatar.stories-f9ef4283.js.map
