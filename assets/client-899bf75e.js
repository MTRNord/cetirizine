import{g as ct,m as p,r as I}from"./vendor-9ff4cf4d.js";function mt(n){return n.op==="SYNC"}function ht(n){return n.op==="INSERT"}function dt(n){return n.op==="INVALIDATE"}function ft(n){return n.op==="DELETE"}function Wt(n){return n.type==="m.room.message"&&n.content.msgtype==="m.text"}function zt(n){return n.type==="m.room.message"&&n.content.msgtype==="m.image"}function Jt(n){return n.type==="m.room.message"&&n.content.msgtype==="m.audio"}function F(n){return n.state_key!==void 0}function ut(n){return n.type==="m.room.create"}function lt(n){return n.type==="m.room.avatar"}function pt(n){return n.type==="m.space.child"}function gt(n){return n.type==="m.space.parent"}function yt(n){return n.type==="m.room.topic"}var B={exports:{}},C=typeof Reflect=="object"?Reflect:null,V=C&&typeof C.apply=="function"?C.apply:function(t,e,s){return Function.prototype.apply.call(t,e,s)},k;C&&typeof C.ownKeys=="function"?k=C.ownKeys:Object.getOwnPropertySymbols?k=function(t){return Object.getOwnPropertyNames(t).concat(Object.getOwnPropertySymbols(t))}:k=function(t){return Object.getOwnPropertyNames(t)};function wt(n){console&&console.warn&&console.warn(n)}var X=Number.isNaN||function(t){return t!==t};function u(){u.init.call(this)}B.exports=u;B.exports.once=It;u.EventEmitter=u;u.prototype._events=void 0;u.prototype._eventsCount=0;u.prototype._maxListeners=void 0;var W=10;function M(n){if(typeof n!="function")throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof n)}Object.defineProperty(u,"defaultMaxListeners",{enumerable:!0,get:function(){return W},set:function(n){if(typeof n!="number"||n<0||X(n))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+n+".");W=n}});u.init=function(){(this._events===void 0||this._events===Object.getPrototypeOf(this)._events)&&(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0};u.prototype.setMaxListeners=function(t){if(typeof t!="number"||t<0||X(t))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+t+".");return this._maxListeners=t,this};function Y(n){return n._maxListeners===void 0?u.defaultMaxListeners:n._maxListeners}u.prototype.getMaxListeners=function(){return Y(this)};u.prototype.emit=function(t){for(var e=[],s=1;s<arguments.length;s++)e.push(arguments[s]);var o=t==="error",r=this._events;if(r!==void 0)o=o&&r.error===void 0;else if(!o)return!1;if(o){var i;if(e.length>0&&(i=e[0]),i instanceof Error)throw i;var a=new Error("Unhandled error."+(i?" ("+i.message+")":""));throw a.context=i,a}var h=r[t];if(h===void 0)return!1;if(typeof h=="function")V(h,this,e);else for(var f=h.length,c=et(h,f),s=0;s<f;++s)V(c[s],this,e);return!0};function Z(n,t,e,s){var o,r,i;if(M(e),r=n._events,r===void 0?(r=n._events=Object.create(null),n._eventsCount=0):(r.newListener!==void 0&&(n.emit("newListener",t,e.listener?e.listener:e),r=n._events),i=r[t]),i===void 0)i=r[t]=e,++n._eventsCount;else if(typeof i=="function"?i=r[t]=s?[e,i]:[i,e]:s?i.unshift(e):i.push(e),o=Y(n),o>0&&i.length>o&&!i.warned){i.warned=!0;var a=new Error("Possible EventEmitter memory leak detected. "+i.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");a.name="MaxListenersExceededWarning",a.emitter=n,a.type=t,a.count=i.length,wt(a)}return n}u.prototype.addListener=function(t,e){return Z(this,t,e,!1)};u.prototype.on=u.prototype.addListener;u.prototype.prependListener=function(t,e){return Z(this,t,e,!0)};function vt(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,arguments.length===0?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function G(n,t,e){var s={fired:!1,wrapFn:void 0,target:n,type:t,listener:e},o=vt.bind(s);return o.listener=e,s.wrapFn=o,o}u.prototype.once=function(t,e){return M(e),this.on(t,G(this,t,e)),this};u.prototype.prependOnceListener=function(t,e){return M(e),this.prependListener(t,G(this,t,e)),this};u.prototype.removeListener=function(t,e){var s,o,r,i,a;if(M(e),o=this._events,o===void 0)return this;if(s=o[t],s===void 0)return this;if(s===e||s.listener===e)--this._eventsCount===0?this._events=Object.create(null):(delete o[t],o.removeListener&&this.emit("removeListener",t,s.listener||e));else if(typeof s!="function"){for(r=-1,i=s.length-1;i>=0;i--)if(s[i]===e||s[i].listener===e){a=s[i].listener,r=i;break}if(r<0)return this;r===0?s.shift():_t(s,r),s.length===1&&(o[t]=s[0]),o.removeListener!==void 0&&this.emit("removeListener",t,a||e)}return this};u.prototype.off=u.prototype.removeListener;u.prototype.removeAllListeners=function(t){var e,s,o;if(s=this._events,s===void 0)return this;if(s.removeListener===void 0)return arguments.length===0?(this._events=Object.create(null),this._eventsCount=0):s[t]!==void 0&&(--this._eventsCount===0?this._events=Object.create(null):delete s[t]),this;if(arguments.length===0){var r=Object.keys(s),i;for(o=0;o<r.length;++o)i=r[o],i!=="removeListener"&&this.removeAllListeners(i);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if(e=s[t],typeof e=="function")this.removeListener(t,e);else if(e!==void 0)for(o=e.length-1;o>=0;o--)this.removeListener(t,e[o]);return this};function Q(n,t,e){var s=n._events;if(s===void 0)return[];var o=s[t];return o===void 0?[]:typeof o=="function"?e?[o.listener||o]:[o]:e?bt(o):et(o,o.length)}u.prototype.listeners=function(t){return Q(this,t,!0)};u.prototype.rawListeners=function(t){return Q(this,t,!1)};u.listenerCount=function(n,t){return typeof n.listenerCount=="function"?n.listenerCount(t):tt.call(n,t)};u.prototype.listenerCount=tt;function tt(n){var t=this._events;if(t!==void 0){var e=t[n];if(typeof e=="function")return 1;if(e!==void 0)return e.length}return 0}u.prototype.eventNames=function(){return this._eventsCount>0?k(this._events):[]};function et(n,t){for(var e=new Array(t),s=0;s<t;++s)e[s]=n[s];return e}function _t(n,t){for(;t+1<n.length;t++)n[t]=n[t+1];n.pop()}function bt(n){for(var t=new Array(n.length),e=0;e<t.length;++e)t[e]=n[e].listener||n[e];return t}function It(n,t){return new Promise(function(e,s){function o(i){n.removeListener(t,r),s(i)}function r(){typeof n.removeListener=="function"&&n.removeListener("error",o),e([].slice.call(arguments))}nt(n,t,r,{once:!0}),t!=="error"&&Et(n,o,{once:!0})})}function Et(n,t,e){typeof n.on=="function"&&nt(n,"error",t,e)}function nt(n,t,e,s){if(typeof n.on=="function")s.once?n.once(t,e):n.on(t,e);else if(typeof n.addEventListener=="function")n.addEventListener(t,function o(r){s.once&&n.removeEventListener(t,o),e(r)});else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof n)}var xt=B.exports;const st=ct(xt);class D extends st{constructor(t,e,s){super(),this.roomID=t,this.hostname=e,this.client=s}events=[];stateEvents=[];name;notification_count=0;notification_highlight_count=0;joined_count=0;invited_count=0;is_dm=!1;windowPos={};addEvents(t){t.forEach(e=>{this.events.push(e)}),this.emit("events",this.events)}addStateEvents(t){t.forEach(e=>{const s=this.stateEvents.findIndex(o=>o.state_key===e.state_key&&o.type===e.type);s!==-1?this.stateEvents[s]=e:this.stateEvents.push(e)}),this.emit("state_events",this.stateEvents)}getStateEvents(){return this.stateEvents}isTombstoned(){let t=!1;return this.stateEvents.forEach(e=>{e.type==="m.room.tombstone"&&(t=!0)}),t}getAvatarURL(){let t;return this.stateEvents.forEach(e=>{if(lt(e)){const s=e.content.url;s?.startsWith("mxc://")&&(t=this.client.convertMXC(s))}}),t}isSpace(){let t=!1;return this.stateEvents.forEach(e=>{ut(e)&&(t=e.content.type==="m.space")}),t}setName(t){this.name=t}getName(){return this.name?this.name:this.roomID}getTopic(){let t;return this.stateEvents.forEach(e=>{yt(e)&&(t=e.content.topic)}),t}setNotificationCount(t){this.notification_count=t}getNotificationCount(){return this.notification_count}setNotificationHighlightCount(t){this.notification_highlight_count=t}getNotificationHighlightCount(){return this.notification_highlight_count}setJoinedCount(t){this.joined_count=t}getJoinedCount(){return this.joined_count}setInvitedCount(t){this.invited_count=t}getInvitedCount(){return this.invited_count}getSpaceChildrenIDs(){const t=[];return this.stateEvents.forEach(e=>{pt(e)&&t.push(e.state_key)}),t}getSpaceParentIDs(){const t=[];return this.stateEvents.forEach(e=>{gt(e)&&t.push({roomID:e.state_key,canonical:e.content.canonical||!1})}),t}setDM(t){this.is_dm=t}isDM(){return this.is_dm}isOnline(){return!1}getEvents(){return this.events}getMemberName(t){let e=t;return this.stateEvents.forEach(s=>{s.type==="m.room.member"&&s.state_key===t&&s.content.membership=="join"&&(e=s.content.displayname)}),e}getMemberAvatar(t){let e;return this.stateEvents.forEach(s=>{if(s.type==="m.room.member"&&s.state_key===t&&s.content.membership=="join"){const o=s.content.avatar_url;o?.startsWith("mxc://")&&(e=this.client.convertMXC(o))}}),e}isEncrypted(){let t=!1;return this.stateEvents.forEach(e=>{e.type==="m.room.encryption"&&e.content.algorithm==="m.megolm.v1.aes-sha2"&&e.state_key===""&&(t=!0)}),t}async sendHtmlMessage(t,e){if(this.isEncrypted()){console.log("Sending encrypted message"),await this.client.shareKeys();const s=await this.client.olmMachine?.encryptRoomEvent(new p.RoomId(this.roomID),"m.room.message",JSON.stringify({msgtype:"m.text",body:e,format:"org.matrix.custom.html",formatted_body:t})),o=await fetch(`${this.hostname}/_matrix/client/v3/rooms/${this.roomID}/send/m.room.encrypted/${Date.now().toString()}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.client.accessToken}`},body:s});if(!o.ok)throw new Error(`Failed to send message: ${o.status} ${o.statusText}`);return(await o.json()).event_id}else{const s=await fetch(`${this.hostname}/_matrix/client/v3/rooms/${this.roomID}/send/m.room.message/${Date.now().toString()}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.client.accessToken}`},body:JSON.stringify({msgtype:"m.text",body:e,format:"org.matrix.custom.html",formatted_body:t})});if(!s.ok)throw new Error(`Failed to send message: ${s.status} ${s.statusText}`);return(await s.json()).event_id}}async sendTextMessage(t){if(this.isEncrypted()){console.log("Sending encrypted message2"),await this.client.shareKeys();const e=await this.client.olmMachine?.encryptRoomEvent(new p.RoomId(this.roomID),"m.room.message",JSON.stringify({msgtype:"m.text",body:t})),s=await fetch(`${this.hostname}/_matrix/client/v3/rooms/${this.roomID}/send/m.room.encrypted/${Date.now().toString()}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.client.accessToken}`},body:e});if(!s.ok)throw new Error(`Failed to send message: ${s.status} ${s.statusText}`);return(await s.json()).event_id}else{const e=await fetch(`${this.hostname}/_matrix/client/v3/rooms/${this.roomID}/send/m.room.message/${Date.now().toString()}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.client.accessToken}`},body:JSON.stringify({msgtype:"m.text",body:t})});if(!e.ok)throw new Error(`Failed to send message: ${e.status} ${e.statusText}`);return(await e.json()).event_id}}getJoinedMemberIDs(){const t=[];return this.stateEvents.forEach(e=>{e.type==="m.room.member"&&e.content.membership==="join"&&t.push(e.state_key)}),t}getEncryptionSettings(){let t;return this.stateEvents.forEach(e=>{e.type==="m.room.encryption"&&e.state_key===""&&(t||(t=new p.EncryptionSettings),t.algorithm=e.content.algorithm==="m.megolm.v1.aes-sha2"?p.EncryptionAlgorithm.MegolmV1AesSha2:p.EncryptionAlgorithm.OlmV1Curve25519AesSha2,e.content.rotation_period_ms&&(t.rotationPeriod=BigInt(e.content.rotation_period_ms)),e.content.rotation_period_msgs&&(t.rotationPeriodMessages=BigInt(e.content.rotation_period_msgs))),e.type==="m.room.history_visibility"&&e.state_key===""&&(t||(t=new p.EncryptionSettings),t.historyVisibility=e.content.history_visibility)}),t&&(t.onlyAllowTrustedDevices=!1),t}}function Kt(n){const[t,e]=I.useState(n?.getEvents()||[]);return I.useEffect(()=>{if(n){e(n?.getEvents()||[]);const s=o=>{e([...o])};return n.on("events",s),()=>{n.removeListener("events",s)}}else e([])},[n]),t}const St=(n,t)=>t.some(e=>n instanceof e);let z,J;function Rt(){return z||(z=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Dt(){return J||(J=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const ot=new WeakMap,$=new WeakMap,it=new WeakMap,P=new WeakMap,U=new WeakMap;function Ct(n){const t=new Promise((e,s)=>{const o=()=>{n.removeEventListener("success",r),n.removeEventListener("error",i)},r=()=>{e(x(n.result)),o()},i=()=>{s(n.error),o()};n.addEventListener("success",r),n.addEventListener("error",i)});return t.then(e=>{e instanceof IDBCursor&&ot.set(e,n)}).catch(()=>{}),U.set(t,n),t}function Lt(n){if($.has(n))return;const t=new Promise((e,s)=>{const o=()=>{n.removeEventListener("complete",r),n.removeEventListener("error",i),n.removeEventListener("abort",i)},r=()=>{e(),o()},i=()=>{s(n.error||new DOMException("AbortError","AbortError")),o()};n.addEventListener("complete",r),n.addEventListener("error",i),n.addEventListener("abort",i)});$.set(n,t)}let A={get(n,t,e){if(n instanceof IDBTransaction){if(t==="done")return $.get(n);if(t==="objectStoreNames")return n.objectStoreNames||it.get(n);if(t==="store")return e.objectStoreNames[1]?void 0:e.objectStore(e.objectStoreNames[0])}return x(n[t])},set(n,t,e){return n[t]=e,!0},has(n,t){return n instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in n}};function jt(n){A=n(A)}function Tt(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...e){const s=n.call(O(this),t,...e);return it.set(s,t.sort?t.sort():[t]),x(s)}:Dt().includes(n)?function(...t){return n.apply(O(this),t),x(ot.get(this))}:function(...t){return x(n.apply(O(this),t))}}function kt(n){return typeof n=="function"?Tt(n):(n instanceof IDBTransaction&&Lt(n),St(n,Rt())?new Proxy(n,A):n)}function x(n){if(n instanceof IDBRequest)return Ct(n);if(P.has(n))return P.get(n);const t=kt(n);return t!==n&&(P.set(n,t),U.set(t,n)),t}const O=n=>U.get(n);function Mt(n,t,{blocked:e,upgrade:s,blocking:o,terminated:r}={}){const i=indexedDB.open(n,t),a=x(i);return s&&i.addEventListener("upgradeneeded",h=>{s(x(i.result),h.oldVersion,h.newVersion,x(i.transaction),h)}),e&&i.addEventListener("blocked",h=>e(h.oldVersion,h.newVersion,h)),a.then(h=>{r&&h.addEventListener("close",()=>r()),o&&h.addEventListener("versionchange",f=>o(f.oldVersion,f.newVersion,f))}).catch(()=>{}),a}function Pt(n,{blocked:t}={}){const e=indexedDB.deleteDatabase(n);return t&&e.addEventListener("blocked",s=>t(s.oldVersion,s)),x(e).then(()=>{})}const Ot=["get","getKey","getAll","getAllKeys","count"],Nt=["put","add","delete","clear"],N=new Map;function K(n,t){if(!(n instanceof IDBDatabase&&!(t in n)&&typeof t=="string"))return;if(N.get(t))return N.get(t);const e=t.replace(/FromIndex$/,""),s=t!==e,o=Nt.includes(e);if(!(e in(s?IDBIndex:IDBObjectStore).prototype)||!(o||Ot.includes(e)))return;const r=async function(i,...a){const h=this.transaction(i,o?"readwrite":"readonly");let f=h.store;return s&&(f=f.index(a.shift())),(await Promise.all([f[e](...a),o&&h.done]))[0]};return N.set(t,r),r}jt(n=>({...n,get:(t,e,s)=>K(t,e)||n.get(t,e,s),has:(t,e)=>!!K(t,e)||n.has(t,e)}));class rt extends st{static _instance;access_token;device_id;mxid;hostname;slidingSyncHostname;syncing=!1;roomsInView=[];spacesInView=[];spaceOpen=[];rooms=new Set;syncPos;initialSync=!0;database;profileInfo;lastRanges;lastTxnID;to_device_since;olmMachine;currentRoom;abortController=new AbortController;mustUpdateTxnID=!0;outgoingRequestsBeingProcessed=!1;missingSessionsBeingRequested=!1;get accessToken(){return this.access_token}get isLoggedIn(){return this.access_token!==void 0}convertMXC(t){return`${this.hostname}/_matrix/media/r0/download/${t.substring(6)}`}setCurrentRoom(t){t!==this.currentRoom&&(this.currentRoom=t,console.log("Current room changed to",t,"restarting sync"),this.mustUpdateTxnID=!0,this.abortController=new AbortController)}static async Instance(){let t=this._instance;if(!t){t=this._instance=new this,t.database||await t.createDatabase();const e=t.database?.transaction("loginInfo","readonly"),s=await e?.store.getAll();if(await e?.done,s&&s.length>0){t.mxid=s[0].userId,t.hostname=s[0].hostname,t.slidingSyncHostname=s[0].slidingSyncHostname,t.access_token=s[0].access_token,t.device_id=s[0].device_id,t.profileInfo={avatar_url:s[0].avatarUrl,displayname:s[0].displayName},t.mxid&&t.hostname&&t.access_token&&t.device_id&&(t.olmMachine=await p.OlmMachine.initialize(new p.UserId(t.mxid),new p.DeviceId(t.device_id),"cetirizine-crypto"));const o=t.database?.transaction("syncInfo","readonly"),r=await o?.store.get(t.mxid);await o?.done,r&&(t.syncPos=r.syncPos,t.initialSync=r.initialSync,t.lastRanges=r.lastRanges,t.lastTxnID=r.lastTxnID,t.to_device_since=r.to_device_since);const i=t.database?.transaction("rooms","readonly"),a=await i?.store.getAll();await i?.done,a&&(t.rooms=new Set(a.map(h=>{const f=new D(h.roomID,t.hostname,t);return f.windowPos=h.windowPos,f.setInvitedCount(h.invited_count),f.setJoinedCount(h.joined_count),f.setNotificationCount(h.notification_count),f.setNotificationHighlightCount(h.highlight_count),f.setName(h.name),h.events&&f.addEvents(h.events),h.stateEvents&&f.addStateEvents(h.stateEvents),h.isDM&&f.setDM(h.isDM),f})),t.emit("rooms",t.rooms))}}return t}async createDatabase(){this.database=await Mt("matrix",4,{upgrade(t,e){e<1&&(t.objectStoreNames.contains("rooms")&&t.deleteObjectStore("rooms"),t.objectStoreNames.contains("syncInfo")&&t.deleteObjectStore("syncInfo"),t.createObjectStore("rooms",{keyPath:"roomID"}),t.createObjectStore("loginInfo",{keyPath:"userId"}),t.createObjectStore("syncInfo",{keyPath:"userId"}))}})}async setHostname(t){if(!t.startsWith("https://"))throw Error("Hostname must start with 'https://'");this.database||await this.createDatabase();const e=this.database?.transaction("loginInfo","readwrite");await e?.store.put({userId:this.mxid,hostname:t,slidingSyncHostname:this.slidingSyncHostname,access_token:this.access_token,device_id:this.device_id}),await e?.done,this.hostname=t}async startSync(){if(!this.isLoggedIn)throw Error("Not logged in");if(this.database||await this.createDatabase(),!this.syncing)for(this.syncing=!0;this.syncing;)try{await this.sync()}catch(t){console.error(t)}}stopSync(){this.syncing=!1}isIndexInRange(t,e){for(const s of e)if(s[0]<t&&t<=s[1])return!0;return!1}shiftRight(t,e,s,o){for(let r=s-1;r>o-1;r--)if(this.isIndexInRange(r,e)){const i=[...this.rooms].find(a=>a.windowPos[t]===r+1);i&&(i.windowPos[t]=r)}}shiftLeft(t,e,s,o){for(let r=o+1;r<s+1;r++)if(this.isIndexInRange(r,e)){const i=[...this.rooms].find(a=>a.windowPos[t]===r-1);i&&(i.windowPos[t]=r)}}async removeEntry(t,e,s){let o=-1;const r=[...this.rooms].map(i=>i.windowPos[t]);for(const i in r)Number(i)>o&&(o=Number(i));o<0||s>o||this.shiftLeft(t,e,o,s)}addEntry(t,e,s){let o=-1;const r=[...this.rooms].map(i=>i.windowPos[t]);for(const i in r)Number(i)>o&&(o=Number(i));o<0||s>o||this.shiftRight(t,e,o+1,s)}async sendIdentifyAndOneTimeKeys(){if(!this.isLoggedIn)throw Error("Not logged in");if(!this.slidingSyncHostname)throw Error("Hostname must be set first");if(!this.olmMachine)throw Error("Olm machine must be set first");if(this.outgoingRequestsBeingProcessed)return;this.outgoingRequestsBeingProcessed=!0;const t=await this.olmMachine.outgoingRequests();for(const e of t)await this.processRequest(e);await this.shareKeys(),this.outgoingRequestsBeingProcessed=!1}async shareKeys(){if(!this.isLoggedIn)throw Error("Not logged in");if(!this.slidingSyncHostname)throw Error("Hostname must be set first");if(!this.olmMachine)throw Error("Olm machine must be set first");if(this.missingSessionsBeingRequested)return;this.missingSessionsBeingRequested=!0;const t=[...this.rooms].filter(o=>o.isEncrypted()),e=t.map(o=>o.getJoinedMemberIDs().map(r=>new p.UserId(r))).flat(),s=await this.olmMachine?.getMissingSessions(e);s&&await this.processRequest(s);for(const o of t){const r=o.getEncryptionSettings();if(r){const i=await this.olmMachine.shareRoomKey(new p.RoomId(o.roomID),o.getJoinedMemberIDs().map(a=>new p.UserId(a)),r);for(const a of i)await this.processRequest(a)}}this.missingSessionsBeingRequested=!1}async logout(){this.stopSync(),this.abortController.abort(),this.access_token=void 0,this.device_id=void 0,this.initialSync=!0,this.rooms=new Set,this.slidingSyncHostname=void 0,this.syncPos=void 0,this.to_device_since=void 0,this.outgoingRequestsBeingProcessed=!1,this.missingSessionsBeingRequested=!1;const t=this.database?.transaction("syncInfo","readwrite");await t?.store.delete(this.mxid),await t?.done;const e=this.database?.transaction("loginInfo","readwrite");await e?.store.delete(this.mxid),await e?.done;const s=this.database?.transaction("rooms","readwrite");await s?.store.clear(),await s?.done,await Pt("cetirizine-crypto"),this.mxid=void 0}async processRequest(t){if(!this.isLoggedIn)throw Error("Not logged in");if(!this.slidingSyncHostname)throw Error("Hostname must be set first");if(!this.olmMachine)throw Error("Olm machine must be set first");if(t.type===p.RequestType.KeysUpload){const e=t,s=await fetch(`${this.hostname}/_matrix/client/v3/keys/upload`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.access_token}`},body:e.body});if(!s.ok){s.status===401&&(await this.logout(),console.error(s)),console.error("Failed to upload keys",s);return}this.olmMachine.markRequestAsSent(e.id,e.type,await s.text())}else if(t.type===p.RequestType.KeysQuery){const e=t,s=await fetch(`${this.hostname}/_matrix/client/v3/keys/query`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.access_token}`},body:e.body});if(!s.ok){s.status===401&&(await this.logout(),console.error(s)),console.error("Failed to query keys",s);return}this.olmMachine.markRequestAsSent(e.id,e.type,await s.text())}else if(t.type===p.RequestType.KeysClaim){const e=t,s=await fetch(`${this.hostname}/_matrix/client/v3/keys/claim`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.access_token}`},body:e.body});if(!s.ok){s.status===401&&(await this.logout(),console.error(s)),console.error("Failed to claim keys",s);return}this.olmMachine.markRequestAsSent(e.id,e.type,await s.text())}else if(t.type===p.RequestType.ToDevice){const e=t,s=await fetch(`${this.hostname}/_matrix/client/v3/sendToDevice/${e.event_type}/${e.txn_id}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.access_token}`},body:e.body});if(!s.ok){s.status===401&&(await this.logout(),console.error(s)),console.error("Failed to send to device",s);return}this.olmMachine.markRequestAsSent(e.id??e.txn_id,e.type,await s.text())}else if(t.type===p.RequestType.SignatureUpload){const e=t,s=await fetch(`${this.hostname}/_matrix/client/v3/keys/signatures/upload`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.access_token}`},body:e.body});if(!s.ok){s.status===401&&(await this.logout(),console.error(s)),console.error("Failed to upload signatures",s);return}this.olmMachine.markRequestAsSent(e.id,e.type,await s.text())}else if(t.type===p.RequestType.RoomMessage){const e=t,s=await fetch(`${this.hostname}/_matrix/client/v3/rooms/${e.room_id}/send/${e.event_type}/${e.txn_id}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.access_token}`},body:e.body});if(!s.ok){s.status===401&&(await this.logout(),console.error(s)),console.error("Failed to send message",s);return}this.olmMachine.markRequestAsSent(e.id,e.type,await s.text())}else if(t.type===p.RequestType.KeysBackup){const e=t,s=await fetch(`${this.hostname}/_matrix/client/v3/room_keys/keys`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.access_token}`},body:e.body});if(!s.ok){s.status===401&&(await this.logout(),console.error(s)),console.error("Failed to backup keys",s);return}this.olmMachine.markRequestAsSent(e.id,e.type,await s.text())}}async sync(){if(!this.isLoggedIn)throw Error("Not logged in");if(!this.slidingSyncHostname)throw Error("Hostname must be set first");await this.sendIdentifyAndOneTimeKeys();let t={overview:[[0,20]],spaces:[[0,20]]};for(const c of this.spaceOpen)c!=="other"&&(t[c]=[[0,20]]);let e=1,s=10;if(!this.initialSync)for(const c in t){e=10,s=50;let v=new Set([...this.rooms].filter(m=>this.roomsInView.includes(m.roomID)).map(m=>m.windowPos[c]).sort().filter(m=>m!=null));if(this.getSpaces().find(m=>m.roomID===c)&&(v=new Set([...this.rooms].filter(m=>this.spacesInView.includes(m.roomID)).map(m=>m.windowPos[c]).sort().filter(m=>m!=null))),v.size!==0){const m=Math.min(...v),S=Math.max(...v);t[c]=[[Math.max(m-10,0),S+10]]}}this.lastRanges&&Object.entries(t).toString()!==Object.entries(this.lastRanges).toString()&&(console.log("Ranges changed, resetting sync txn_id",t),this.lastRanges=t,this.lastTxnID=Date.now().toString()),this.lastRanges||(this.lastRanges=t,this.lastTxnID=Date.now().toString()),this.mustUpdateTxnID&&(this.lastTxnID=Date.now().toString(),this.mustUpdateTxnID=!1);let o=`${this.slidingSyncHostname}/_matrix/client/unstable/org.matrix.msc3575/sync?timeout=5000`;this.syncPos&&(o=`${this.slidingSyncHostname}/_matrix/client/unstable/org.matrix.msc3575/sync?timeout=5000&pos=${this.syncPos}`);const r={txn_id:this.lastTxnID,lists:{spaces:{ranges:this.lastRanges.spaces,sort:["by_name"],required_state:[["m.space.child","*"],["m.space.parent","*"],["m.room.create",""],["m.room.tombstone",""],["m.room.avatar","*"],["m.room.topic","*"],["m.room.member","$LAZY"],["m.room.encryption",""],["m.room.history_visibility",""]],timeline_limit:0,filters:{room_types:["m.space"]}},overview:{ranges:this.lastRanges.overview,sort:["by_notification_level","by_recency","by_name"],required_state:[["m.space.child","*"],["m.space.parent","*"],["m.room.create",""],["m.room.tombstone",""],["m.room.avatar","*"],["m.room.topic","*"],["m.room.member","$LAZY"],["m.room.encryption",""],["m.room.history_visibility",""]],timeline_limit:e,filters:{not_room_types:["m.space"]}}},bump_event_types:["m.room.message","m.room.encrypted"],extensions:{e2ee:{enabled:!0},to_device:{enabled:!0,since:this.to_device_since}}};for(const c of this.spaceOpen)c!=="other"&&(r.lists||(r.lists={}),r.lists[c]={slow_get_all_rooms:!0,ranges:this.lastRanges[c],sort:["by_notification_level","by_recency","by_name"],required_state:[["m.space.child","*"],["m.space.parent","*"],["m.room.create",""],["m.room.tombstone",""],["m.room.avatar","*"],["m.room.topic","*"],["m.room.member","$LAZY"],["m.room.encryption",""],["m.room.history_visibility",""]],timeline_limit:e,filters:{spaces:[c]}});this.currentRoom&&(r.room_subscriptions={},r.room_subscriptions[this.currentRoom]={sort:["by_notification_level","by_recency","by_name"],required_state:[["m.space.child","*"],["m.space.parent","*"],["m.room.create",""],["m.room.tombstone",""],["m.room.avatar","*"],["m.room.topic","*"],["m.room.member","$LAZY"],["m.room.encryption",""],["m.room.history_visibility",""]],timeline_limit:s,filters:{}});const i=await fetch(o,{method:"POST",signal:this.abortController.signal,headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.access_token}`},body:JSON.stringify(r)});if(!i.ok)if(i.status===400){if((await i.json()).errcode==="M_UNKNOWN_POS"){this.syncPos=void 0;const c=this.database?.transaction("syncInfo","readwrite");await c?.store.put({userId:this.mxid,syncPos:this.syncPos,initialSync:this.initialSync,lastRanges:this.lastRanges,lastTxnID:this.lastTxnID}),await c?.done}return}else i.status===401&&(await this.logout(),console.error(i),console.error("Error syncing. See console for error."));const a=await i.json();this.syncPos=a.pos,a.extensions?.to_device&&(await this.olmMachine?.receiveSyncChanges(JSON.stringify(a.extensions.to_device.events||[]),new p.DeviceLists(a.extensions.e2ee?.device_lists?.changed?.map(c=>new p.UserId(c)),a.extensions.e2ee?.device_lists?.left?.map(c=>new p.UserId(c))),new Map(Object.entries(a.extensions.e2ee?.device_one_time_keys_count||[])),new Set(a.extensions.e2ee?.device_unused_fallback_key_types)),this.to_device_since=a.extensions.to_device.next_batch),await this.sendIdentifyAndOneTimeKeys();const h=this.database?.transaction("syncInfo","readwrite");await h?.store.put({userId:this.mxid,syncPos:this.syncPos,initialSync:this.initialSync,lastRanges:this.lastRanges,lastTxnID:this.lastTxnID,to_device_since:this.to_device_since}),await h?.done;let f=-1;for(const c in a.lists){const v=a.lists[c];if(v.ops){for(const m of v.ops)if(mt(m)){const S=this.database?.transaction("rooms","readwrite");for(let E=m.range[0];E<=m.range[1];E++){const y=m.room_ids[E-m.range[0]];if(!y)break;const R=[...this.rooms].find(g=>g.roomID===y);if(R){R.windowPos[c]=E;continue}const w=new D(y,this.hostname,this);w.setName(y),w.windowPos[c]=E,this.rooms.add(w),await S?.store.put({windowPos:w.windowPos,roomID:w.roomID,name:w.getName(),notification_count:w.getNotificationCount(),highlight_count:w.getNotificationHighlightCount(),joined_count:w.getJoinedCount(),invited_count:w.getInvitedCount(),avatarUrl:w.getAvatarURL(),isSpace:w.isSpace(),isDM:w.isDM(),stateEvents:w.getStateEvents(),events:w.getEvents()})}await S?.done}else if(ht(m)){console.log("Got INSERT OP",m),[...this.rooms].find(g=>g.windowPos[c]===m.index)&&(f<0?this.addEntry(c,this.lastRanges[c],m.index):f>m.index?this.shiftRight(c,this.lastRanges[c],f,m.index):f<m.index&&this.shiftLeft(c,this.lastRanges[c],m.index,f)),f=-1;const E=this.database?.transaction("rooms","readwrite"),y=[...this.rooms].find(g=>g.roomID===m.room_id);if(y)y.windowPos[c]=m.index,await E?.store.put({windowPos:y.windowPos,roomID:y.roomID,name:y.getName(),notification_count:y.getNotificationCount(),highlight_count:y.getNotificationHighlightCount(),joined_count:y.getJoinedCount(),invited_count:y.getInvitedCount(),avatarUrl:y.getAvatarURL(),isSpace:y.isSpace(),isDM:y.isDM(),stateEvents:y.getStateEvents(),events:y.getEvents()});else{const g=await E?.store.get(m.room_id);let l=new D(m.room_id,this.hostname,this);l.setName(m.room_id),l.windowPos[c]=m.index,g&&(console.warn("Room in db but not in obj list.",m.room_id,"Updating obj list."),l=new D(m.room_id,this.hostname,this),l.setName(g.name),l.setNotificationCount(g.notification_count),l.setNotificationHighlightCount(g.highlight_count),l.setJoinedCount(g.joined_count),l.setInvitedCount(g.invited_count),l.setDM(g.isDM||!1)),this.rooms.add(l),await E?.store.put({windowPos:l.windowPos,roomID:l.roomID,name:l.getName(),notification_count:l.getNotificationCount(),highlight_count:l.getNotificationHighlightCount(),joined_count:l.getJoinedCount(),invited_count:l.getInvitedCount(),avatarUrl:l.getAvatarURL(),isSpace:l.isSpace(),isDM:l.isDM(),stateEvents:l.getStateEvents(),events:l.getEvents()})}const R=[...this.rooms].map(g=>g.roomID),w=R.filter((g,l)=>R.indexOf(g)!=l);w.length>0&&console.error("Duplicates found",w),await E?.done}else ft(m)?(console.log("Got DELETE OP",m),f!==-1&&await this.removeEntry(c,this.lastRanges[c],f),f=m.index):dt(m);f!==-1&&await this.removeEntry(c,this.lastRanges[c],f)}}for(const c in a.rooms){const v=a.rooms[c],m=v.name,S=v.notification_count,E=v.highlight_count,y=v.joined_count,R=v.invited_count,w=v.timeline,g=w?.filter(b=>F(b)).map(b=>b),l=w?.filter(b=>!F(b)).map(b=>b),j=v.required_state,H=v.is_dm;let d=[...this.rooms].find(b=>b.roomID===c);if(!d){console.warn("Could not find roomObj for roomID:",c);const b=this.database?.transaction("rooms","readwrite"),_=await b?.store.get(c);await b?.done,_?(console.warn("Room in db but not in obj list.",c,"Updating obj list."),d=new D(c,this.hostname,this),d.setName(_.name),d.setNotificationCount(_.notification_count),d.setNotificationHighlightCount(_.highlight_count),d.setJoinedCount(_.joined_count),d.setInvitedCount(_.invited_count),d.setDM(_.isDM||!1),_.events&&d.addEvents(_.events),_.stateEvents&&d.addStateEvents(_.stateEvents),d.windowPos=_.windowPos):(console.warn("Could not find room in db. Creating new one."),d=new D(c,this.hostname,this),this.rooms.add(d))}if(m&&d.setName(m),d.setNotificationCount(S),d.setNotificationHighlightCount(E),d.setJoinedCount(y),d.setInvitedCount(R),l&&d.addEvents(l),j&&d.addStateEvents(j),g&&d.addStateEvents(g),(j||g)&&d.isEncrypted()){const _=[...j||[],...g||[]].filter(T=>T.type==="m.room.member"&&T.content.membership==="join").map(T=>new p.UserId(T.state_key));await this.olmMachine?.updateTrackedUsers(_)}H&&d.setDM(H);const q=this.database?.transaction("rooms","readwrite");await q?.store.put({windowPos:d.windowPos,roomID:d.roomID,name:d.getName(),notification_count:d.getNotificationCount(),highlight_count:d.getNotificationHighlightCount(),joined_count:d.getJoinedCount(),invited_count:d.getInvitedCount(),events:d.getEvents(),stateEvents:d.getStateEvents(),avatarUrl:d.getAvatarURL(),isSpace:d.isSpace(),isDM:d.isDM()}),await q?.done}this.initialSync&&(this.initialSync=!1,console.log("initialSyncComplete")),a.rooms&&Object.keys(a.rooms).length>0&&this.emit("rooms",this.rooms)}addInViewRoom(t){this.roomsInView.push(t)}removeInViewRoom(t){this.roomsInView=this.roomsInView.filter(e=>e!==t)}addInViewSpace(t){this.spacesInView.push(t)}removeInViewSpace(t){this.spacesInView=this.spacesInView.filter(e=>e!==t)}addSpaceOpen(t){t!=="other"&&(this.spaceOpen.push(t),console.log("Space opened",t,"restarting sync"),this.mustUpdateTxnID=!0,this.abortController=new AbortController)}removeSpaceOpen(t){t!=="other"&&(this.spaceOpen=this.spaceOpen.filter(e=>e!==t),this.mustUpdateTxnID=!0)}getRooms(){return this.rooms}getSpaces(){return[...this.rooms].filter(t=>t.isSpace()&&!t.isTombstoned()).sort((t,e)=>t.getName()<e.getName()?-1:t.getName()>e.getName()?1:0)}getSpacesWithRooms(){const t=this.getSpaces(),e=new Set;for(const s of t){const o=s.getSpaceChildrenIDs(),r=new Set([...this.getRooms()].filter(i=>o.includes(i.roomID)));e.add({spaceRoom:s,children:r})}for(const s of this.getRooms()){if(s.isSpace()||s.isTombstoned())continue;const o=s.getSpaceParentIDs();for(const r of o){const i=[...this.getRooms()].find(h=>h.roomID===r.roomID);if(!i)continue;const a=[...e].find(h=>h.spaceRoom.roomID===i.roomID);if(a){[...a.children].find(h=>h.roomID===s.roomID)||a.children.add(s);continue}e.add({spaceRoom:i,children:new Set([s])})}}return e}async getLoginFlows(){if(!this.hostname)throw Error("Hostname must be set first");const t=await fetch(`${this.hostname}/_matrix/client/v3/login`);if(!t.ok)throw console.error(t),Error("Error requesting login flows. See console for error.");return await t.json()}async getWellKnown(){if(!this.hostname)throw Error("Hostname must be set first");const t=await fetch(`${this.hostname}/.well-known/matrix/client`);if(!t.ok)throw console.error(t),Error("Error requesting login flows. See console for error.");return await t.json()}async passwordLogin(t,e,s=5){if(this.database||await this.createDatabase(),!t)throw Error("Username must be set");if(!e)throw Error("Password must be set");this.mxid=t,await this.setHostname(`https://${t.split(":")[1]}`);try{const a=await this.getWellKnown();if(a["m.homeserver"]?.base_url&&await this.setHostname(a["m.homeserver"].base_url),a["org.matrix.msc3575.proxy"]?.url){const h=this.database?.transaction("loginInfo","readwrite");await h?.store.put({userId:this.mxid,hostname:this.hostname,slidingSyncHostname:a["org.matrix.msc3575.proxy"].url,access_token:this.access_token,device_id:this.device_id}),await h?.done,this.slidingSyncHostname=a["org.matrix.msc3575.proxy"].url}else throw Error("No sliding sync proxy found")}catch(a){console.warn(`No well-known found for ${this.hostname}:
${a}`)}if(((await this.getLoginFlows()).flows.filter(a=>a.type==="m.login.password")?.length||0)==0)throw Error("Password login is not supported by this homeserver");const r=await fetch(`${this.hostname}/_matrix/client/r0/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"m.login.password",identifier:{type:"m.id.user",user:t},user:t,password:e})});if(!r.ok)throw console.error(r),Error("Error logging in. See console for error.");const i=await r.json();if(Bt(i))throw Error(`Error logging in: ${i.errcode}: ${i.error}`);if($t(i)&&(console.error(`Rate limited. Retrying in ${i.retry_after_ms}ms. ${s} tries left.`),await this.passwordLogin(t,e,s-1)),At(i)){const a=this.database?.transaction("loginInfo","readwrite");await a?.store.put({userId:i.user_id,hostname:this.hostname,slidingSyncHostname:this.slidingSyncHostname,access_token:i.access_token,device_id:i.device_id}),await a?.done,this.access_token=i.access_token,this.device_id=i.device_id,this.mxid=i.user_id,this.olmMachine=await p.OlmMachine.initialize(new p.UserId(this.mxid),new p.DeviceId(this.device_id),"cetirizine-crypto")}}async fetchProfileInfo(t){if(this.profileInfo)return this.profileInfo;if(!this.hostname)throw Error("Hostname must be set first");if(this.database||await this.createDatabase(),!this.access_token)throw Error("Access token must be set first");const e=await fetch(`${this.hostname}/_matrix/client/r0/profile/${t}`,{headers:{Authorization:`Bearer ${this.access_token}`}});if(!e.ok){if(e.status===404||e.status===403)return{};throw console.error(e),Error("Error fetching profile info. See console for error.")}const s=await e.json();s.avatar_url=s.avatar_url?.replace("mxc://",`${this.hostname}/_matrix/media/r0/download/`),this.profileInfo=s;const o=this.database?.transaction("loginInfo","readwrite");return await o?.store.put({userId:this.mxid,device_id:this.device_id,hostname:this.hostname,slidingSyncHostname:this.slidingSyncHostname,access_token:this.access_token,displayName:s.displayname,avatarUrl:s.avatar_url}),await o?.done,s}}function $t(n){return n.retry_after_ms!==void 0}function At(n){return n.access_token!==void 0}function Bt(n){return n.errcode!==void 0}const at=await rt.Instance(),L=I.createContext(at);function Ut(){const n=I.useContext(L),[t,e]=I.useState(n.getRooms());return I.useEffect(()=>{const s=o=>{e(o)};return n.on("rooms",s),n.startSync(),()=>{n.removeListener("rooms",s)}},[]),t}function Ht(n){return[...I.useContext(L).getRooms()].find(e=>e.roomID===n)}function qt(){const n=I.useContext(L),[t,e]=I.useState(n.getSpacesWithRooms());return I.useEffect(()=>{const s=o=>{e(n.getSpacesWithRooms())};return n.on("rooms",s),n.startSync(),()=>{n.removeListener("rooms",s)}},[]),t}function Ft(){const n=I.useContext(L),[t,e]=I.useState({displayname:n.mxid||"Unknown"});return I.useEffect(()=>{n.fetchProfileInfo(n.mxid).then(s=>{s.displayname||(s.displayname=n.mxid||"Unknown"),e(s)})},[]),t}const Xt=Object.freeze(Object.defineProperty({__proto__:null,MatrixClient:rt,MatrixContext:L,defaultMatrixClient:at,useProfile:Ft,useRoom:Ht,useRooms:Ut,useSpaces:qt},Symbol.toStringTag,{value:"Module"}));export{L as M,zt as a,Jt as b,Kt as c,Ft as d,qt as e,Ut as f,Xt as g,Wt as i,Ht as u};