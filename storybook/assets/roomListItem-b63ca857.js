import{j as f}from"./jsx-runtime-ccada58e.js";import{r as p}from"./index-f1f749bf.js";import{A as j}from"./avatar-89f1ae75.js";import{M as A}from"./client-811bdff8.js";const R=new Map,g=new WeakMap;let V=0,C;function E(e){return e?(g.has(e)||(V+=1,g.set(e,V.toString())),g.get(e)):"0"}function M(e){return Object.keys(e).sort().filter(t=>e[t]!==void 0).map(t=>`${t}_${t==="root"?E(e.root):e[t]}`).toString()}function N(e){let t=M(e),r=R.get(t);if(!r){const i=new Map;let u;const o=new IntersectionObserver(n=>{n.forEach(s=>{var a;const l=s.isIntersecting&&u.some(d=>s.intersectionRatio>=d);e.trackVisibility&&typeof s.isVisible>"u"&&(s.isVisible=l),(a=i.get(s.target))==null||a.forEach(d=>{d(l,s)})})},e);u=o.thresholds||(Array.isArray(e.threshold)?e.threshold:[e.threshold||0]),r={id:t,observer:o,elements:i},R.set(t,r)}return r}function S(e,t,r={},i=C){if(typeof window.IntersectionObserver>"u"&&i!==void 0){const a=e.getBoundingClientRect();return t(i,{isIntersecting:i,target:e,intersectionRatio:typeof r.threshold=="number"?r.threshold:0,time:0,boundingClientRect:a,intersectionRect:a,rootBounds:a}),()=>{}}const{id:u,observer:o,elements:n}=N(r);let s=n.get(e)||[];return n.has(e)||n.set(e,s),s.push(t),o.observe(e),function(){s.splice(s.indexOf(t),1),s.length===0&&(n.delete(e),o.unobserve(e)),n.size===0&&(o.disconnect(),R.delete(u))}}function O({threshold:e,delay:t,trackVisibility:r,rootMargin:i,root:u,triggerOnce:o,skip:n,initialInView:s,fallbackInView:a,onChange:l}={}){var d;const[h,q]=p.useState(null),v=p.useRef(),[x,y]=p.useState({inView:!!s,entry:void 0});v.current=l,p.useEffect(()=>{if(n||!h)return;let m;return m=S(h,(I,b)=>{y({inView:I,entry:b}),v.current&&v.current(I,b),b.isIntersecting&&o&&m&&(m(),m=void 0)},{root:u,rootMargin:i,threshold:e,trackVisibility:r,delay:t},a),()=>{m&&m()}},[Array.isArray(e)?e.toString():e,h,u,i,o,n,r,a,t]);const w=(d=x.entry)==null?void 0:d.target,T=p.useRef();!h&&w&&!o&&!n&&T.current!==w&&(T.current=w,y({inView:!!s,entry:void 0}));const c=[q,x.inView,x.entry];return c.ref=c[0],c.inView=c[1],c.entry=c[2],c}const _=({roomId:e,avatarUrl:t,displayname:r,dm:i=!1,online:u=!1,active:o=!1,onClick:n,hidden:s})=>{const{ref:a,inView:l}=O({triggerOnce:!0,rootMargin:"200px 0px",skip:s}),d=p.useContext(A);return p.useEffect(()=>{l?d.addInViewRoom(e):d.removeInViewRoom(e)},[l]),f.jsx("div",{ref:a,onClick:n,className:"w-full cursor-pointer",children:l&&(o?f.jsxs("div",{className:"flex flex-row gap-2 p-1 bg-gray-300 hover:bg-gray-400 rounded-lg duration-200 ease-in-out items-center",children:[f.jsx(j,{avatarUrl:t,displayname:r,dm:i,online:u}),f.jsx("span",{title:r,className:"text-slate-900 font-normal text-base capitalize max-w-[32ch] overflow-hidden text-ellipsis w-full whitespace-nowrap",children:r})]}):f.jsxs("div",{className:"flex flex-row gap-2 p-1 hover:bg-gray-300 rounded-lg duration-200 ease-in-out items-center",children:[f.jsx(j,{avatarUrl:t,displayname:r,dm:i,online:u}),f.jsx("span",{title:r,className:"text-slate-900 font-normal text-base capitalize max-w-[32ch] overflow-hidden text-ellipsis w-full whitespace-nowrap",children:r})]}))})};_.__docgenInfo={description:"",methods:[],displayName:"RoomListItem",props:{dm:{defaultValue:{value:"false",computed:!1},required:!1,tsType:{name:"boolean"},description:"Wether it is a DM or not"},online:{defaultValue:{value:"false",computed:!1},required:!1,tsType:{name:"boolean"},description:"Wether the user is online. Only used if dm is true."},active:{defaultValue:{value:"false",computed:!1},required:!1,tsType:{name:"boolean"},description:"Wether the current room is selected"},roomId:{required:!0,tsType:{name:"string"},description:"Room id"},avatarUrl:{required:!1,tsType:{name:"string"},description:"The URL of the Avatar image"},displayname:{required:!0,tsType:{name:"string"},description:"The displayname of the room list item"},onClick:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"The onClick handler"},hidden:{required:!0,tsType:{name:"boolean"},description:"If room is hidden"}}};export{_ as R};
//# sourceMappingURL=roomListItem-b63ca857.js.map