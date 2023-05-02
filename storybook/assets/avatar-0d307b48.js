import{j as e}from"./jsx-runtime-ccada58e.js";import{r as l}from"./index-f1f749bf.js";const i=l.memo(({avatarUrl:t,displayname:r,dm:s=!1,online:a=!1})=>t?e.jsxs("div",{className:"flex relative min-w-[2rem] min-h-[2rem] justify-center items-center m-0 mr-3 text-xl rounded-full text-white",children:[e.jsx("img",{className:"rounded-full w-8 h-8",alt:r,src:t}),s?a?e.jsx("div",{className:"bg-green-500 rounded-full w-3 h-3 absolute bottom-0 right-0"}):e.jsx("div",{className:"bg-red-500 rounded-full w-3 h-3 absolute bottom-0 right-0"}):e.jsx(e.Fragment,{})]}):e.jsxs("div",{className:"flex relative min-w-[2rem] min-h-[2rem] bg-orange-500 justify-center items-center m-0 mr-3 text-xl rounded-full text-white",children:[r[0].toUpperCase(),s?a?e.jsx("div",{className:"bg-green-500 rounded-full w-3 h-3 absolute bottom-0 right-0"}):e.jsx("div",{className:"bg-red-500 rounded-full w-3 h-3 absolute bottom-0 right-0"}):e.jsx(e.Fragment,{})]}));i.__docgenInfo={description:"",methods:[],displayName:"Avatar",props:{dm:{defaultValue:{value:"false",computed:!1},required:!1,tsType:{name:"boolean"},description:"Wether it is a DM or not"},online:{defaultValue:{value:"false",computed:!1},required:!1,tsType:{name:"boolean"},description:"Wether the user is online. Only used if dm is true."},avatarUrl:{required:!1,tsType:{name:"string"},description:"The URL of the Avatar image"},displayname:{required:!0,tsType:{name:"string"},description:"The displayname of the avatar user"}}};export{i as A};
//# sourceMappingURL=avatar-0d307b48.js.map
