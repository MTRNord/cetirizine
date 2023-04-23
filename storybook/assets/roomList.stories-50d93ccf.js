import{j as e}from"./jsx-runtime-ccada58e.js";import{r as c}from"./index-f1f749bf.js";import{R as d}from"./roomListItem-624401a0.js";import{c as p,C as u}from"./chevron-down-2d8ad7a7.js";import{e as f}from"./index-9ff52a90.js";import"./_commonjsHelpers-042e6b4d.js";import"./avatar-f29554f6.js";const I=p("ChevronRight",[["polyline",{points:"9 18 15 12 9 6",key:"1rtp27"}]]),x=({sectionID:o,rooms:i,onClick:r,activeRoom:s,hidden:n})=>{const t=i.map(a=>e.jsx(d,{hidden:n,avatarUrl:a.avatarUrl,displayname:a.displayname,dm:a.dm,online:a.online,active:a.roomID===s,onClick:()=>{r(a.roomID)}},a.roomID+o));return e.jsx(e.Fragment,{children:t})},l=({section:o,onRoomClick:i,activeRoom:r})=>{const[s,n]=c.useState(!1);return e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsxs("div",{className:"flex flex-row gap-2 p-1 px-2 bg-gray-300 items-center justify-between cursor-pointer",onClick:()=>n(t=>!t),children:[e.jsx("span",{className:"text-black font-normal text-xl capitalize",children:o.sectionName}),s?e.jsx(I,{size:20}):e.jsx(u,{size:20})]}),!s&&e.jsx(x,{hidden:s,sectionID:o.roomID,rooms:o.rooms,onClick:i,activeRoom:r}),!s&&o.subsections.map(t=>e.jsx(l,{section:t,onRoomClick:i,activeRoom:r},t.roomID))]},o.roomID)},y=({sections:o,rooms:i})=>{const[r,s]=c.useState(void 0);return e.jsxs("div",{className:"flex flex-col gap-1",children:[o.map(n=>e.jsx(l,{section:n,onRoomClick:t=>{s(t)},activeRoom:r},n.roomID)),e.jsx(l,{section:{sectionName:"Others",roomID:"other",subsections:[],rooms:i},onRoomClick:n=>{s(n)},activeRoom:r})]})};try{roomList.displayName="roomList",roomList.__docgenInfo={description:"",displayName:"roomList",props:{sections:{defaultValue:null,description:"The Sections available",name:"sections",required:!0,type:{name:"Section[]"}},rooms:{defaultValue:null,description:"Rooms outside of any Sections",name:"rooms",required:!0,type:{name:"Room[]"}}}}}catch{}const S={title:"Chat/RoomList",tags:["autodocs"],component:y,parameters:{badges:[f.EXPERIMENTAL]},argTypes:{sections:{required:!0,defaultValue:[],name:"Sections",description:"The Sections available"},rooms:{required:!0,defaultValue:[],name:"Rooms",description:"Rooms outside of any Sections"}}},m={args:{rooms:[{roomID:"1",displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!0},{roomID:"2",displayname:"test1",dm:!1,online:!1},{roomID:"3",displayname:"test2",dm:!1,online:!1}],sections:[{sectionName:"Test Section",rooms:[{roomID:"2",displayname:"test1",dm:!1,online:!1},{roomID:"3",displayname:"test2",dm:!1,online:!1}],roomID:"12",subsections:[{sectionName:"Test Subsection",rooms:[{roomID:"1",displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!0}],roomID:"14",subsections:[]}]}]}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    rooms: [{
      roomID: "1",
      displayname: "test",
      avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
      dm: true,
      online: true
    }, {
      roomID: "2",
      displayname: "test1",
      dm: false,
      online: false
    }, {
      roomID: "3",
      displayname: "test2",
      dm: false,
      online: false
    }],
    sections: [{
      sectionName: "Test Section",
      rooms: [{
        roomID: "2",
        displayname: "test1",
        dm: false,
        online: false
      }, {
        roomID: "3",
        displayname: "test2",
        dm: false,
        online: false
      }],
      roomID: "12",
      subsections: [{
        sectionName: "Test Subsection",
        rooms: [{
          roomID: "1",
          displayname: "test",
          avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
          dm: true,
          online: true
        }],
        roomID: "14",
        subsections: []
      }]
    }]
  }
}`,...m.parameters?.docs?.source}}};const N=["RootList"];export{m as RootList,N as __namedExportsOrder,S as default};
//# sourceMappingURL=roomList.stories-50d93ccf.js.map
