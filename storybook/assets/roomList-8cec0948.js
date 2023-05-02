import{j as e}from"./jsx-runtime-ccada58e.js";import{r as l}from"./index-f1f749bf.js";import{R as u}from"./roomListItem-b63ca857.js";import{c as d,C as c}from"./chevron-down-2d8ad7a7.js";const p=d("ChevronRight",[["polyline",{points:"9 18 15 12 9 6",key:"1rtp27"}]]);const h=({sectionID:n,rooms:i,onClick:s,activeRoom:r,hidden:o})=>{const t=i.map(a=>e.jsx(u,{roomId:a.roomID,hidden:o,avatarUrl:a.avatarUrl,displayname:a.displayname,dm:a.dm,online:a.online,active:a.roomID===r,onClick:()=>{s(a.roomID)}},a.roomID+n));return e.jsx(e.Fragment,{children:t})},m=({section:n,onRoomClick:i,activeRoom:s})=>{const[r,o]=l.useState(!1);return e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsxs("div",{className:"flex flex-row gap-2 py-1  items-center justify-start cursor-pointer h-8 text-slate-600",onClick:()=>o(t=>!t),children:[r?e.jsx(p,{size:14}):e.jsx(c,{size:14}),e.jsx("span",{className:"font-normal text-sm capitalize max-w-[32ch] overflow-hidden text-ellipsis w-full whitespace-nowrap",children:n.sectionName})]}),!r&&e.jsx(h,{hidden:r,sectionID:n.roomID,rooms:n.rooms,onClick:i,activeRoom:s}),!r&&n.subsections.map(t=>e.jsx(m,{section:t,onRoomClick:i,activeRoom:s},t.roomID))]},n.roomID)},y=({sections:n,rooms:i})=>{const[s,r]=l.useState(void 0);return e.jsxs("div",{className:"flex flex-col gap-1 flex-1 p-2 min-w-[33ch] h-full overflow-y-auto overflow-x-hidden scrollbarSmall",children:[n.map(o=>e.jsx(m,{section:o,onRoomClick:t=>{r(t)},activeRoom:s},o.roomID)),e.jsx(m,{section:{sectionName:"Others",roomID:"other",subsections:[],rooms:i},onRoomClick:o=>{r(o)},activeRoom:s})]})};y.__docgenInfo={description:"",methods:[],displayName:"RoomList",props:{sections:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
    /**
     * Section Name. Can be a Space or a Tag
     */
    sectionName: string
    /**
     * The Rooms within the Section
     */
    rooms: Room[]
    /**
     * The Subsections of the Section
     */
    subsections: Section[]
    /**
     * The roomid of the Space
     */
    roomID: string
}`,signature:{properties:[{key:"sectionName",value:{name:"string",required:!0}},{key:"rooms",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
    /**
     * The URL of the Avatar image
     */
    avatarUrl?: string
    /**
     * The displayname of the room list item
     */
    displayname: string
    /**
     * Wether it is a DM or not
     */
    dm: boolean
    /**
     * Wether the user is online. Only used if dm is true.
     */
    online: boolean
    /**
     * The roomid of the Room
     */
    roomID: string
}`,signature:{properties:[{key:"avatarUrl",value:{name:"string",required:!1}},{key:"displayname",value:{name:"string",required:!0}},{key:"dm",value:{name:"boolean",required:!0}},{key:"online",value:{name:"boolean",required:!0}},{key:"roomID",value:{name:"string",required:!0}}]}}],raw:"Room[]",required:!0}},{key:"subsections",value:{name:"Array",elements:[{name:"Section"}],raw:"Section[]",required:!0}},{key:"roomID",value:{name:"string",required:!0}}]}}],raw:"Section[]"},description:"The Sections available"},rooms:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
    /**
     * The URL of the Avatar image
     */
    avatarUrl?: string
    /**
     * The displayname of the room list item
     */
    displayname: string
    /**
     * Wether it is a DM or not
     */
    dm: boolean
    /**
     * Wether the user is online. Only used if dm is true.
     */
    online: boolean
    /**
     * The roomid of the Room
     */
    roomID: string
}`,signature:{properties:[{key:"avatarUrl",value:{name:"string",required:!1}},{key:"displayname",value:{name:"string",required:!0}},{key:"dm",value:{name:"boolean",required:!0}},{key:"online",value:{name:"boolean",required:!0}},{key:"roomID",value:{name:"string",required:!0}}]}}],raw:"Room[]"},description:"Rooms outside of any Sections"}}};export{y as R};
//# sourceMappingURL=roomList-8cec0948.js.map