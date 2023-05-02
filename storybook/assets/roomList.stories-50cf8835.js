import{R as o}from"./roomList-5f8ba7bc.js";import{e as n}from"./index-9ff52a90.js";import"./jsx-runtime-ccada58e.js";import"./index-f1f749bf.js";import"./_commonjsHelpers-042e6b4d.js";import"./roomListItem-717a12c8.js";import"./avatar-89f1ae75.js";import"./client-771c9973.js";import"./chevron-down-2d8ad7a7.js";const u={title:"Chat/RoomList",tags:["autodocs"],component:o,parameters:{badges:[n.EXPERIMENTAL]},argTypes:{sections:{required:!0,defaultValue:[],name:"Sections",description:"The Sections available"},rooms:{required:!0,defaultValue:[],name:"Rooms",description:"Rooms outside of any Sections"}}},e={args:{rooms:[{roomID:"1",displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!0},{roomID:"2",displayname:"test1",dm:!1,online:!1},{roomID:"3",displayname:"test2",dm:!1,online:!1}],sections:[{sectionName:"Test Section",rooms:[{roomID:"2",displayname:"test1",dm:!1,online:!1},{roomID:"3",displayname:"test2",dm:!1,online:!1}],roomID:"12",subsections:[{sectionName:"Test Subsection",rooms:[{roomID:"1",displayname:"test",avatarUrl:"https://randomuser.me/api/portraits/men/62.jpg",dm:!0,online:!0}],roomID:"14",subsections:[]}]}]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
}`,...e.parameters?.docs?.source}}};const c=["RootList"];export{e as RootList,c as __namedExportsOrder,u as default};
//# sourceMappingURL=roomList.stories-50cf8835.js.map
