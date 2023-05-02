import{j as e}from"./jsx-runtime-ccada58e.js";import{r as m}from"./index-f1f749bf.js";import{R as u}from"./roomListItem-46b5491b.js";import{c as d,C as c}from"./chevron-down-2d8ad7a7.js";import{u as p}from"./index-9a70ebd0.js";const h=d("ChevronRight",[["polyline",{points:"9 18 15 12 9 6",key:"1rtp27"}]]);const y=m.memo(({sectionID:r,rooms:s,onClick:a,activeRoom:t,hidden:i})=>{const n=s.map(o=>e.jsx(u,{roomId:o.roomID,hidden:i,avatarUrl:o.avatarUrl,displayname:o.displayname,dm:o.dm,online:o.online,active:o.roomID===t,onClick:()=>{a(o.roomID)}},`${o.roomID}+${r}`));return e.jsx(e.Fragment,{children:n})}),l=m.memo(({section:r,onRoomClick:s,activeRoom:a})=>{const[t,i]=m.useState(!0);return e.jsxs("div",{className:"flex flex-col gap-1 pl-4",children:[e.jsxs("div",{className:"flex flex-row gap-2 py-1  items-center justify-start cursor-pointer h-8 text-slate-600",onClick:()=>i(n=>!n),children:[t?e.jsx(h,{size:14}):e.jsx(c,{size:14}),e.jsx("span",{className:"font-normal text-sm capitalize max-w-[32ch] overflow-hidden text-ellipsis w-full whitespace-nowrap",children:r.sectionName})]}),!t&&e.jsx(y,{hidden:t,sectionID:r.roomID,rooms:r.rooms,onClick:s,activeRoom:a}),!t&&r.subsections.map(n=>e.jsx(l,{section:n,onRoomClick:s,activeRoom:a},n.roomID))]},r.roomID)}),v=m.memo(({sections:r,rooms:s})=>{const[a,t]=m.useState(void 0),i=p();return e.jsxs("div",{className:"flex flex-col gap-1 flex-1 p-2 min-w-[33ch] h-full overflow-y-auto overflow-x-hidden scrollbarSmall",children:[r.map(n=>e.jsx(l,{section:n,onRoomClick:o=>{t(o),i(`/${encodeURI(o)}`)},activeRoom:a},n.roomID)),e.jsx(l,{section:{sectionName:"Others",roomID:"other",subsections:[],rooms:s},onRoomClick:n=>{t(n),i(`/${encodeURI(n)}`)},activeRoom:a})]})});v.__docgenInfo={description:"",methods:[],displayName:"RoomList",props:{sections:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
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
}`,signature:{properties:[{key:"avatarUrl",value:{name:"string",required:!1}},{key:"displayname",value:{name:"string",required:!0}},{key:"dm",value:{name:"boolean",required:!0}},{key:"online",value:{name:"boolean",required:!0}},{key:"roomID",value:{name:"string",required:!0}}]}}],raw:"Room[]"},description:"Rooms outside of any Sections"}}};export{v as R};
//# sourceMappingURL=roomList-657c190b.js.map
