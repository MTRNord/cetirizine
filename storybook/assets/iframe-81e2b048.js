import"../sb-preview/runtime.mjs";(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))m(r);new MutationObserver(r=>{for(const e of r)if(e.type==="childList")for(const _ of e.addedNodes)_.tagName==="LINK"&&_.rel==="modulepreload"&&m(_)}).observe(document,{childList:!0,subtree:!0});function s(r){const e={};return r.integrity&&(e.integrity=r.integrity),r.referrerPolicy&&(e.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?e.credentials="include":r.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function m(r){if(r.ep)return;r.ep=!0;const e=s(r);fetch(r.href,e)}})();const R="modulepreload",L=function(o,i){return new URL(o,i).href},u={},t=function(i,s,m){if(!s||s.length===0)return i();const r=document.getElementsByTagName("link");return Promise.all(s.map(e=>{if(e=L(e,m),e in u)return;u[e]=!0;const _=e.endsWith(".css"),d=_?'[rel="stylesheet"]':"";if(!!m)for(let c=r.length-1;c>=0;c--){const a=r[c];if(a.href===e&&(!_||a.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${e}"]${d}`))return;const n=document.createElement("link");if(n.rel=_?"stylesheet":R,_||(n.as="script",n.crossOrigin=""),n.href=e,document.head.appendChild(n),_)return new Promise((c,a)=>{n.addEventListener("load",c),n.addEventListener("error",()=>a(new Error(`Unable to preload CSS for ${e}`)))})})).then(()=>i())},{createChannel:P}=__STORYBOOK_MODULE_CHANNEL_POSTMESSAGE__,{createChannel:T}=__STORYBOOK_MODULE_CHANNEL_WEBSOCKET__,{addons:E}=__STORYBOOK_MODULE_PREVIEW_API__,O=P({page:"preview"});E.setChannel(O);window.__STORYBOOK_ADDONS_CHANNEL__=O;const{SERVER_CHANNEL_URL:l}=globalThis;if(l){const o=T({url:l});E.setServerChannel(o),window.__STORYBOOK_SERVER_CHANNEL__=o}const f={"./src/components/avatar/avatar.stories.tsx":async()=>t(()=>import("./avatar.stories-0de4a5b6.js"),["./avatar.stories-0de4a5b6.js","./avatar-89f1ae75.js","./jsx-runtime-ccada58e.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./index-9ff52a90.js"],import.meta.url),"./src/components/button/button.stories.tsx":async()=>t(()=>import("./button.stories-dc220268.js"),["./button.stories-dc220268.js","./button-e6a9a480.js","./jsx-runtime-ccada58e.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./button-0e119758.css","./index-9ff52a90.js"],import.meta.url),"./src/components/header/header.stories.tsx":async()=>t(()=>import("./header.stories-4edc83b4.js"),["./header.stories-4edc83b4.js","./header-2af99fd6.js","./jsx-runtime-ccada58e.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./index-9ff52a90.js"],import.meta.url),"./src/components/input/basic/input.stories.tsx":async()=>t(()=>import("./input.stories-3b1a2d5f.js"),["./input.stories-3b1a2d5f.js","./input-a8f3a485.js","./jsx-runtime-ccada58e.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./index-9ff52a90.js"],import.meta.url),"./src/components/input/chat/input.stories.tsx":async()=>t(()=>import("./input.stories-62e337bc.js"),["./input.stories-62e337bc.js","./input-4293af36.js","./jsx-runtime-ccada58e.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./index-67faaf7e.js","./chevron-down-2d8ad7a7.js","./input-c8346e4c.css","./index-9ff52a90.js"],import.meta.url),"./src/components/roomList/roomList.stories.tsx":async()=>t(()=>import("./roomList.stories-1e586d53.js"),["./roomList.stories-1e586d53.js","./roomList-8cec0948.js","./jsx-runtime-ccada58e.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./roomListItem-b63ca857.js","./avatar-89f1ae75.js","./client-811bdff8.js","./chevron-down-2d8ad7a7.js","./roomList-a94fc8cb.css","./index-9ff52a90.js"],import.meta.url),"./src/components/roomList/roomListItem/roomListItem.stories.tsx":async()=>t(()=>import("./roomListItem.stories-8a083dc1.js"),["./roomListItem.stories-8a083dc1.js","./roomListItem-b63ca857.js","./jsx-runtime-ccada58e.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./avatar-89f1ae75.js","./client-811bdff8.js","./index-9ff52a90.js"],import.meta.url),"./src/documentation/Welcome.stories.mdx":async()=>t(()=>import("./Welcome.stories-f14a2138.js"),["./Welcome.stories-f14a2138.js","./chunk-PCJTTTQV-6802e718.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./index-37b5899d.js","./index-67faaf7e.js","./index-d475d2ea.js","./index-d37d4223.js","./index-356e4a49.js","./chunk-R4NKYYJA-96bb58e6.js","./jsx-runtime-ccada58e.js","./index-4fb8b842.js"],import.meta.url),"./src/pages/LoginPage.stories.tsx":async()=>t(()=>import("./LoginPage.stories-b4503e5a.js"),["./LoginPage.stories-b4503e5a.js","./jsx-runtime-ccada58e.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./button-e6a9a480.js","./button-0e119758.css","./header-2af99fd6.js","./input-a8f3a485.js","./client-811bdff8.js","./LoginPage.stories-f6866dbf.css"],import.meta.url),"./src/pages/MainPage.stories.tsx":async()=>t(()=>import("./MainPage.stories-7eb441a9.js"),["./MainPage.stories-7eb441a9.js","./jsx-runtime-ccada58e.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./avatar-89f1ae75.js","./input-4293af36.js","./index-67faaf7e.js","./chevron-down-2d8ad7a7.js","./input-c8346e4c.css","./roomList-8cec0948.js","./roomListItem-b63ca857.js","./client-811bdff8.js","./roomList-a94fc8cb.css","./MainPage.stories-0ba2f1ae.css"],import.meta.url)};async function p(o){return f[o]()}p.__docgenInfo={description:"",methods:[],displayName:"importFn"};const{composeConfigs:I,PreviewWeb:A,ClientApi:S}=__STORYBOOK_MODULE_PREVIEW_API__,v=async()=>{const o=await Promise.all([t(()=>import("./config-653b11c8.js"),["./config-653b11c8.js","./index-d475d2ea.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./index-37b5899d.js","./index-67faaf7e.js","./index-356e4a49.js"],import.meta.url),t(()=>import("./preview-0435c720.js"),["./preview-0435c720.js","./index-d475d2ea.js","./index-d37d4223.js"],import.meta.url),t(()=>import("./preview-8c3f26dc.js"),["./preview-8c3f26dc.js","./chunk-R4NKYYJA-96bb58e6.js"],import.meta.url),t(()=>import("./preview-fe03557e.js"),[],import.meta.url),t(()=>import("./preview-08a12153.js"),["./preview-08a12153.js","./index-d475d2ea.js","./index-356e4a49.js"],import.meta.url),t(()=>import("./preview-e6f1f377.js"),["./preview-e6f1f377.js","./index-d475d2ea.js"],import.meta.url),t(()=>import("./preview-62235626.js"),["./preview-62235626.js","./index-d475d2ea.js","./index-356e4a49.js"],import.meta.url),t(()=>import("./preview-b1164a2e.js"),["./preview-b1164a2e.js","./index-d475d2ea.js"],import.meta.url),t(()=>import("./preview-b724d14d.js"),["./preview-b724d14d.js","./index-d475d2ea.js","./_commonjsHelpers-042e6b4d.js"],import.meta.url),t(()=>import("./preview-b1010c1d.js"),["./preview-b1010c1d.js","./index-d475d2ea.js"],import.meta.url),t(()=>import("./preview-0b293f2a.js"),[],import.meta.url),t(()=>import("./preview-56a78dd0.js"),["./preview-56a78dd0.js","./jsx-runtime-ccada58e.js","./index-f1f749bf.js","./_commonjsHelpers-042e6b4d.js","./preview-a812bfd3.css"],import.meta.url)]);return I(o)};window.__STORYBOOK_PREVIEW__=window.__STORYBOOK_PREVIEW__||new A;window.__STORYBOOK_STORY_STORE__=window.__STORYBOOK_STORY_STORE__||window.__STORYBOOK_PREVIEW__.storyStore;window.__STORYBOOK_CLIENT_API__=window.__STORYBOOK_CLIENT_API__||new S({storyStore:window.__STORYBOOK_PREVIEW__.storyStore});window.__STORYBOOK_PREVIEW__.initialize({importFn:p,getProjectAnnotations:v});export{t as _};
//# sourceMappingURL=iframe-81e2b048.js.map