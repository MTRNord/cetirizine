import{s as E}from"./index-d475d2ea.js";import{d as _}from"./index-356e4a49.js";var p="backgrounds";const{logger:k}=__STORYBOOK_MODULE_CLIENT_LOGGER__;var{document:l,window:M}=E,h=()=>M.matchMedia("(prefers-reduced-motion: reduce)").matches,B=(r,e=[],n)=>{if(r==="transparent")return"transparent";if(e.find(a=>a.value===r))return r;let t=e.find(a=>a.name===n);if(t)return t.value;if(n){let a=e.map(i=>i.name).join(", ");k.warn(_`
        Backgrounds Addon: could not find the default color "${n}".
        These are the available colors for your story based on your configuration:
        ${a}.
      `)}return"transparent"},y=r=>{(Array.isArray(r)?r:[r]).forEach(S)},S=r=>{let e=l.getElementById(r);e&&e.parentElement.removeChild(e)},x=(r,e)=>{let n=l.getElementById(r);if(n)n.innerHTML!==e&&(n.innerHTML=e);else{let t=l.createElement("style");t.setAttribute("id",r),t.innerHTML=e,l.head.appendChild(t)}},O=(r,e,n)=>{let t=l.getElementById(r);if(t)t.innerHTML!==e&&(t.innerHTML=e);else{let a=l.createElement("style");a.setAttribute("id",r),a.innerHTML=e;let i=`addon-backgrounds-grid${n?`-docs-${n}`:""}`,d=l.getElementById(i);d?d.parentElement.insertBefore(a,d):l.head.appendChild(a)}};const{useMemo:b,useEffect:w}=__STORYBOOK_MODULE_PREVIEW_API__;var A=(r,e)=>{let{globals:n,parameters:t}=e,a=n[p]?.value,i=t[p],d=b(()=>i.disable?"transparent":B(a,i.values,i.default),[i,a]),o=b(()=>d&&d!=="transparent",[d]),s=e.viewMode==="docs"?`#anchor--${e.id} .docs-story`:".sb-show-main",u=b(()=>{let g="transition: background-color 0.3s;";return`
      ${s} {
        background: ${d} !important;
        ${h()?"":g}
      }
    `},[d,s]);return w(()=>{let g=e.viewMode==="docs"?`addon-backgrounds-docs-${e.id}`:"addon-backgrounds-color";if(!o){y(g);return}O(g,u,e.viewMode==="docs"?e.id:null)},[o,u,e]),r()};const{useMemo:I,useEffect:L}=__STORYBOOK_MODULE_PREVIEW_API__;var T=(r,e)=>{let{globals:n,parameters:t}=e,a=t[p].grid,i=n[p]?.grid===!0&&a.disable!==!0,{cellAmount:d,cellSize:o,opacity:s}=a,u=e.viewMode==="docs",g=t.layout===void 0||t.layout==="padded"?16:0,c=a.offsetX??(u?20:g),m=a.offsetY??(u?20:g),$=I(()=>{let f=e.viewMode==="docs"?`#anchor--${e.id} .docs-story`:".sb-show-main",v=[`${o*d}px ${o*d}px`,`${o*d}px ${o*d}px`,`${o}px ${o}px`,`${o}px ${o}px`].join(", ");return`
      ${f} {
        background-size: ${v} !important;
        background-position: ${c}px ${m}px, ${c}px ${m}px, ${c}px ${m}px, ${c}px ${m}px !important;
        background-blend-mode: difference !important;
        background-image: linear-gradient(rgba(130, 130, 130, ${s}) 1px, transparent 1px),
         linear-gradient(90deg, rgba(130, 130, 130, ${s}) 1px, transparent 1px),
         linear-gradient(rgba(130, 130, 130, ${s/2}) 1px, transparent 1px),
         linear-gradient(90deg, rgba(130, 130, 130, ${s/2}) 1px, transparent 1px) !important;
      }
    `},[o]);return L(()=>{let f=e.viewMode==="docs"?`addon-backgrounds-grid-docs-${e.id}`:"addon-backgrounds-grid";if(!i){y(f);return}x(f,$)},[i,$,e]),r()},H=[T,A],P={[p]:{grid:{cellSize:20,opacity:.5,cellAmount:5},values:[{name:"light",value:"#F8F8F8"},{name:"dark",value:"#333333"}]}},Y={[p]:null};export{H as decorators,Y as globals,P as parameters};
//# sourceMappingURL=preview-08a12153.js.map
