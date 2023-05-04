import{j as n}from"./jsx-runtime-ccada58e.js";import{r as m}from"./index-f1f749bf.js";import{R as u}from"./roomListItem-38ccdabc.js";import{M as c}from"./client-2b9ca05c.js";import{c as d,C as p}from"./chevron-down-2d8ad7a7.js";import{b as h}from"./index-cf029368.js";const y=d("ChevronRight",[["polyline",{points:"9 18 15 12 9 6",key:"1rtp27"}]]);const v=m.memo(({sectionID:o,rooms:s,onClick:a,activeRoom:r,hidden:i})=>{const t=s.map(e=>n.jsx(u,{roomId:e.roomID,hidden:i,avatarUrl:e.avatarUrl,displayname:e.displayname,dm:e.dm,online:e.online,active:e.roomID===r,onClick:()=>{a(e.roomID)}},`${e.roomID}+${o}`));return n.jsx(n.Fragment,{children:t})}),l=m.memo(({section:o,onRoomClick:s,activeRoom:a})=>{const[r,i]=m.useState(!0),t=m.useContext(c);return r?t.removeSpaceOpen(o.roomID):t.addSpaceOpen(o.roomID),n.jsxs("div",{className:"flex flex-col gap-1 pl-4 select-none",children:[n.jsxs("div",{className:"flex flex-row gap-2 py-1 items-center justify-start cursor-pointer h-8 text-slate-600",onClick:()=>i(e=>!e),children:[r?n.jsx(y,{size:14}):n.jsx(p,{size:14}),n.jsx("span",{className:"font-normal text-base capitalize max-w-[32ch] overflow-hidden text-ellipsis w-full whitespace-nowrap",children:o.sectionName})]}),!r&&n.jsx(v,{hidden:r,sectionID:o.roomID,rooms:o.rooms,onClick:s,activeRoom:a}),!r&&o.subsections.map(e=>n.jsx(l,{section:e,onRoomClick:s,activeRoom:a},e.roomID))]},o.roomID)}),f=m.memo(({sections:o,rooms:s})=>{const[a,r]=m.useState(void 0),i=h();return n.jsxs("div",{className:"flex flex-col gap-1 flex-1 p-2 min-w-[30ch] overflow-y-auto overflow-x-hidden scrollbarSmall max-w-[33ch]",children:[o.map(t=>n.jsx(l,{section:t,onRoomClick:e=>{r(e),i(`/${encodeURIComponent(e)}`)},activeRoom:a},t.roomID)),n.jsx(l,{section:{sectionName:"Others",roomID:"other",subsections:[],rooms:s},onRoomClick:t=>{r(t),i(`/${encodeURIComponent(t)}`)},activeRoom:a})]})});f.__docgenInfo={description:"",methods:[],displayName:"RoomList",props:{sections:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
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
}`,signature:{properties:[{key:"avatarUrl",value:{name:"string",required:!1}},{key:"displayname",value:{name:"string",required:!0}},{key:"dm",value:{name:"boolean",required:!0}},{key:"online",value:{name:"boolean",required:!0}},{key:"roomID",value:{name:"string",required:!0}}]}}],raw:"Room[]"},description:"Rooms outside of any Sections"}}};export{f as R};
//# sourceMappingURL=roomList-e17efe61.js.map
