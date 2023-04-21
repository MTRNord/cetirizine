import{j as e}from"./jsx-runtime-ccada58e.js";import{A as v}from"./avatar-96fdaf75.js";import{e as H}from"./index-9ff52a90.js";import"./index-f1f749bf.js";import"./_commonjsHelpers-042e6b4d.js";function J({avatarUrl:d,displayname:a,dm:u=!1,online:f=!1,active:G=!1}){return G?e.jsxs("div",{className:"flex flex-row gap-2 p-1 bg-gray-300 rounded duration-150 ease-in items-center",children:[e.jsx(v,{avatarUrl:d,displayname:a,dm:u,online:f}),e.jsx("span",{className:"text-black font-normal text-xl capitalize",children:a})]}):e.jsxs("div",{className:"flex flex-row gap-2 p-1 hover:bg-gray-300 hover:rounded duration-150 ease-in items-center",children:[e.jsx(v,{avatarUrl:d,displayname:a,dm:u,online:f}),e.jsx("span",{className:"text-black font-normal text-xl capitalize",children:a})]})}try{roomListItem.displayName="roomListItem",roomListItem.__docgenInfo={description:"",displayName:"roomListItem",props:{avatarUrl:{defaultValue:null,description:"The URL of the Avatar image",name:"avatarUrl",required:!1,type:{name:"string"}},displayname:{defaultValue:null,description:"The displayname of the room list item",name:"displayname",required:!0,type:{name:"string"}},dm:{defaultValue:{value:"false"},description:"Wether it is a DM or not",name:"dm",required:!1,type:{name:"boolean"}},online:{defaultValue:{value:"false"},description:"Wether the user is online. Only used if dm is true.",name:"online",required:!1,type:{name:"boolean"}},active:{defaultValue:{value:"false"},description:"Wether the current room is selected",name:"active",required:!1,type:{name:"boolean"}}}}}catch{}const ee={title:"Chat/RoomList/Item",tags:["autodocs"],component:J,parameters:{badges:[H.EXPERIMENTAL]},argTypes:{avatarUrl:{required:!1,name:"Avatar URL",description:"The URL of the avatar image"},displayname:{required:!0,name:"Displayname",description:"The displayname of the Room"},dm:{required:!1,defaultValue:!1,control:"boolean",name:"DM",description:"Wether the room is a DM"},online:{required:!1,defaultValue:!1,control:"boolean",name:"Online",description:"Wether the user is online. Only used if dm is true"},active:{required:!1,defaultValue:!1,control:"boolean",name:"Active",description:"Wether the room is currently selected"}}},r={args:{displayname:"test",dm:!1,online:!1,avatarUrl:"",active:!1}},t={args:{displayname:"test",dm:!1,online:!1,avatarUrl:"",active:!0}},s={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!1,online:!1,active:!1}},n={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!1,online:!1,active:!0}},o={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!1,active:!1}},i={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!1,active:!0}},l={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!0,active:!1}},m={args:{displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!0,active:!0}},p={args:{displayname:"test",avatarUrl:"",dm:!0,online:!1,active:!1}},c={args:{displayname:"test",avatarUrl:"",dm:!0,online:!0,active:!1}};var g,h,y;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    dm: false,
    online: false,
    avatarUrl: "",
    active: false
  }
}`,...(y=(h=r.parameters)==null?void 0:h.docs)==null?void 0:y.source}}};var U,j,x;t.parameters={...t.parameters,docs:{...(U=t.parameters)==null?void 0:U.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    dm: false,
    online: false,
    avatarUrl: "",
    active: true
  }
}`,...(x=(j=t.parameters)==null?void 0:j.docs)==null?void 0:x.source}}};var A,D,M;s.parameters={...s.parameters,docs:{...(A=s.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: false,
    online: false,
    active: false
  }
}`,...(M=(D=s.parameters)==null?void 0:D.docs)==null?void 0:M.source}}};var O,b,I;n.parameters={...n.parameters,docs:{...(O=n.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: false,
    online: false,
    active: true
  }
}`,...(I=(b=n.parameters)==null?void 0:b.docs)==null?void 0:I.source}}};var N,q,L;o.parameters={...o.parameters,docs:{...(N=o.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: true,
    online: false,
    active: false
  }
}`,...(L=(q=o.parameters)==null?void 0:q.docs)==null?void 0:L.source}}};var S,_,R;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: true,
    online: false,
    active: true
  }
}`,...(R=(_=i.parameters)==null?void 0:_.docs)==null?void 0:R.source}}};var V,k,T;l.parameters={...l.parameters,docs:{...(V=l.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: true,
    online: true,
    active: false
  }
}`,...(T=(k=l.parameters)==null?void 0:k.docs)==null?void 0:T.source}}};var W,E,F;m.parameters={...m.parameters,docs:{...(W=m.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
    dm: true,
    online: true,
    active: true
  }
}`,...(F=(E=m.parameters)==null?void 0:E.docs)==null?void 0:F.source}}};var w,z,C;p.parameters={...p.parameters,docs:{...(w=p.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "",
    dm: true,
    online: false,
    active: false
  }
}`,...(C=(z=p.parameters)==null?void 0:z.docs)==null?void 0:C.source}}};var P,X,B;c.parameters={...c.parameters,docs:{...(P=c.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    displayname: "test",
    avatarUrl: "",
    dm: true,
    online: true,
    active: false
  }
}`,...(B=(X=c.parameters)==null?void 0:X.docs)==null?void 0:B.source}}};const ae=["Fallback","FallbackActive","Image","ImageActive","DMOffline","DMOfflineActive","DMOnline","DMOnlineActive","DMNoAvatarOffline","DMNoAvatarOnline"];export{p as DMNoAvatarOffline,c as DMNoAvatarOnline,o as DMOffline,i as DMOfflineActive,l as DMOnline,m as DMOnlineActive,r as Fallback,t as FallbackActive,s as Image,n as ImageActive,ae as __namedExportsOrder,ee as default};
//# sourceMappingURL=roomListItem.stories-e5255f01.js.map
