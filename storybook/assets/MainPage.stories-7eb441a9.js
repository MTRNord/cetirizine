import{j as s}from"./jsx-runtime-ccada58e.js";import{A as x}from"./avatar-89f1ae75.js";import{C as g}from"./input-4293af36.js";import{R as v}from"./roomList-8cec0948.js";import{u as h,a as D,b as N}from"./client-811bdff8.js";import{c as I}from"./chevron-down-2d8ad7a7.js";import"./index-f1f749bf.js";import"./_commonjsHelpers-042e6b4d.js";import"./index-67faaf7e.js";import"./roomListItem-b63ca857.js";const j=I("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);function c(){const t=h(),i=D(),d=N(),p=[...i].map(e=>{const u=[...e.children].filter(a=>!a.isSpace()).map(a=>({roomID:a.roomID,displayname:a.getName(),avatarUrl:a.getAvatarURL(),dm:a.isDM(),online:a.isOnline()})),m=a=>{const l=[...i].find(n=>n.spaceRoom.roomID===a.roomID);if(l){const n=[...l?.children].map(r=>({roomID:r.roomID,displayname:r.getName(),avatarUrl:r.getAvatarURL(),dm:r.isDM(),online:r.isOnline()}));return{sectionName:a.getName(),rooms:n,roomID:a.roomID,subsections:[...l?.children].filter(r=>r.isSpace()).map(m).filter(r=>r!==void 0)}}};return{sectionName:e.spaceRoom.getName(),rooms:u,roomID:e.spaceRoom.roomID,subsections:[...e.children].filter(a=>a.isSpace()).map(m)}}),f=[...d].filter(e=>!e.isSpace()).map(e=>({roomID:e.roomID,displayname:e.getName(),avatarUrl:e.getAvatarURL(),dm:e.isDM(),online:e.isOnline()}));return s.jsxs("div",{className:"flex flex-row w-full gap-2 min-h-screen h-screen",children:[s.jsxs("div",{className:"flex flex-col bg-gradient-to-br from-slate-100 via-gray-200 to-orange-200 border-r-[1px] border-slate-300",children:[s.jsxs("div",{className:"flex flex-row gap-2 m-2 p-1  items-center border-b-2",children:[t?.avatar_url&&s.jsx(x,{displayname:"Test",avatarUrl:t?.avatar_url,dm:!1,online:!1}),s.jsxs("div",{className:"flex flex-row justify-between items-center w-full",children:[s.jsx("span",{className:"text-base font-semibold",children:t?.displayname}),s.jsx(j,{size:28,stroke:"unset",className:"stroke-slate-600 rounded-full hover:bg-slate-300 p-1 cursor-pointer"})]})]}),s.jsx(v,{sections:p,rooms:f})]}),s.jsxs("div",{className:"flex-1 flex flex-col",children:[s.jsx("div",{className:"flex-1"}),s.jsx(g,{namespace:"Editor",onChange:()=>{},onError:e=>console.error(e)})]})]})}c.__docgenInfo={description:"",methods:[],displayName:"MainPage"};const L={title:"Pages/MainPage",tags:["autodocs"],component:c},o={};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source}}};const k=["Default"];export{o as Default,k as __namedExportsOrder,L as default};
//# sourceMappingURL=MainPage.stories-7eb441a9.js.map