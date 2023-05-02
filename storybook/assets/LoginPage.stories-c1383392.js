import{j as u}from"./jsx-runtime-ccada58e.js";import{a as y,r as s}from"./index-f1f749bf.js";import{B}from"./button-e6a9a480.js";import{H as W}from"./header-2af99fd6.js";import{I as P}from"./input-a8f3a485.js";import{M as _}from"./client-771c9973.js";import"./_commonjsHelpers-042e6b4d.js";/**
 * @remix-run/router v1.5.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function C(){return C=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e},C.apply(this,arguments)}var E;(function(e){e.Pop="POP",e.Push="PUSH",e.Replace="REPLACE"})(E||(E={}));function h(e,t){if(e===!1||e===null||typeof e>"u")throw new Error(t)}function U(e){let t={};if(e){let a=e.indexOf("#");a>=0&&(t.hash=e.substr(a),e=e.substr(0,a));let r=e.indexOf("?");r>=0&&(t.search=e.substr(r),e=e.substr(0,r)),e&&(t.pathname=e)}return t}var j;(function(e){e.data="data",e.deferred="deferred",e.redirect="redirect",e.error="error"})(j||(j={}));function D(e,t){t===void 0&&(t="/");let{pathname:a,search:r="",hash:n=""}=typeof e=="string"?U(e):e;return{pathname:a?a.startsWith("/")?a:M(a,t):t,search:V(r),hash:z(n)}}function M(e,t){let a=t.replace(/\/+$/,"").split("/");return e.split("/").forEach(n=>{n===".."?a.length>1&&a.pop():n!=="."&&a.push(n)}),a.length>1?a.join("/"):"/"}function v(e,t,a,r){return"Cannot include a '"+e+"' character in a manually specified "+("`to."+t+"` field ["+JSON.stringify(r)+"].  Please separate it out to the ")+("`to."+a+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function J(e){return e.filter((t,a)=>a===0||t.route.path&&t.route.path.length>0)}function R(e,t,a,r){r===void 0&&(r=!1);let n;typeof e=="string"?n=U(e):(n=C({},e),h(!n.pathname||!n.pathname.includes("?"),v("?","pathname","search",n)),h(!n.pathname||!n.pathname.includes("#"),v("#","pathname","hash",n)),h(!n.search||!n.search.includes("#"),v("#","search","hash",n)));let o=e===""||n.pathname==="",i=o?"/":n.pathname,l;if(r||i==null)l=a;else{let p=t.length-1;if(i.startsWith("..")){let g=i.split("/");for(;g[0]==="..";)g.shift(),p-=1;n.pathname=g.join("/")}l=p>=0?t[p]:"/"}let c=D(n,l),d=i&&i!=="/"&&i.endsWith("/"),f=(o||i===".")&&a.endsWith("/");return!c.pathname.endsWith("/")&&(d||f)&&(c.pathname+="/"),c}const $=e=>e.join("/").replace(/\/\/+/g,"/"),V=e=>!e||e==="?"?"":e.startsWith("?")?e:"?"+e,z=e=>!e||e==="#"?"":e.startsWith("#")?e:"#"+e;/**
 * React Router v6.10.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function G(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}const T=typeof Object.is=="function"?Object.is:G,{useState:q,useEffect:F,useLayoutEffect:K,useDebugValue:Q}=y;function X(e,t,a){const r=t(),[{inst:n},o]=q({inst:{value:r,getSnapshot:t}});return K(()=>{n.value=r,n.getSnapshot=t,x(n)&&o({inst:n})},[e,r,t]),F(()=>(x(n)&&o({inst:n}),e(()=>{x(n)&&o({inst:n})})),[e]),Q(r),r}function x(e){const t=e.getSnapshot,a=e.value;try{const r=t();return!T(a,r)}catch{return!0}}function Y(e,t,a){return t()}const Z=typeof window<"u"&&typeof window.document<"u"&&typeof window.document.createElement<"u",k=!Z,H=k?Y:X;"useSyncExternalStore"in y&&(e=>e.useSyncExternalStore)(y);const A=s.createContext(null),ee=s.createContext(null),N=s.createContext(null),te=s.createContext({outlet:null,matches:[]});function S(){return s.useContext(N)!=null}function ne(){return S()||h(!1),s.useContext(N).location}function ae(){S()||h(!1);let{basename:e,navigator:t}=s.useContext(ee),{matches:a}=s.useContext(te),{pathname:r}=ne(),n=JSON.stringify(J(a).map(l=>l.pathnameBase)),o=s.useRef(!1);return s.useEffect(()=>{o.current=!0}),s.useCallback(function(l,c){if(c===void 0&&(c={}),!o.current)return;if(typeof l=="number"){t.go(l);return}let d=R(l,JSON.parse(n),r,c.relative==="path");e!=="/"&&(d.pathname=d.pathname==="/"?e:$([e,d.pathname])),(c.replace?t.replace:t.push)(d,c.state,c)},[e,t,n,r])}var L;(function(e){e.UseBlocker="useBlocker",e.UseRevalidator="useRevalidator"})(L||(L={}));var b;(function(e){e.UseBlocker="useBlocker",e.UseLoaderData="useLoaderData",e.UseActionData="useActionData",e.UseRouteError="useRouteError",e.UseNavigation="useNavigation",e.UseRouteLoaderData="useRouteLoaderData",e.UseMatches="useMatches",e.UseRevalidator="useRevalidator"})(b||(b={}));function re(e){let{to:t,replace:a,state:r,relative:n}=e;S()||h(!1);let o=s.useContext(A),i=ae();return s.useEffect(()=>{o&&o.navigation.state!=="idle"||i(t,{replace:a,state:r,relative:n})}),null}var w;(function(e){e[e.pending=0]="pending",e[e.success=1]="success",e[e.error=2]="error"})(w||(w={}));new Promise(()=>{});function O(){const e=s.useContext(_),[t,a]=s.useState(!1),[r,n]=s.useState(""),[o,i]=s.useState(""),[l,c]=s.useState("");if(e.isLoggedIn)return u.jsx(re,{to:"/"});const d=async()=>{try{a(!0),await e.passwordLogin(o,l)}catch(f){n(f.toString())}a(!1)};return u.jsxs("form",{className:"flex flex-col rounded-md shadow p-4 bg-white gap-2 min-w-[30rem]",onSubmit:f=>{f.preventDefault(),d()},children:[u.jsx(W,{children:"Login"}),r?u.jsx("h2",{className:"text-red-500 font-normal text-sm",children:r}):u.jsx("div",{className:"min-h-[1.25rem]"}),u.jsx(P,{readonly:t,value:o,placeholder:"Username",onChange:f=>i(f.target.value)}),u.jsx(P,{readonly:t,value:l,password:!0,placeholder:"Password",onChange:f=>c(f.target.value)}),u.jsx(B,{readonly:t,style:"primary",type:"submit",children:"Login"})]})}O.__docgenInfo={description:"",methods:[],displayName:"Login"};function I(){return u.jsx("div",{className:"flex flex-col items-center justify-center min-h-screen bg-img",children:u.jsx(O,{})})}I.__docgenInfo={description:"",methods:[],displayName:"LoginPage"};const de={title:"Pages/LoginPage",tags:["autodocs"],component:I},m={};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:"{}",...m.parameters?.docs?.source}}};const he=["Default"];export{m as Default,he as __namedExportsOrder,de as default};
//# sourceMappingURL=LoginPage.stories-c1383392.js.map
