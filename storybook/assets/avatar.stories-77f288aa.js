import{j as e}from"./jsx-runtime-ccada58e.js";import{e as _}from"./index-9ff52a90.js";import"./index-f1f749bf.js";import"./_commonjsHelpers-042e6b4d.js";function q({avatarUrl:l,userID:i,dm:u=!1,online:m=!1}){return l?e.jsxs("div",{className:"flex relative w-12 h-12 justify-center items-center m-1 mr-2 text-xl rounded-full text-white",children:[e.jsx("img",{className:"rounded-full",alt:i,src:l}),u?m?e.jsx("div",{className:"bg-green-500 rounded-full w-3 h-3 absolute bottom-[2px] right-[2px]"}):e.jsx("div",{className:"bg-red-500 rounded-full w-3 h-3 absolute bottom-[2px] right-[2px]"}):e.jsx(e.Fragment,{})]}):e.jsxs("div",{className:"flex relative w-12 h-12 bg-orange-500 justify-center items-center m-1 mr-2 text-xl rounded-full text-white",children:[i[0].toUpperCase(),u?m?e.jsx("div",{className:"bg-green-500 rounded-full w-3 h-3 absolute bottom-[2px] right-[2px]"}):e.jsx("div",{className:"bg-red-500 rounded-full w-3 h-3 absolute bottom-[2px] right-[2px]"}):e.jsx(e.Fragment,{})]})}try{avatar.displayName="avatar",avatar.__docgenInfo={description:"",displayName:"avatar",props:{avatarUrl:{defaultValue:null,description:"The URL of the Avatar image",name:"avatarUrl",required:!1,type:{name:"string"}},userID:{defaultValue:null,description:"The displayname of the avatar user",name:"userID",required:!0,type:{name:"string"}},dm:{defaultValue:{value:"false"},description:"Wether it is a DM or not",name:"dm",required:!1,type:{name:"boolean"}},online:{defaultValue:{value:"false"},description:"Wether the user is online. Only used if dm is true.",name:"online",required:!1,type:{name:"boolean"}}}}}catch{}const E={title:"Chat/Avatar",tags:["autodocs"],component:q,parameters:{badges:[_.EXPERIMENTAL]},argTypes:{avatarUrl:{required:!1,name:"Avatar URL",description:"The URL of the avatar image"},userID:{required:!0,name:"User ID",description:"The DISPLAY name of the User"},dm:{required:!1,defaultValue:!1,control:"boolean",name:"DM",description:"Wether the Avatar is used for a DM"},online:{required:!1,defaultValue:!1,control:"boolean",name:"Online",description:"Wether the user is online. Only used if dm is true"}}},r={args:{userID:"test",dm:!1,online:!1,avatarUrl:""}},a={args:{userID:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!1,online:!1}},t={args:{userID:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!1}},s={args:{userID:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!0}},n={args:{userID:"test",avatarUrl:"",dm:!0,online:!1}},o={args:{userID:"test",avatarUrl:"",dm:!0,online:!0}};var d,p,c;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    userID: "test",
    dm: false,
    online: false,
    avatarUrl: ""
  }
}`,...(c=(p=r.parameters)==null?void 0:p.docs)==null?void 0:c.source}}};var f,g,v;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    userID: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: false,
    online: false
  }
}`,...(v=(g=a.parameters)==null?void 0:g.docs)==null?void 0:v.source}}};var h,x,D;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    userID: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: true,
    online: false
  }
}`,...(D=(x=t.parameters)==null?void 0:x.docs)==null?void 0:D.source}}};var b,I,U;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    userID: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: true,
    online: true
  }
}`,...(U=(I=s.parameters)==null?void 0:I.docs)==null?void 0:U.source}}};var j,y,N;n.parameters={...n.parameters,docs:{...(j=n.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    userID: "test",
    avatarUrl: "",
    dm: true,
    online: false
  }
}`,...(N=(y=n.parameters)==null?void 0:y.docs)==null?void 0:N.source}}};var M,O,A;o.parameters={...o.parameters,docs:{...(M=o.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    userID: "test",
    avatarUrl: "",
    dm: true,
    online: true
  }
}`,...(A=(O=o.parameters)==null?void 0:O.docs)==null?void 0:A.source}}};const L=["Fallback","Image","DMOffline","DMOnline","DMNoAvatarOffline","DMNoAvatarOnline"];export{n as DMNoAvatarOffline,o as DMNoAvatarOnline,t as DMOffline,s as DMOnline,r as Fallback,a as Image,L as __namedExportsOrder,E as default};
//# sourceMappingURL=avatar.stories-77f288aa.js.map
