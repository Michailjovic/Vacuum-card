/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$3=globalThis,e$3=t$3.ShadowRoot&&(void 0===t$3.ShadyCSS||t$3.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$5=new WeakMap;let n$4 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$3&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$5.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$5.set(s,t));}return t}toString(){return this.cssText}};const r$4=t=>new n$4("string"==typeof t?t:t+"",void 0,s$2),i$5=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1],t[0]);return new n$4(o,t,s$2)},S$1=(s,o)=>{if(e$3)s.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of o){const o=document.createElement("style"),n=t$3.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$3?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$4(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$4,defineProperty:e$2,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$3,getOwnPropertySymbols:o$4,getPrototypeOf:n$3}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$4(t,s),b$1={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b$1){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$2(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b$1}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$3(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$3(t),...o$4(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(t=>t.hostConnected?.());}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.());}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e;const r=h.fromAttribute(s,t.type);this[e]=r??this._$Ej?.get(e)??r,this._$Em=null;}}requestUpdate(t,s,i,e=false,h){if(void 0!==t){const r=this.constructor;if(false===e&&(h=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,i$3=t=>t,s$1=t$2.trustedTypes,e$1=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,h="$lit$",o$3=`lit$${Math.random().toFixed(9).slice(2)}$`,n$2="?"+o$3,r$2=`<${n$2}>`,l=document,c=()=>l.createComment(""),a=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,d=t=>u(t)||"function"==typeof t?.[Symbol.iterator],f="[ \t\n\f\r]",v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_=/-->/g,m=/>/g,p=RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),g=/'/g,$=/"/g,y=/^(?:script|style|textarea|title)$/i,x=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),b=x(1),E=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),C=new WeakMap,P=l.createTreeWalker(l,129);function V(t,i){if(!u(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==e$1?e$1.createHTML(i):i}const N=(t,i)=>{const s=t.length-1,e=[];let n,l=2===i?"<svg>":3===i?"<math>":"",c=v;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,f=0;for(;f<s.length&&(c.lastIndex=f,u=c.exec(s),null!==u);)f=c.lastIndex,c===v?"!--"===u[1]?c=_:void 0!==u[1]?c=m:void 0!==u[2]?(y.test(u[2])&&(n=RegExp("</"+u[2],"g")),c=p):void 0!==u[3]&&(c=p):c===p?">"===u[0]?(c=n??v,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?p:'"'===u[3]?$:g):c===$||c===g?c=p:c===_||c===m?c=v:(c=p,n=void 0);const x=c===p&&t[i+1].startsWith("/>")?" ":"";l+=c===v?s+r$2:d>=0?(e.push(a),s.slice(0,d)+h+s.slice(d)+o$3+x):s+o$3+(-2===d?i:x);}return [V(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),e]};class S{constructor({strings:t,_$litType$:i},e){let r;this.parts=[];let l=0,a=0;const u=t.length-1,d=this.parts,[f,v]=N(t,i);if(this.el=S.createElement(f,e),P.currentNode=this.el.content,2===i||3===i){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=P.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(h)){const i=v[a++],s=r.getAttribute(t).split(o$3),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:l,name:e[2],strings:s,ctor:"."===e[1]?I:"?"===e[1]?L:"@"===e[1]?z:H}),r.removeAttribute(t);}else t.startsWith(o$3)&&(d.push({type:6,index:l}),r.removeAttribute(t));if(y.test(r.tagName)){const t=r.textContent.split(o$3),i=t.length-1;if(i>0){r.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)r.append(t[s],c()),P.nextNode(),d.push({type:2,index:++l});r.append(t[i],c());}}}else if(8===r.nodeType)if(r.data===n$2)d.push({type:2,index:l});else {let t=-1;for(;-1!==(t=r.data.indexOf(o$3,t+1));)d.push({type:7,index:l}),t+=o$3.length-1;}l++;}}static createElement(t,i){const s=l.createElement("template");return s.innerHTML=t,s}}function M(t,i,s=t,e){if(i===E)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=a(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=M(t,h._$AS(t,i.values),h,e)),i}class R{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??l).importNode(i,true);P.currentNode=e;let h=P.nextNode(),o=0,n=0,r=s[0];for(;void 0!==r;){if(o===r.index){let i;2===r.type?i=new k(h,h.nextSibling,this,t):1===r.type?i=new r.ctor(h,r.name,r.strings,this,t):6===r.type&&(i=new Z(h,this,t)),this._$AV.push(i),r=s[++n];}o!==r?.index&&(h=P.nextNode(),o++);}return P.currentNode=l,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class k{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=M(this,t,i),a(t)?t===A||null==t||""===t?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==E&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):d(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==A&&a(this._$AH)?this._$AA.nextSibling.data=t:this.T(l.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=S.createElement(V(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new R(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=C.get(t.strings);return void 0===i&&C.set(t.strings,i=new S(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new k(this.O(c()),this.O(c()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);t!==this._$AB;){const s=i$3(t).nextSibling;i$3(t).remove(),t=s;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class H{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=A;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=M(this,t,i,0),o=!a(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=M(this,e[s+n],i,n),r===E&&(r=this._$AH[n]),o||=!a(r)||r!==this._$AH[n],r===A?t=A:t!==A&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class I extends H{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===A?void 0:t;}}class L extends H{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A);}}class z extends H{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=M(this,t,i,0)??A)===E)return;const s=this._$AH,e=t===A&&s!==A||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==A&&(s===A||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class Z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t);}}const B=t$2.litHtmlPolyfillSupport;B?.(S,k),(t$2.litHtmlVersions??=[]).push("3.3.3");const D=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new k(i.insertBefore(c(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;let i$2 = class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=D(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return E}};i$2._$litElement$=true,i$2["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i$2});const o$2=s.litElementPolyfillSupport;o$2?.({LitElement:i$2});(s.litElementVersions??=[]).push("4.2.2");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=t=>(e,o)=>{ void 0!==o?o.addInitializer(()=>{customElements.define(t,e);}):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o$1={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r$1=(t=o$1,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t,true,r);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t,true,r);}}throw Error("Unsupported decorator location: "+n)};function n$1(t){return (e,o)=>"object"==typeof o?r$1(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function r(r){return n$1({...r,state:true,attribute:false})}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t={ATTRIBUTE:1},e=t=>(...e)=>({_$litDirective$:t,values:e});let i$1 = class i{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i;}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const n="important",i=" !"+n,o=e(class extends i$1{constructor(t$1){if(super(t$1),t$1.type!==t.ATTRIBUTE||"style"!==t$1.name||t$1.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,r)=>{const s=t[r];return null==s?e:e+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(e,[r]){const{style:s}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(r)),this.render(r);for(const t of this.ft)null==r[t]&&(this.ft.delete(t),t.includes("-")?s.removeProperty(t):s[t]=null);for(const t in r){const e=r[t];if(null!=e){this.ft.add(t);const r="string"==typeof e&&e.endsWith(i);t.includes("-")||r?s.setProperty(t,r?e.slice(0,-11):e,r?n:""):s[t]=e;}}return E}});

const CARD_NAME = "roborock-vacuum-card";
const EDITOR_NAME = "roborock-vacuum-card-editor";
const CARD_VERSION = "0.7.0.3";
/** Hold duration in ms required to trigger START / PAUSE actions */
const HOLD_DURATION_MS = 600;
/**
 * Maps Roborock status strings to [human-readable label, accent colour].
 * This unified map covers S6 / S7 / S8 MaxV Ultra.
 */
const STATUS_MAP = {
    // ── Dry cleaning ──────────────────────────────────────────────────────
    cleaning: ["🧹 Cleaning", "#52c41a"],
    segment_cleaning: ["🧹 Cleaning rooms", "#52c41a"],
    zoned_cleaning: ["🧹 Zone cleaning", "#52c41a"],
    spot_cleaning: ["🎯 Spot cleaning", "#52c41a"],
    starting: ["▶️ Starting", "#52c41a"],
    // ── Wet / mop ────────────────────────────────────────────────────────
    segment_mopping: ["🫧 Mopping rooms", "#40a9ff"],
    zoned_mopping: ["🫧 Zone mopping", "#40a9ff"],
    robot_status_mopping: ["🫧 Mopping", "#40a9ff"],
    // ── Combined dry + wet ───────────────────────────────────────────────
    clean_mop_cleaning: ["🧹🫧 Vacuuming+mopping", "#52c41a"],
    clean_mop_mopping: ["🧹🫧 Vacuuming+mopping", "#52c41a"],
    segment_clean_mop_cleaning: ["🧹🫧 Rooms (vac)", "#52c41a"],
    segment_clean_mop_mopping: ["🧹🫧 Rooms (mop)", "#52c41a"],
    zoned_clean_mop_cleaning: ["🧹🫧 Zones (vac)", "#52c41a"],
    zoned_clean_mop_mopping: ["🧹🫧 Zones (mop)", "#52c41a"],
    // ── Mop washing ──────────────────────────────────────────────────────
    washing_the_mop: ["🚿 Washing mop", "#9254de"],
    washing_the_mop_2: ["🚿 Washing mop", "#9254de"],
    going_to_wash_the_mop: ["🚿 Going to wash mop", "#9254de"],
    air_drying_stopping: ["💨 Drying mop", "#9254de"],
    back_to_dock_washing_duster: ["🏠 Dock + washing", "#faad14"],
    // ── Navigation ───────────────────────────────────────────────────────
    returning_home: ["🏠 Returning home", "#faad14"],
    docking: ["🏠 Docking", "#faad14"],
    going_to_target: ["🎯 Going to target", "#40a9ff"],
    // ── Docked / idle ────────────────────────────────────────────────────
    charging: ["⚡ Charging", "rgba(255,255,255,0.75)"],
    charging_complete: ["✅ Fully charged", "#52c41a"],
    docked: ["✅ Docked", "rgba(255,255,255,0.75)"],
    charger_disconnected: ["🔌 Charger disconnected", "#faad14"],
    emptying_the_bin: ["🗑️ Emptying bin", "#faad14"],
    idle: ["💤 Idle", "rgba(255,255,255,0.45)"],
    paused: ["⏸️ Paused", "#faad14"],
    // ── Special ──────────────────────────────────────────────────────────
    mapping: ["🗺️ Mapping", "#40a9ff"],
    remote_control_active: ["🕹️ Remote control", "#40a9ff"],
    manual_mode: ["🕹️ Manual mode", "#40a9ff"],
    updating: ["⬆️ Updating", "#faad14"],
    in_call: ["📞 In call", "#faad14"],
    shutting_down: ["⏹️ Shutting down", "rgba(255,255,255,0.4)"],
    // ── Error states ─────────────────────────────────────────────────────
    error: ["❌ Error", "#ff4d4f"],
    charging_problem: ["⚠️ Charging problem", "#ff4d4f"],
    locked: ["🔒 Locked", "#ff4d4f"],
    device_offline: ["📴 Offline", "#ff4d4f"],
};
/** Colour hex values for VacuumColor variants */
const COLOR_HEX = {
    green: "#52c41a",
    blue: "#2196F3",
    orange: "#faad14",
};
/** rgba versions with reduced opacity for backgrounds */
const COLOR_BG = {
    green: "rgba(46,204,113,0.18)",
    blue: "rgba(33,150,243,0.18)",
    orange: "rgba(250,173,20,0.18)",
};
const COLOR_BG_ACTIVE = {
    green: "rgba(46,204,113,0.30)",
    blue: "rgba(33,150,243,0.30)",
    orange: "rgba(250,173,20,0.30)",
};
/** Vacuum entity states that count as "actively cleaning" */
const CLEANING_STATES = new Set([
    "cleaning",
    "segment_cleaning",
    "zoned_cleaning",
    "spot_cleaning",
    "segment_mopping",
    "zoned_mopping",
    "robot_status_mopping",
    "clean_mop_cleaning",
    "clean_mop_mopping",
    "segment_clean_mop_cleaning",
    "segment_clean_mop_mopping",
    "zoned_clean_mop_cleaning",
    "zoned_clean_mop_mopping",
]);

var _a;
console.info(`%c ROBOROCK-VACUUM-CARD %c v${CARD_VERSION} `, "background:#2196F3;color:#fff;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px", "background:#1a1a1a;color:#fff;font-weight:400;padding:2px 4px;border-radius:0 3px 3px 0");
let RoborockVacuumCard = class RoborockVacuumCard extends i$2 {
    constructor() {
        super(...arguments);
        this._shownSet = new Set([0]);
        /** ID of the button currently being held — drives the fill animation */
        this._holdId = null;
        /** Výběr místností — drží se lokálně v kartě (bez potřeby input_boolean helper entity) */
        this._localRoomSel = new Map();
        /** Aktivní úklidy — sledování průběhu pro vyhodnocení úspěchu */
        this._inFlight = new Map();
        this._prevVacStates = new Map();
        this._prevRoomStates = new Map();
        this._holdTimer = null;
        this._holdEnd = () => {
            this._cancelHold();
        };
    }
    // ── Lovelace card API ───────────────────────────────────────────────────
    static getConfigElement() {
        return document.createElement(EDITOR_NAME);
    }
    static getStubConfig() {
        return {
            type: `custom:${CARD_NAME}`,
            vacuums: [
                {
                    entity: "vacuum.my_roborock",
                    name: "Roborock",
                    color: "green",
                    rooms: [],
                    clean_action: { type: "native" },
                },
            ],
        };
    }
    setConfig(config) {
        if (!config.vacuums || !Array.isArray(config.vacuums) || config.vacuums.length === 0) {
            throw new Error("[roborock-vacuum-card] 'vacuums' must be a non-empty array");
        }
        this._config = config;
        const valid = new Set();
        for (const i of this._shownSet) {
            if (i < config.vacuums.length)
                valid.add(i);
        }
        this._shownSet = valid.size > 0 ? valid : new Set([0]);
    }
    getCardSize() {
        return 6;
    }
    // ── Lifecycle ───────────────────────────────────────────────────────────
    disconnectedCallback() {
        super.disconnectedCallback();
        this._cancelHold();
    }
    updated(changed) {
        if (!changed.has("hass") || !this.hass || !this._config)
            return;
        for (const vac of this._config.vacuums) {
            const newState = this.hass.states[vac.entity]?.state ?? "";
            const prevState = this._prevVacStates.get(vac.entity) ?? newState;
            // Přechod do docked/charging při aktivním úklidu → vyhodnoť
            if (prevState !== newState &&
                (newState === "docked" || newState === "charging") &&
                this._inFlight.has(vac.entity)) {
                const flight = this._inFlight.get(vac.entity);
                this._inFlight.delete(vac.entity);
                this._evalCleaningComplete(vac.entity, flight);
            }
            this._prevVacStates.set(vac.entity, newState);
            // room_entered event
            if (vac.current_room_entity && this._inFlight.has(vac.entity)) {
                const newRoom = this.hass.states[vac.current_room_entity]?.state ?? "";
                const prevRoom = this._prevRoomStates.get(vac.entity) ?? "";
                if (newRoom && newRoom !== prevRoom &&
                    newRoom !== "unknown" && newRoom !== "unavailable") {
                    this._fireHAEvent({
                        action: "room_entered",
                        vacuum_entity: vac.entity,
                        vacuum_label: vac.name ?? vac.entity,
                        clean_type: this._deriveCleanType(vac),
                        room_name: newRoom,
                    });
                }
                this._prevRoomStates.set(vac.entity, newRoom);
            }
        }
    }
    // ── Helpers ─────────────────────────────────────────────────────────────
    _vac() {
        const first = [...this._shownSet][0] ?? 0;
        return this._config.vacuums[first];
    }
    _color(vac) {
        return COLOR_HEX[vac.color ?? "green"] ?? COLOR_HEX["green"];
    }
    _colorKey(vac) {
        return vac.color ?? "green";
    }
    _statusInfo(vac) {
        const raw = vac.status_entity
            ? (this.hass.states[vac.status_entity]?.state ?? "unknown")
            : (this.hass.states[vac.entity]?.state ?? "unknown");
        return STATUS_MAP[raw] ?? [raw, "rgba(255,255,255,0.5)"];
    }
    _isCleaning(vac) {
        return CLEANING_STATES.has(this.hass.states[vac.entity]?.state ?? "");
    }
    _isPaused(vac) {
        return this.hass.states[vac.entity]?.state === "paused";
    }
    _battery(vac) {
        if (!vac.battery_entity)
            return null;
        const n = parseInt(this.hass.states[vac.battery_entity]?.state ?? "");
        return isNaN(n) ? null : n;
    }
    _lastCleanStr(vac) {
        const raw = vac.last_clean_entity
            ? this.hass.states[vac.last_clean_entity]?.state
            : undefined;
        if (!raw || raw === "unavailable" || raw === "unknown")
            return "—";
        const d = new Date(raw);
        const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
        const t = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        if (diff === 0)
            return "Today · " + t;
        if (diff === 1)
            return "Yesterday · " + t;
        return d.toLocaleDateString([], { day: "2-digit", month: "2-digit" }) + " · " + t;
    }
    _progress(vac) {
        if (!vac.progress_entity)
            return null;
        const n = parseInt(this.hass.states[vac.progress_entity]?.state ?? "");
        return isNaN(n) || n === 0 ? null : n;
    }
    _isRoomSelected(room, vac) {
        return this._localRoomSel.get(vac.entity + ":" + room.key) ?? false;
    }
    _hasSelectedRooms(vac) {
        return (vac.rooms ?? []).some((r) => this._isRoomSelected(r, vac));
    }
    _totalCleanMins(vac) {
        return (vac.rooms ?? []).reduce((sum, r) => {
            if (!this._isRoomSelected(r, vac) || !r.clean_time_mins)
                return sum;
            return sum + r.clean_time_mins;
        }, 0);
    }
    _roomAgeDays(room) {
        if (!room.last_clean_entity)
            return null;
        const raw = this.hass.states[room.last_clean_entity]?.state;
        if (!raw || raw === "unavailable" || raw === "unknown")
            return null;
        return (Date.now() - new Date(raw).getTime()) / 86400000;
    }
    _roomBorderColor(room, vac) {
        const d = this._roomAgeDays(room);
        if (d === null)
            return "rgba(255,77,77,0.85)";
        const ths = this._config.room_thresholds ?? [
            { days: 2, color: "rgba(46,204,113,0.85)" },
            { days: 5, color: "rgba(250,173,20,0.85)" },
            { days: 10, color: "rgba(255,152,0,0.85)" },
        ];
        const sorted = [...ths].sort((a, b) => a.days - b.days);
        for (const th of sorted) {
            if (d <= th.days)
                return th.color;
        }
        return "rgba(255,77,77,0.85)";
    }
    _batIcon(pct) {
        if (pct > 80)
            return "mdi:battery";
        if (pct > 50)
            return "mdi:battery-60";
        if (pct > 20)
            return "mdi:battery-30";
        return "mdi:battery-10";
    }
    _batColor(pct) {
        if (pct > 50)
            return "#52c41a";
        if (pct > 20)
            return "#faad14";
        return "#ff4d4f";
    }
    _mapUrl(entity) {
        const state = this.hass.states[entity];
        if (!state)
            return "";
        const pic = state.attributes["entity_picture"];
        if (!pic)
            return "";
        const ts = new Date(state.last_updated).getTime();
        const sep = pic.includes("?") ? "&" : "?";
        return this.hass.hassUrl(pic + sep + "_t=" + ts);
    }
    _timeStr(mins) {
        if (mins <= 0)
            return "";
        if (mins >= 60)
            return "~" + Math.floor(mins / 60) + " h " + Math.round(mins % 60) + " min";
        return "~" + Math.round(mins) + " min";
    }
    // ── Global action helpers ───────────────────────────────────────────────
    /** True if any watched entity is in a cleaning state */
    _isGlobalActive(ga) {
        return (ga.watch_entities ?? []).some((e) => CLEANING_STATES.has(this.hass.states[e]?.state ?? ""));
    }
    async _triggerGlobal(ga) {
        const action = ga.action;
        try {
            if (action.type === "script") {
                await this.hass.callService("script", "turn_on", {
                    entity_id: action.entity_id,
                    variables: action.variables ?? {},
                });
            }
            else {
                const [domain, svc] = action.service.split(".");
                await this.hass.callService(domain, svc, action.data ?? {});
            }
        }
        catch (err) {
            console.error("[roborock-vacuum-card] global action failed:", err);
        }
    }
    // ── Hold-action helpers ─────────────────────────────────────────────────
    _cancelHold() {
        if (this._holdTimer !== null) {
            clearTimeout(this._holdTimer);
            this._holdTimer = null;
        }
        this._holdId = null;
    }
    /**
     * Returns a pointerdown handler that:
     *  1. Sets _holdId to `id` (triggers fill animation)
     *  2. Fires `action` after HOLD_DURATION_MS
     */
    _holdStart(id, action) {
        return (e) => {
            e.preventDefault();
            this._cancelHold();
            this._holdId = id;
            this._holdTimer = setTimeout(() => {
                this._holdTimer = null;
                this._holdId = null;
                action();
            }, HOLD_DURATION_MS);
        };
    }
    _toggleShown(index) {
        const next = new Set(this._shownSet);
        if (next.has(index)) {
            if (next.size > 1)
                next.delete(index);
        }
        else {
            next.add(index);
        }
        this._shownSet = next;
    }
    // ── Service calls ───────────────────────────────────────────────────────
    async _call(domain, service, data) {
        try {
            await this.hass.callService(domain, service, data);
        }
        catch (err) {
            console.error("[roborock-vacuum-card] " + domain + "." + service + " failed:", err);
        }
    }
    _fireMoreInfo(entityId) {
        this.dispatchEvent(new CustomEvent("hass-more-info", {
            bubbles: true, composed: true, detail: { entityId },
        }));
    }
    _deriveCleanType(vac) {
        if (vac.clean_action?.type === "native") {
            const na = vac.clean_action;
            if (na.mop_mode_entity || na.mop_intensity_entity)
                return "wet";
        }
        return "dry";
    }
    _fireHAEvent(data) {
        try {
            this.hass.connection.sendMessage({
                type: "fire_event",
                event_type: "roborock_card_event",
                event_data: data,
            });
        }
        catch (err) {
            console.error("[roborock-vacuum-card] fire_event failed:", err);
        }
    }
    async _evalCleaningComplete(vacEntity, flight) {
        const actualMs = Date.now() - flight.startTime;
        const actualMins = Math.round(actualMs / 60000);
        const success = flight.expectedMs === 0 || actualMs >= flight.expectedMs * 0.5;
        if (success) {
            const dt = new Date().toISOString().replace("T", " ").slice(0, 19);
            for (const room of flight.rooms) {
                if (room.last_clean_entity) {
                    await this._call("input_datetime", "set_datetime", {
                        entity_id: room.last_clean_entity,
                        datetime: dt,
                    });
                }
            }
        }
        this._fireHAEvent({
            action: "cleaning_finished",
            vacuum_entity: vacEntity,
            vacuum_label: flight.vacLabel,
            clean_type: flight.cleanType,
            rooms: flight.rooms.map(r => r.key),
            room_labels: flight.rooms.map(r => r.name).join(", "),
            estimated_mins: Math.round(flight.expectedMs / 60000),
            actual_mins: actualMins,
            success,
        });
    }
    _pause(vac) {
        this._call("vacuum", "pause", { entity_id: vac.entity });
    }
    _resume(vac) {
        this._call("vacuum", "start", { entity_id: vac.entity });
    }
    _dock(vac) {
        this._call("vacuum", "return_to_base", { entity_id: vac.entity });
    }
    _toggleRoom(room, vac) {
        const k = vac.entity + ":" + room.key;
        const next = new Map(this._localRoomSel);
        next.set(k, !(next.get(k) ?? false));
        this._localRoomSel = next;
    }
    async _startClean(vac) {
        if (!vac.clean_action)
            return;
        const selected = (vac.rooms ?? []).filter((r) => this._isRoomSelected(r, vac));
        if (selected.length === 0)
            return;
        if (vac.clean_action.type === "script") {
            const action = vac.clean_action;
            const variables = {};
            for (const [key, template] of Object.entries(action.variables ?? {})) {
                variables[key] = template
                    .replace("{{ entity }}", vac.entity)
                    .replace("{{ selected_segments }}", JSON.stringify(selected.map((r) => r.segment_id).filter(Boolean)))
                    .replace("{{ selected_room_keys }}", JSON.stringify(selected.map((r) => r.key)))
                    .replace("{{ selected_area_ids }}", JSON.stringify(selected.map((r) => r.area_id).filter(Boolean)));
            }
            await this._call("script", "turn_on", { entity_id: action.entity_id, variables });
            return;
        }
        const action = vac.clean_action;
        if (action.mop_mode_entity && action.mop_mode) {
            await this._call("select", "select_option", { entity_id: action.mop_mode_entity, option: action.mop_mode });
        }
        if (action.mop_intensity_entity && action.mop_intensity) {
            await this._call("select", "select_option", { entity_id: action.mop_intensity_entity, option: action.mop_intensity });
        }
        if (action.suction_level) {
            await this._call("vacuum", "set_fan_speed", { entity_id: vac.entity, fan_speed: action.suction_level });
        }
        const segments = selected.map((r) => r.segment_id).filter((id) => id !== undefined);
        await this._call("vacuum", "send_command", {
            entity_id: vac.entity,
            command: "app_segment_clean",
            params: [{ segments, repeat: action.repeat ?? 1 }],
        });
        // Zaregistruj in-flight + vystřel event
        const totalMins = this._totalCleanMins(vac);
        const vacLabel = vac.name ?? vac.entity.split(".")[1] ?? vac.entity;
        this._inFlight.set(vac.entity, {
            rooms: selected.map(r => ({ key: r.key, name: r.name, last_clean_entity: r.last_clean_entity })),
            expectedMs: totalMins * 60000,
            startTime: Date.now(),
            vacLabel,
            cleanType: this._deriveCleanType(vac),
        });
        this._fireHAEvent({
            action: "cleaning_started",
            vacuum_entity: vac.entity,
            vacuum_label: vacLabel,
            clean_type: this._deriveCleanType(vac),
            rooms: selected.map(r => r.key),
            room_labels: selected.map(r => r.name).join(", "),
            estimated_mins: Math.round(totalMins),
        });
    }
    // ── Render: badges ──────────────────────────────────────────────────────
    _renderBadge(vac, index) {
        const active = this._shownSet.has(index);
        const cleaning = this._isCleaning(vac);
        const color = this._color(vac);
        const ck = this._colorKey(vac);
        const name = vac.name ?? vac.entity.split(".")[1] ?? vac.entity;
        const holding = this._holdId === "badge-" + index;
        const bg = cleaning ? COLOR_BG_ACTIVE[ck] : active ? COLOR_BG[ck] : "rgba(30,30,30,0.85)";
        const border = cleaning
            ? "3px solid " + color
            : active
                ? "2px solid " + color + "80"
                : "2px solid rgba(255,255,255,0.18)";
        const shadow = cleaning
            ? "0 0 18px " + color + "B0"
            : active
                ? "0 0 8px " + color + "50"
                : "none";
        return b `
      <button
        class="badge ${holding ? "badge--holding" : ""}"
        style=${o({ background: bg, border, boxShadow: shadow })}
        @pointerdown=${(e) => {
            e.preventDefault();
            this._cancelHold();
            this._holdId = "badge-" + index;
            this._holdTimer = setTimeout(() => {
                this._holdTimer = null;
                this._holdId = null;
                this._toggleShown(index);
            }, HOLD_DURATION_MS);
        }}
        @pointerup=${() => {
            if (this._holdTimer !== null) {
                this._cancelHold();
                this._shownSet = new Set([index]);
            }
            else {
                this._holdId = null;
            }
        }}
        @pointerleave=${this._holdEnd}
        @pointercancel=${this._holdEnd}
        aria-pressed=${active ? "true" : "false"}
        aria-label=${name}
      >
        <div class="hold-ring"></div>
        ${vac.image
            ? b `<img class="badge-img" src=${vac.image} alt=${name} />`
            : b `<ha-icon class="badge-icon" icon="mdi:robot-vacuum" style=${o({ color })}></ha-icon>`}
        <span class="badge-name" style=${o({ color: active ? "white" : "rgba(255,255,255,0.55)" })}>
          ${name}
        </span>
      </button>
    `;
    }
    _renderGlobalBadge(ga, idx) {
        const active = this._isGlobalActive(ga);
        const color = COLOR_HEX[ga.color ?? "orange"];
        const ck = ga.color ?? "orange";
        const holdId = "global-" + idx;
        const holding = this._holdId === holdId;
        const bg = active ? COLOR_BG_ACTIVE[ck] : "rgba(30,30,30,0.85)";
        const border = active ? "3px solid " + color : "2px solid rgba(255,255,255,0.18)";
        const shadow = active ? "0 0 18px " + color + "B0" : "none";
        return b `
      <button
        class="badge badge--global ${holding ? "badge--holding" : ""}"
        style=${o({ background: bg, border, boxShadow: shadow })}
        @pointerdown=${this._holdStart(holdId, () => this._triggerGlobal(ga))}
        @pointerup=${this._holdEnd}
        @pointerleave=${this._holdEnd}
        @pointercancel=${this._holdEnd}
        aria-label=${ga.name}
        title=${"Hold to trigger: " + ga.name}
      >
        <div class="hold-ring"></div>
        ${ga.image
            ? b `<img class="badge-img" src=${ga.image} alt=${ga.name} />`
            : b `<ha-icon class="badge-icon" icon="mdi:home-floor-a" style=${o({ color })}></ha-icon>`}
        <span class="badge-name" style=${o({ color: active ? "white" : "rgba(255,255,255,0.55)" })}>
          ${ga.name}
        </span>
      </button>
    `;
    }
    // ── Render: map ─────────────────────────────────────────────────────────
    _renderMap(vac) {
        if (!vac.map)
            return A;
        const { entity, rotation = 0, scale = 100, offset_x = 0, offset_y = 0 } = vac.map;
        const url = this._mapUrl(entity);
        if (!url)
            return A;
        return b `
      <div class="map-wrap">
        <img
          class="map-img"
          src=${url}
          alt="Vacuum map"
          style=${o({
            left: (50 + offset_x) + "%",
            top: (50 + offset_y) + "%",
            width: scale + "%",
            transform: "translate(-50%,-50%) rotate(" + rotation + "deg)",
        })}
        />
        ${(vac.rooms ?? []).map((r) => this._renderRoomOverlay(r, vac))}
      </div>
    `;
    }
    _renderRoomOverlay(room, vac) {
        const selected = this._isRoomSelected(room, vac);
        const color = this._color(vac);
        const ageColor = this._roomBorderColor(room, vac);
        const anchor = room.icon_anchor ?? "c";
        if (room.map_w !== undefined && room.map_h !== undefined) {
            // ── Rectangle mód ──────────────────────────────────────────
            const ANCHOR = {
                tl: ["flex-start", "flex-start"], t: ["center", "flex-start"], tr: ["flex-end", "flex-start"],
                l: ["flex-start", "center"], c: ["center", "center"], r: ["flex-end", "center"],
                bl: ["flex-start", "flex-end"], b: ["center", "flex-end"], br: ["flex-end", "flex-end"],
            };
            const [jc, ai] = ANCHOR[anchor] ?? ["center", "center"];
            const borderW = (selected
                ? (this._config.room_border_selected ?? 4)
                : (this._config.room_border_normal ?? 2)) + "px";
            const borderC = selected ? color + "E0" : ageColor;
            const bg = selected ? color + "44" : "rgba(0,0,0,0.06)";
            const shadow = selected ? "0 0 18px " + color + "60" : "none";
            return b `
        <button
          class="room-overlay"
          style=${o({
                left: room.map_x + "%", top: room.map_y + "%",
                width: room.map_w + "%", height: room.map_h + "%",
                border: borderW + " solid " + borderC,
                background: bg, boxShadow: shadow,
                justifyContent: jc, alignItems: ai,
            })}
          @click=${() => this._toggleRoom(room, vac)}
          title=${room.name} aria-label=${room.name}
          aria-pressed=${selected ? "true" : "false"}
        >
          ${anchor !== "none" && room.icon ? b `
            <ha-icon icon=${room.icon}
              style=${o({ color: selected ? "white" : ageColor, "--mdc-icon-size": "16px" })}>
            </ha-icon>
          ` : A}
        </button>
      `;
        }
        // ── Point mód (legacy) ──────────────────────────────────────
        const bg = selected ? color + "A8" : "rgba(0,0,0,0.55)";
        const shadow = selected ? "0 0 12px " + color + "80" : "none";
        return b `
      <button
        class="room-btn"
        style=${o({
            left: room.map_x + "%", top: room.map_y + "%",
            background: bg,
            border: "4px solid " + ageColor,
            boxShadow: shadow,
        })}
        @click=${() => this._toggleRoom(room, vac)}
        title=${room.name} aria-label=${room.name}
        aria-pressed=${selected ? "true" : "false"}
      >
        <ha-icon icon=${room.icon || "mdi:square"}
          style=${o({ color: selected ? "white" : "rgba(255,255,255,0.5)" })}>
        </ha-icon>
      </button>
    `;
    }
    // ── Render: status card ─────────────────────────────────────────────────
    _renderStatusRow(vac) {
        const [label, labelColor] = this._statusInfo(vac);
        const bat = this._battery(vac);
        const lastClean = this._lastCleanStr(vac);
        // Current room
        const roomState = vac.current_room_entity
            ? this.hass.states[vac.current_room_entity]?.state
            : null;
        const currentRoom = roomState && roomState !== "unknown" && roomState !== "unavailable"
            ? roomState : null;
        // Error
        const errState = vac.error_entity
            ? this.hass.states[vac.error_entity]?.state
            : null;
        const hasError = errState && errState !== "none" && errState !== "unknown" && errState !== "unavailable";
        return b `
      ${hasError ? b `
        <div class="error-row">
          <ha-icon icon="mdi:alert-circle" style="color:#ff4d4f"></ha-icon>
          <span style="color:#ff4d4f;font-size:12px;font-weight:600">${errState}</span>
        </div>
      ` : A}
      <div class="status-row">
        <div class="status-main">
          <span class="status-label" style=${o({ color: labelColor })}>${label}</span>
          ${currentRoom ? b `
            <span class="current-room">
              <ha-icon icon="mdi:map-marker" style="--mdc-icon-size:13px;color:rgba(255,255,255,0.4)"></ha-icon>
              ${currentRoom}
            </span>
          ` : A}
        </div>
        <div class="status-meta">
          ${bat !== null ? b `
            <div class="battery">
              <span style=${o({ color: this._batColor(bat) })}>${bat}&thinsp;%</span>
              <ha-icon icon=${this._batIcon(bat)} style=${o({ color: this._batColor(bat) })}></ha-icon>
            </div>
          ` : A}
          <div class="last-clean">
            <span>${lastClean}</span>
            <ha-icon icon="mdi:history"></ha-icon>
          </div>
        </div>
      </div>
    `;
    }
    _renderProgress(vac) {
        const prog = this._progress(vac);
        if (prog === null)
            return A;
        const color = this._color(vac);
        return b `
      <div class="progress">
        <div class="progress-track">
          <div class="progress-fill" style=${o({ width: prog + "%", background: color })}></div>
        </div>
        <span class="progress-label" style=${o({ color })}>${prog}&thinsp;%</span>
      </div>
    `;
    }
    _renderActions(vac, vacIdx) {
        const cleaning = this._isCleaning(vac);
        const paused = this._isPaused(vac);
        const hasRooms = this._hasSelectedRooms(vac);
        const color = this._color(vac);
        const ck = this._colorKey(vac);
        const mins = this._totalCleanMins(vac);
        const timeStr = this._timeStr(mins);
        if (paused) {
            const hId = "resume-" + vacIdx;
            return b `
        <div class="actions">
          <button
            class="action-btn ${this._holdId === hId ? "action-btn--holding" : ""}"
            style=${o({ background: COLOR_BG[ck], border: "1px solid " + color + "80" })}
            @pointerdown=${this._holdStart(hId, () => this._resume(vac))}
            @pointerup=${this._holdEnd}
            @pointerleave=${this._holdEnd}
            @pointercancel=${this._holdEnd}
          >
            <div class="hold-ring"></div>
            <ha-icon icon="mdi:play" style=${o({ color })}></ha-icon>
            <span>Resume</span>
          </button>
          <button
            class="action-btn action-btn--secondary"
            @click=${() => this._dock(vac)}
          >
            <ha-icon icon="mdi:home" style="color:rgba(64,169,255,0.6)"></ha-icon>
            <span>Dock</span>
          </button>
        </div>
      `;
        }
        if (cleaning) {
            const hId = "pause-" + vacIdx;
            return b `
        <div class="actions">
          <button
            class="action-btn action-btn--warn ${this._holdId === hId ? "action-btn--holding" : ""}"
            @pointerdown=${this._holdStart(hId, () => this._pause(vac))}
            @pointerup=${this._holdEnd}
            @pointerleave=${this._holdEnd}
            @pointercancel=${this._holdEnd}
          >
            <div class="hold-ring"></div>
            <ha-icon icon="mdi:pause" style="color:#faad14"></ha-icon>
            <span>Pause</span>
          </button>
        </div>
      `;
        }
        const hId = "start-" + vacIdx;
        const startBg = hasRooms ? COLOR_BG[ck] : "rgba(60,60,60,0.4)";
        const startBorder = hasRooms ? "1px solid " + color + "80" : "1px solid rgba(255,255,255,0.1)";
        const startIconColor = hasRooms ? color : "rgba(255,255,255,0.2)";
        const startTextColor = hasRooms ? "white" : "rgba(255,255,255,0.25)";
        return b `
      <div class="actions">
        <button
          class="action-btn ${hasRooms && this._holdId === hId ? "action-btn--holding" : ""}"
          style=${o({ background: startBg, border: startBorder })}
          ?disabled=${!hasRooms}
          @pointerdown=${hasRooms ? this._holdStart(hId, () => this._startClean(vac)) : A}
          @pointerup=${this._holdEnd}
          @pointerleave=${this._holdEnd}
          @pointercancel=${this._holdEnd}
        >
          <div class="hold-ring"></div>
          <ha-icon icon="mdi:rocket-launch" style=${o({ color: startIconColor })}></ha-icon>
          <div class="start-body">
            <span style=${o({ color: startTextColor })}>START</span>
            ${(vac.rooms ?? []).length > 0 ? b `
              <div class="room-icons">
                ${(vac.rooms ?? []).map(r => b `
                  <ha-icon
                    icon=${r.icon || "mdi:square"}
                    style=${o({ color: this._isRoomSelected(r, vac) ? color : "rgba(255,255,255,0.15)" })}
                  ></ha-icon>
                `)}
              </div>
            ` : A}
            ${timeStr ? b `<small style="color:rgba(255,255,255,0.4)">${timeStr}</small>` : A}
          </div>
        </button>
      </div>
    `;
    }
    _renderStatusCard(vac, vacIdx) {
        const cleaning = this._isCleaning(vac);
        const color = this._color(vac);
        const name = vac.name ?? vac.entity.split(".")[1] ?? vac.entity;
        const cardBorder = cleaning ? "2px solid " + color : "1px solid rgba(255,255,255,0.08)";
        const cardShadow = cleaning ? "0 0 22px " + color + "40" : "none";
        const imgFilter = cleaning
            ? "drop-shadow(0 0 20px " + color + "D8)"
            : "drop-shadow(0 4px 12px " + color + "33)";
        return b `
      <div class="status-card" style=${o({ border: cardBorder, boxShadow: cardShadow })}>
        <div class="status-left" style="cursor:pointer"
          @click=${() => this._fireMoreInfo(vac.entity)}
          title="Open ${name} info">
          <div class="model-label">${name}</div>
          ${vac.image ? b `
            <img class="vac-img" src=${vac.image} alt=${name}
              style=${o({ opacity: cleaning ? "0.9" : "0.6", filter: imgFilter })}
            />
          ` : b `
            <ha-icon icon="mdi:robot-vacuum"
              style=${o({ color, fontSize: "80px", opacity: cleaning ? "0.9" : "0.5" })}
            ></ha-icon>
          `}
        </div>
        <div class="status-right">
          ${this._renderStatusRow(vac)}
          ${this._renderProgress(vac)}
          ${this._renderActions(vac, vacIdx)}
        </div>
      </div>
    `;
    }
    // ── Main render ─────────────────────────────────────────────────────────
    render() {
        if (!this._config || !this.hass)
            return A;
        return b `
      <ha-card>
        <div class="badges-row">
          ${this._config.vacuums.map((v, i) => this._renderBadge(v, i))}
          ${(this._config.global_actions ?? []).map((ga, i) => this._renderGlobalBadge(ga, i))}
        </div>
        ${[...this._shownSet]
            .filter(i => i < this._config.vacuums.length)
            .map(i => b `
            ${this._renderMap(this._config.vacuums[i])}
            ${this._renderStatusCard(this._config.vacuums[i], i)}
          `)}
      </ha-card>
    `;
    }
};
// ── Styles ──────────────────────────────────────────────────────────────
RoborockVacuumCard.styles = i$5 `
    ha-card {
      background: transparent;
      border: none;
      box-shadow: none;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* ── Badges ──────────────────────────────────────────────────────── */
    .badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .badge {
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 18px 6px 6px;
      border-radius: 99px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: background 0.3s, border 0.3s, box-shadow 0.3s;
    }

    .badge-img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }

    .badge-icon {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
    }

    .badge-name {
      font-size: 15px;
      font-weight: 700;
      white-space: nowrap;
      transition: color 0.3s;
      position: relative;
      z-index: 1;
    }

    /* ── Hold ring (shared by badges and action buttons) ─────────────── */
    .hold-ring {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: rgba(255, 255, 255, 0.18);
      transform: scaleX(0);
      transform-origin: left;
      pointer-events: none;
      z-index: 0;
    }

    .action-btn--holding .hold-ring,
    .badge--holding .hold-ring {
      animation: hold-fill var(--hold-ms) linear forwards;
    }

    @keyframes hold-fill {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }

    /* ── Map ─────────────────────────────────────────────────────────── */
    .map-wrap {
      position: relative;
      width: 100%;
      padding-top: 27.5%;
      overflow: hidden;
      border-radius: 12px;
    }

    .map-img {
      position: absolute;
      transform-origin: center center;
      object-fit: cover;
    }

    /* ── Room buttons ────────────────────────────────────────────────── */
    .room-btn {
      position: absolute;
      width: 46px;
      height: 46px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
      transition: background 0.2s, box-shadow 0.2s;
    }

    .room-btn ha-icon {
      --mdc-icon-size: 22px;
    }

    .room-overlay {
      position: absolute;
      transform: translate(-50%, -50%);
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      padding: 3px;
      transition: background 0.2s, border 0.3s, box-shadow 0.3s;
    }

    /* ── Status card ─────────────────────────────────────────────────── */
    .status-card {
      display: grid;
      grid-template-columns: 150px 1fr;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-radius: 20px;
      overflow: hidden;
      transition: border 0.4s, box-shadow 0.4s;
    }

    .status-left {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 4px 0 0;
    }

    .model-label {
      font-size: 10px;
      letter-spacing: 3px;
      color: rgba(255, 255, 255, 0.3);
      text-transform: uppercase;
      text-align: center;
      margin-bottom: -10px;
    }

    .vac-img {
      width: 110%;
      margin-bottom: -15px;
      object-fit: contain;
      display: block;
      transition: opacity 0.5s, filter 0.5s;
    }

    .status-right {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* ── Status row ──────────────────────────────────────────────────── */
    .status-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 8px 12px 4px 16px;
    }

    .error-row {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 12px 0 16px; animation: pulse-error 2s ease-in-out infinite;
    }
    @keyframes pulse-error { 0%,100% { opacity:1; } 50% { opacity:0.6; } }

    .status-main { display: flex; flex-direction: column; gap: 2px; }
    .status-label { font-size: 20px; font-weight: 700; }
    .current-room { display: flex; align-items: center; gap: 3px; font-size: 11px; color: rgba(255,255,255,0.45); }

    .status-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;
      flex-shrink: 0;
    }

    .battery { display: flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; }
    .battery ha-icon { --mdc-icon-size: 15px; }

    .last-clean {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: rgba(255, 255, 255, 0.45);
    }
    .last-clean ha-icon { --mdc-icon-size: 12px; color: rgba(255, 255, 255, 0.25); }

    /* ── Progress bar ────────────────────────────────────────────────── */
    .progress { display: flex; align-items: center; gap: 8px; padding: 0 16px 4px; }
    .progress-track {
      flex: 1; height: 3px;
      background: rgba(255, 255, 255, 0.08); border-radius: 2px; overflow: hidden;
    }
    .progress-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
    .progress-label { font-size: 11px; font-weight: 600; flex-shrink: 0; }

    /* ── Action buttons ──────────────────────────────────────────────── */
    .actions { display: flex; gap: 8px; padding: 0 12px 14px; }

    .action-btn {
      position: relative;
      overflow: hidden;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 14px;
      cursor: pointer;
      transition: opacity 0.2s;
      font-family: inherit;
    }

    .action-btn:disabled { cursor: default; opacity: 0.7; }

    .action-btn ha-icon { --mdc-icon-size: 22px; flex-shrink: 0; position: relative; z-index: 1; }
    .action-btn span { font-size: 14px; font-weight: 700; color: white; position: relative; z-index: 1; }

    .action-btn--secondary {
      background: rgba(64, 169, 255, 0.08);
      border: 1px solid rgba(64, 169, 255, 0.2) !important;
    }

    .action-btn--warn {
      background: rgba(250, 173, 20, 0.18);
      border: 1px solid rgba(250, 173, 20, 0.5) !important;
    }

    /* ── Start button body ───────────────────────────────────────────── */
    .start-body {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      position: relative;
      z-index: 1;
    }

    .start-body small { font-size: 10px; }

    .room-icons {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 1px;
    }

    .room-icons ha-icon { --mdc-icon-size: 14px; }
  `;
__decorate([
    n$1({ attribute: false })
], RoborockVacuumCard.prototype, "hass", void 0);
__decorate([
    r()
], RoborockVacuumCard.prototype, "_config", void 0);
__decorate([
    r()
], RoborockVacuumCard.prototype, "_shownSet", void 0);
__decorate([
    r()
], RoborockVacuumCard.prototype, "_holdId", void 0);
__decorate([
    r()
], RoborockVacuumCard.prototype, "_localRoomSel", void 0);
RoborockVacuumCard = __decorate([
    t$1(CARD_NAME)
], RoborockVacuumCard);
// Expose CSS variable for hold duration so CSS animation matches JS timer
document.documentElement.style.setProperty("--hold-ms", HOLD_DURATION_MS + "ms");
(_a = window).customCards ?? (_a.customCards = []);
window.customCards.push({
    type: CARD_NAME,
    name: "Roborock Vacuum Card",
    description: "Feature-rich card for Roborock vacuums — map, room selection, multi-vacuum tabs, global actions.",
    preview: false,
    documentationURL: "https://github.com/Michailjovic/Vacuum-card",
});

// ── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_VACUUM = {
    entity: "", name: "", color: "green", rooms: [],
    clean_action: { type: "native" },
};
const DEFAULT_ROOM = {
    key: "", name: "", icon: "mdi:square", map_x: 50, map_y: 50,
};
const DEFAULT_MAP = {
    entity: "", rotation: 0, scale: 100, offset_x: 0, offset_y: 0,
};
const DEFAULT_GLOBAL = {
    name: "Whole flat", color: "orange",
    watch_entities: [],
    action: { type: "script", entity_id: "" },
};
const DEFAULT_THRESHOLDS = [
    { days: 2, color: "#52c41a" },
    { days: 5, color: "#faad14" },
    { days: 10, color: "#ff4d4f" },
];
// ── Editor ───────────────────────────────────────────────────────────────────
let RoborockVacuumCardEditor = class RoborockVacuumCardEditor extends i$2 {
    constructor() {
        super(...arguments);
        // ── Navigation state ──────────────────────────────────────────────────────
        this._tab = "vacuums";
        // Accordion open state — always create new instances to trigger Lit reactivity
        this._openVac = new Set();
        this._openSensors = new Set();
        this._openAction = new Set();
        this._openGlobal = new Set();
        // Per-vacuum: which roomIdx is open (null = none)
        this._openRoom = new Map();
        // Maps tab state
        this._mapVac = 0;
        this._mapRoom = null;
    }
    setConfig(config) {
        this._config = config;
    }
    updated(changed) {
        if (changed.has("hass") && this.hass) {
            const dl = this.shadowRoot?.getElementById("ha-entities");
            if (dl && !dl.options.length) {
                dl.innerHTML = Object.keys(this.hass.states).sort()
                    .map(id => "<option value=\"" + id + "\">")
                    .join("");
            }
        }
    }
    // ── Config helpers ────────────────────────────────────────────────────────
    _fire(config) {
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config }, bubbles: true, composed: true,
        }));
    }
    _setConfig(updates) {
        const next = { ...this._config, ...updates };
        this._config = next;
        this._fire(next);
    }
    _setVacuum(idx, updates) {
        const vacuums = [...this._config.vacuums];
        vacuums[idx] = { ...vacuums[idx], ...updates };
        const next = { ...this._config, vacuums };
        this._config = next;
        this._fire(next);
    }
    _setMap(vacIdx, updates) {
        const existing = this._config.vacuums[vacIdx].map ?? { ...DEFAULT_MAP };
        this._setVacuum(vacIdx, { map: { ...existing, ...updates } });
    }
    _setRoom(vacIdx, roomIdx, updates) {
        const rooms = [...(this._config.vacuums[vacIdx].rooms ?? [])];
        rooms[roomIdx] = { ...rooms[roomIdx], ...updates };
        this._setVacuum(vacIdx, { rooms });
    }
    _setCleanAction(vacIdx, updates) {
        const existing = this._config.vacuums[vacIdx].clean_action ?? { type: "native" };
        this._setVacuum(vacIdx, { clean_action: { ...existing, ...updates } });
    }
    _setGlobal(idx, updates) {
        const global_actions = [...(this._config.global_actions ?? [])];
        global_actions[idx] = { ...global_actions[idx], ...updates };
        const next = { ...this._config, global_actions };
        this._config = next;
        this._fire(next);
    }
    _setGlobalAction(idx, updates) {
        const existing = this._config.global_actions?.[idx]?.action ?? { type: "script", entity_id: "" };
        this._setGlobal(idx, { action: { ...existing, ...updates } });
    }
    // ── List mutations ────────────────────────────────────────────────────────
    _moveVacuum(idx, dir) {
        const target = idx + dir;
        const vacuums = [...this._config.vacuums];
        if (target < 0 || target >= vacuums.length)
            return;
        [vacuums[idx], vacuums[target]] = [vacuums[target], vacuums[idx]];
        const next = { ...this._config, vacuums };
        this._config = next;
        this._fire(next);
    }
    _addVacuum() {
        const vacuums = [...this._config.vacuums, { ...DEFAULT_VACUUM }];
        const next = { ...this._config, vacuums };
        this._config = next;
        this._fire(next);
        const newIdx = vacuums.length - 1;
        this._openVac = new Set([...this._openVac, newIdx]);
    }
    _deleteVacuum(idx) {
        const vacuums = this._config.vacuums.filter((_, i) => i !== idx);
        const next = { ...this._config, vacuums };
        this._config = next;
        this._fire(next);
        const s = new Set(this._openVac);
        s.delete(idx);
        this._openVac = s;
    }
    _addRoom(vacIdx) {
        const rooms = [...(this._config.vacuums[vacIdx].rooms ?? []), { ...DEFAULT_ROOM }];
        this._setVacuum(vacIdx, { rooms });
        const m = new Map(this._openRoom);
        m.set(vacIdx, rooms.length - 1);
        this._openRoom = m;
    }
    _deleteRoom(vacIdx, roomIdx) {
        const rooms = (this._config.vacuums[vacIdx].rooms ?? []).filter((_, i) => i !== roomIdx);
        this._setVacuum(vacIdx, { rooms });
        const openIdx = this._openRoom.get(vacIdx);
        if (openIdx === roomIdx) {
            const m = new Map(this._openRoom);
            m.set(vacIdx, null);
            this._openRoom = m;
        }
        if (this._mapRoom === roomIdx)
            this._mapRoom = null;
    }
    _addGlobal() {
        const global_actions = [...(this._config.global_actions ?? []), { ...DEFAULT_GLOBAL }];
        const next = { ...this._config, global_actions };
        this._config = next;
        this._fire(next);
        const newIdx = global_actions.length - 1;
        this._openGlobal = new Set([...this._openGlobal, newIdx]);
    }
    _deleteGlobal(idx) {
        const global_actions = (this._config.global_actions ?? []).filter((_, i) => i !== idx);
        const next = { ...this._config, global_actions };
        this._config = next;
        this._fire(next);
        const s = new Set(this._openGlobal);
        s.delete(idx);
        this._openGlobal = s;
    }
    // ── Accordion toggle helpers ──────────────────────────────────────────────
    _toggleVac(idx) {
        const s = new Set(this._openVac);
        if (s.has(idx))
            s.delete(idx);
        else
            s.add(idx);
        this._openVac = s;
    }
    _toggleRoom(vacIdx, roomIdx) {
        const m = new Map(this._openRoom);
        const cur = m.get(vacIdx) ?? null;
        m.set(vacIdx, cur === roomIdx ? null : roomIdx);
        this._openRoom = m;
    }
    _toggleSensors(vacIdx) {
        const s = new Set(this._openSensors);
        if (s.has(vacIdx))
            s.delete(vacIdx);
        else
            s.add(vacIdx);
        this._openSensors = s;
    }
    _toggleAction(vacIdx) {
        const s = new Set(this._openAction);
        if (s.has(vacIdx))
            s.delete(vacIdx);
        else
            s.add(vacIdx);
        this._openAction = s;
    }
    _toggleGlobal(idx) {
        const s = new Set(this._openGlobal);
        if (s.has(idx))
            s.delete(idx);
        else
            s.add(idx);
        this._openGlobal = s;
    }
    // ── Shared field helpers ──────────────────────────────────────────────────
    _entityPicker(label, value, domains, onChange, required = false) {
        const ph = domains.length ? domains.join(" / ") : "entity_id";
        const isSingle = domains.length === 1;
        const listId = isSingle ? "ha-ents-" + domains[0] : "ha-entities";
        const filtered = isSingle
            ? Object.keys(this.hass?.states ?? {}).filter(id => id.startsWith(domains[0] + ".")).sort()
            : null;
        return b `
      ${filtered ? b `<datalist id=${listId}>${filtered.map(id => b `<option value=${id}>`)}</datalist>` : A}
      <div class="field">
        <label>${label}${required ? b `<span class="required"> *</span>` : A}</label>
        <input class="text-input" type="text" list=${listId}
          .value=${value ?? ""} placeholder=${ph}
          @input=${(e) => {
            const v = e.target.value;
            if (v === "" || this.hass.states[v])
                onChange(v);
        }} />
      </div>`;
    }
    _textField(label, value, onChange, placeholder = "") {
        return b `
      <div class="field">
        <label>${label}</label>
        <input class="text-input" type="text" .value=${value ?? ""} placeholder=${placeholder}
          @change=${(e) => onChange(e.target.value)} />
      </div>`;
    }
    _numberSlider(label, value, min, max, step, onChange, suffix = "") {
        const cur = value ?? 0;
        return b `
      <div class="field field--row">
        <label>${label}</label>
        <div class="slider-wrap">
          <input type="range" class="slider" min=${min} max=${max} step=${step} .value=${String(cur)}
            @input=${(e) => onChange(Number(e.target.value))} />
          <span class="slider-val">${cur}${suffix}</span>
        </div>
      </div>`;
    }
    _selectField(label, value, options, onChange) {
        return b `
      <div class="field field--row">
        <label>${label}</label>
        <select class="select-input" @change=${(e) => onChange(e.target.value)}>
          ${options.map(o => b `<option value=${o.value} ?selected=${o.value === value}>${o.label}</option>`)}
        </select>
      </div>`;
    }
    _optionSelectFromList(label, opts, value, onChange) {
        return b `
      <div class="field field--row">
        <label>${label}</label>
        <select class="select-input"
          @change=${(e) => onChange(e.target.value)}>
          <option value="">— none —</option>
          ${opts.map(o => b `<option value=${o} ?selected=${o === value}>${o}</option>`)}
        </select>
      </div>`;
    }
    _optionSelect(label, entity, value, onChange) {
        const opts = entity
            ? (this.hass.states[entity]?.attributes["options"] ?? [])
            : [];
        if (!opts.length)
            return this._textField(label, value, onChange, "e.g. balanced");
        return b `
      <div class="field field--row">
        <label>${label}</label>
        <select class="select-input"
          @change=${(e) => onChange(e.target.value)}>
          <option value="">— none —</option>
          ${opts.map(o => b `<option value=${o} ?selected=${o === value}>${o}</option>`)}
        </select>
      </div>`;
    }
    _iconPickerField(value, onChange) {
        return b `
      <div class="field">
        <label>Icon</label>
        <ha-icon-picker .value=${value ?? "mdi:square"}
          @value-changed=${(e) => onChange(e.detail.value)}
        ></ha-icon-picker>
      </div>`;
    }
    // ── Tab: Vacuums ──────────────────────────────────────────────────────────
    _renderVacuumsTab() {
        return b `
      <div class="tab-body">
        ${this._config.vacuums.length === 0
            ? b `<p class="hint">No vacuums yet. Add one below.</p>`
            : this._config.vacuums.map((vac, i) => this._renderVacuumAccordion(vac, i))}
        <button class="btn btn--add" @click=${() => this._addVacuum()}>
          <ha-icon icon="mdi:plus"></ha-icon> Add vacuum
        </button>
      </div>`;
    }
    _renderVacuumAccordion(vac, idx) {
        const color = COLOR_HEX[vac.color ?? "green"];
        const isOpen = this._openVac.has(idx);
        return b `
      <div class="acc-row" style=${o({ borderLeft: "3px solid " + color })}>
        <div class="acc-header" @click=${() => this._toggleVac(idx)}>
          ${vac.image
            ? b `<img class="acc-img" src=${vac.image} alt=${vac.name ?? ""} />`
            : b `<ha-icon icon="mdi:robot-vacuum" style=${o({ color, width: "36px", height: "36px" })}></ha-icon>`}
          <div class="acc-info">
            <span class="acc-name">${vac.name || vac.entity || "Unnamed vacuum"}</span>
            <span class="acc-sub">${vac.entity}</span>
          </div>
          <button class="icon-btn" ?disabled=${idx === 0}
            @click=${(e) => { e.stopPropagation(); this._moveVacuum(idx, -1); }}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </button>
          <button class="icon-btn" ?disabled=${idx === this._config.vacuums.length - 1}
            @click=${(e) => { e.stopPropagation(); this._moveVacuum(idx, 1); }}>
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </button>
          <button class="icon-btn icon-btn--danger"
            @click=${(e) => { e.stopPropagation(); this._deleteVacuum(idx); }}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
          <ha-icon icon=${isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} class="acc-chevron"></ha-icon>
        </div>

        ${isOpen ? b `
          <div class="acc-body">

            <div class="section-title">Basic</div>
            ${this._entityPicker("Vacuum entity", vac.entity, ["vacuum"], v => this._setVacuum(idx, { entity: v }), true)}
            ${this._textField("Display name", vac.name, v => this._setVacuum(idx, { name: v }), "e.g. S8")}
            ${this._textField("Image path", vac.image, v => this._setVacuum(idx, { image: v }), "/local/...")}
            ${this._selectField("Accent colour", vac.color ?? "green", [{ value: "green", label: "Green" }, { value: "blue", label: "Blue" }, { value: "orange", label: "Orange" }], v => this._setVacuum(idx, { color: v }))}

            ${this._renderSensorsSection(idx, vac)}
            ${this._renderCleanActionSection(idx, vac)}

            <div class="section-title">Rooms (${(vac.rooms ?? []).length})</div>
            ${(vac.rooms ?? []).map((r, ri) => this._renderRoomAccordion(r, idx, ri))}
            <button class="btn btn--add" @click=${() => this._addRoom(idx)}>
              <ha-icon icon="mdi:plus"></ha-icon> Add room
            </button>

          </div>
        ` : A}
      </div>`;
    }
    _renderSensorsSection(vacIdx, vac) {
        const isOpen = this._openSensors.has(vacIdx);
        const configured = [vac.status_entity, vac.battery_entity, vac.last_clean_entity,
            vac.progress_entity, vac.current_room_entity, vac.error_entity].filter(Boolean).length;
        return b `
      <div class="collapsible">
        <div class="collapsible-header" @click=${() => this._toggleSensors(vacIdx)}>
          <span class="collapsible-title">Sensors</span>
          ${configured ? b `<span class="badge">${configured} configured</span>` : A}
          <ha-icon icon=${isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} class="acc-chevron"></ha-icon>
        </div>
        ${isOpen ? b `
          <div class="collapsible-body">
            ${this._entityPicker("Status", vac.status_entity, ["sensor"], v => this._setVacuum(vacIdx, { status_entity: v || undefined }))}
            ${this._entityPicker("Battery", vac.battery_entity, ["sensor"], v => this._setVacuum(vacIdx, { battery_entity: v || undefined }))}
            ${this._entityPicker("Last clean end", vac.last_clean_entity, ["sensor"], v => this._setVacuum(vacIdx, { last_clean_entity: v || undefined }))}
            ${this._entityPicker("Progress", vac.progress_entity, ["sensor"], v => this._setVacuum(vacIdx, { progress_entity: v || undefined }))}
            ${this._entityPicker("Current room", vac.current_room_entity, ["sensor"], v => this._setVacuum(vacIdx, { current_room_entity: v || undefined }))}
            ${this._entityPicker("Error", vac.error_entity, ["sensor"], v => this._setVacuum(vacIdx, { error_entity: v || undefined }))}
          </div>
        ` : A}
      </div>`;
    }
    _renderCleanActionSection(vacIdx, vac) {
        const isOpen = this._openAction.has(vacIdx);
        const action = vac.clean_action ?? { type: "native" };
        return b `
      <div class="collapsible">
        <div class="collapsible-header" @click=${() => this._toggleAction(vacIdx)}>
          <span class="collapsible-title">Clean action</span>
          <span class="badge">${action.type}</span>
          <ha-icon icon=${isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} class="acc-chevron"></ha-icon>
        </div>
        ${isOpen ? b `
          <div class="collapsible-body">
            ${this._renderCleanActionEditor(vacIdx, vac)}
          </div>
        ` : A}
      </div>`;
    }
    _renderCleanActionEditor(vacIdx, vac) {
        const action = vac.clean_action ?? { type: "native" };
        return b `
      ${this._selectField("Strategy", action.type, [{ value: "native", label: "Native Roborock (vacuum.send_command)" },
            { value: "script", label: "Custom script" }], v => this._setVacuum(vacIdx, { clean_action: v === "native"
                ? { type: "native" } : { type: "script", entity_id: "" } }))}
      ${action.type === "native"
            ? this._renderNativeAction(vacIdx, action)
            : this._renderScriptAction(vacIdx, action)}`;
    }
    _renderNativeAction(vacIdx, action) {
        return b `
      <div class="sub-section">
        ${this._numberSlider("Repeat passes", action.repeat ?? 1, 1, 3, 1, v => this._setCleanAction(vacIdx, { repeat: v }))}
        <div class="sub-title">Suction level (optional)</div>
        ${(() => {
            const speeds = this.hass.states[this._config.vacuums[vacIdx]?.entity]
                ?.attributes["fan_speed_list"] ?? [];
            return speeds.length
                ? this._optionSelectFromList("Suction option", speeds, action.suction_level, v => this._setCleanAction(vacIdx, { suction_level: v || undefined }))
                : this._textField("Suction option", action.suction_level, v => this._setCleanAction(vacIdx, { suction_level: v || undefined }), "e.g. balanced");
        })()}
        <div class="sub-title">Mop mode (optional)</div>
        ${this._entityPicker("Mop mode entity", action.mop_mode_entity, ["select"], v => this._setCleanAction(vacIdx, { mop_mode_entity: v || undefined }))}
        ${action.mop_mode_entity ? this._optionSelect("Mop mode option", action.mop_mode_entity, action.mop_mode, v => this._setCleanAction(vacIdx, { mop_mode: v || undefined })) : A}
        <div class="sub-title">Mop intensity (optional)</div>
        ${this._entityPicker("Mop intensity entity", action.mop_intensity_entity, ["select"], v => this._setCleanAction(vacIdx, { mop_intensity_entity: v || undefined }))}
        ${action.mop_intensity_entity ? this._optionSelect("Mop intensity option", action.mop_intensity_entity, action.mop_intensity, v => this._setCleanAction(vacIdx, { mop_intensity: v || undefined })) : A}
      </div>`;
    }
    _renderScriptAction(vacIdx, action) {
        const vars = action.variables ?? {};
        const entries = Object.entries(vars);
        return b `
      <div class="sub-section">
        ${this._entityPicker("Script entity", action.entity_id, ["script"], v => this._setCleanAction(vacIdx, { entity_id: v }))}
        <p class="hint">Tokens: {{ entity }}, {{ selected_segments }}, {{ selected_room_keys }}</p>
        ${entries.map(([key, val], vi) => b `
          <div class="var-row">
            <input class="text-input text-input--half" .value=${key} placeholder="name"
              @change=${(e) => {
            const newKey = e.target.value;
            const newVars = Object.fromEntries(entries.map(([k, v], i) => [i === vi ? newKey : k, v]));
            this._setCleanAction(vacIdx, { variables: newVars });
        }} />
            <span class="var-sep">&#8594;</span>
            <input class="text-input text-input--half" .value=${val} placeholder="{{ entity }}"
              @change=${(e) => {
            const newVars = { ...vars, [key]: e.target.value };
            this._setCleanAction(vacIdx, { variables: newVars });
        }} />
            <button class="icon-btn icon-btn--danger icon-btn--sm"
              @click=${() => {
            const newVars = Object.fromEntries(entries.filter((_, i) => i !== vi));
            this._setCleanAction(vacIdx, { variables: newVars });
        }}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>`)}
        <button class="btn btn--add btn--sm"
          @click=${() => this._setCleanAction(vacIdx, { variables: { ...vars, "": "" } })}>
          <ha-icon icon="mdi:plus"></ha-icon> Add variable
        </button>
      </div>`;
    }
    _renderRoomAccordion(room, vacIdx, roomIdx) {
        const isOpen = (this._openRoom.get(vacIdx) ?? null) === roomIdx;
        return b `
      <div class="room-acc">
        <div class="room-acc-header" @click=${() => this._toggleRoom(vacIdx, roomIdx)}>
          <ha-icon class="room-acc-icon" icon=${room.icon || "mdi:square"}></ha-icon>
          <div class="room-acc-info">
            <span class="room-acc-name">${room.name || room.key || "Unnamed room"}</span>
            ${room.segment_id !== undefined
            ? b `<span class="room-acc-meta">seg ${room.segment_id}</span>` : A}
          </div>
          <button class="icon-btn icon-btn--danger icon-btn--sm"
            @click=${(e) => { e.stopPropagation(); this._deleteRoom(vacIdx, roomIdx); }}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
          <ha-icon icon=${isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} class="acc-chevron"></ha-icon>
        </div>
        ${isOpen ? b `
          <div class="room-acc-body">
            ${this._textField("Key (unique ID)", room.key, v => this._setRoom(vacIdx, roomIdx, { key: v }), "e.g. bedroom")}
            ${this._textField("Display name", room.name, v => this._setRoom(vacIdx, roomIdx, { name: v }), "e.g. Bedroom")}
            ${this._iconPickerField(room.icon, v => this._setRoom(vacIdx, roomIdx, { icon: v }))}
            ${room.icon ? b `
              <div class="field">
                <label>Icon position</label>
                <div class="anchor-picker">
                  ${["tl", "t", "tr", "l", "c", "r", "bl", "b", "br"].map(pos => {
            const labels = { tl: "↖", t: "↑", tr: "↗", l: "←", c: "·", r: "→", bl: "↙", b: "↓", br: "↘" };
            return b `<button
                      class="anchor-cell ${(room.icon_anchor ?? "c") === pos ? "anchor-cell--active" : ""}"
                      title=${pos}
                      @click=${() => this._setRoom(vacIdx, roomIdx, { icon_anchor: pos })}>
                      ${labels[pos]}
                    </button>`;
        })}
                </div>
                <button class="btn btn--sm" style="margin-top:4px;align-self:flex-start"
                  @click=${() => this._setRoom(vacIdx, roomIdx, { icon_anchor: "none" })}>
                  Hide icon in overlay
                </button>
              </div>
            ` : A}
            <div class="field field--row">
              <label>Segment ID</label>
              <input class="text-input text-input--sm" type="number"
                .value=${String(room.segment_id ?? "")} placeholder="e.g. 16"
                @change=${(e) => {
            const v = parseInt(e.target.value);
            this._setRoom(vacIdx, roomIdx, { segment_id: isNaN(v) ? undefined : v });
        }} />
            </div>
            <p class="hint">Find IDs: Developer Tools → Actions → roborock.get_maps</p>
            ${this._numberSlider("Est. clean time", room.clean_time_mins ?? 0, 0, 120, 1, v => this._setRoom(vacIdx, roomIdx, { clean_time_mins: v > 0 ? v : undefined }), " min")}
            ${this._entityPicker("Last clean (input_datetime)", room.last_clean_entity, ["input_datetime"], v => this._setRoom(vacIdx, roomIdx, { last_clean_entity: v || undefined }))}
            <p class="hint map-hint" @click=${() => { this._tab = "maps"; this._mapVac = vacIdx; this._mapRoom = roomIdx; }}>
              📍 Set position in the <strong>Maps tab</strong> →
            </p>
          </div>
        ` : A}
      </div>`;
    }
    // ── Tab: Maps ─────────────────────────────────────────────────────────────
    _renderMapsTab() {
        const vacuums = this._config.vacuums;
        if (!vacuums.length) {
            return b `<div class="tab-body"><p class="hint">No vacuums configured. Add one in the Vacuums tab.</p></div>`;
        }
        const mapVac = Math.min(this._mapVac, vacuums.length - 1);
        const vac = vacuums[mapVac];
        const map = vac.map ?? { ...DEFAULT_MAP };
        const mapUrl = map.entity
            ? (this.hass.states[map.entity]?.attributes["entity_picture"] ?? "") : "";
        const rooms = vac.rooms ?? [];
        return b `
      <div class="tab-body">

        ${vacuums.length > 1 ? b `
          <div class="pill-row">
            ${vacuums.map((v, i) => b `
              <button class="vac-pill ${i === mapVac ? "vac-pill--active" : ""}"
                @click=${() => { this._mapVac = i; this._mapRoom = null; }}>
                ${v.name || v.entity || "Vacuum " + (i + 1)}
              </button>`)}
          </div>
        ` : A}

        ${this._entityPicker("Map image entity", map.entity, ["image"], v => this._setMap(mapVac, { entity: v }))}

        ${mapUrl ? b `
          <div class="map-pos-container ${this._mapRoom !== null ? "map-pos-container--active" : ""}"
            @click=${(e) => {
            if (this._mapRoom === null)
                return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
            this._setRoom(mapVac, this._mapRoom, { map_x: x, map_y: y });
        }}>
            <div class="map-preview-wrap">
              <img class="map-preview-img" src=${mapUrl} alt="Map preview"
                style=${o({
            left: (50 + (map.offset_x ?? 0)) + "%",
            top: (50 + (map.offset_y ?? 0)) + "%",
            width: (map.scale ?? 100) + "%",
            transform: "translate(-50%,-50%) rotate(" + (map.rotation ?? 0) + "deg)",
        })} />
              ${rooms.map((r, ri) => b `
                <div class="pos-dot ${ri === this._mapRoom ? "pos-dot--active" : ""}"
                  style=${o({ left: r.map_x + "%", top: r.map_y + "%" })}
                  @click=${(e) => { e.stopPropagation(); this._mapRoom = ri === this._mapRoom ? null : ri; }}>
                  <ha-icon icon=${r.icon || "mdi:square"} style="--mdc-icon-size:14px"></ha-icon>
                </div>`)}
            </div>
          </div>

          <div class="section-title">Calibration</div>
          ${this._numberSlider("Rotation", map.rotation ?? 0, 0, 360, 90, v => this._setMap(mapVac, { rotation: v }), "°")}
          ${this._numberSlider("Scale", map.scale ?? 100, 50, 200, 5, v => this._setMap(mapVac, { scale: v }), "%")}
          ${this._numberSlider("Offset X", map.offset_x ?? 0, -50, 50, 1, v => this._setMap(mapVac, { offset_x: v }), "%")}
          ${this._numberSlider("Offset Y", map.offset_y ?? 0, -50, 50, 1, v => this._setMap(mapVac, { offset_y: v }), "%")}

          ${rooms.length ? b `
            <div class="section-title">Room positions</div>
            <p class="hint">${this._mapRoom !== null
            ? "Click the map to move the selected room. Click the dot to deselect."
            : "Select a room below, then click the map to set its position."}</p>
            <div class="pill-row">
              ${rooms.map((r, ri) => b `
                <button class="room-pill ${ri === this._mapRoom ? "room-pill--active" : ""}"
                  @click=${() => { this._mapRoom = ri === this._mapRoom ? null : ri; }}>
                  <ha-icon icon=${r.icon || "mdi:square"} style="--mdc-icon-size:13px"></ha-icon>
                  ${r.name || r.key || "Room " + (ri + 1)}
                </button>`)}
            </div>

            ${this._mapRoom !== null ? b `
              <div class="two-col">
                ${this._numberSlider("X", rooms[this._mapRoom]?.map_x ?? 50, 0, 100, 1, v => this._setRoom(mapVac, this._mapRoom, { map_x: v }), "%")}
                ${this._numberSlider("Y", rooms[this._mapRoom]?.map_y ?? 50, 0, 100, 1, v => this._setRoom(mapVac, this._mapRoom, { map_y: v }), "%")}
              </div>
              ${(() => {
            const room = rooms[this._mapRoom];
            return room?.map_w !== undefined ? b `
                  <div class="section-title" style="margin-top:4px">Rectangle overlay</div>
                  ${this._numberSlider("Width", room.map_w, 1, 100, 1, v => this._setRoom(mapVac, this._mapRoom, { map_w: v }), "%")}
                  ${this._numberSlider("Height", room.map_h ?? 15, 1, 100, 1, v => this._setRoom(mapVac, this._mapRoom, { map_h: v }), "%")}
                  <button class="btn btn--sm" style="align-self:flex-start"
                    @click=${() => this._setRoom(mapVac, this._mapRoom, { map_w: undefined, map_h: undefined })}>
                    Switch to point mode
                  </button>
                ` : b `
                  <button class="btn btn--add btn--sm" style="align-self:flex-start"
                    @click=${() => this._setRoom(mapVac, this._mapRoom, { map_w: 20, map_h: 15 })}>
                    <ha-icon icon="mdi:rectangle-outline"></ha-icon> Enable rectangle overlay
                  </button>
                `;
        })()}
            ` : A}
          ` : b `<p class="hint">Add rooms in the Vacuums tab to position them here.</p>`}
        ` : b `<p class="hint">Select a map entity above to enable the calibration preview.</p>`}

      </div>`;
    }
    // ── Tab: Global ───────────────────────────────────────────────────────────
    _renderGlobalTab() {
        const globals = this._config.global_actions ?? [];
        const ths = this._config.room_thresholds ?? DEFAULT_THRESHOLDS;
        return b `
      <div class="tab-body">

        <div class="section-title">Global actions</div>
        <p class="hint">Badges that trigger a script across all vacuums (e.g. "Clean whole flat").</p>
        ${globals.length === 0
            ? b `<p class="hint">None configured.</p>`
            : globals.map((ga, i) => this._renderGlobalAccordion(ga, i))}
        <button class="btn btn--add" @click=${() => this._addGlobal()}>
          <ha-icon icon="mdi:plus"></ha-icon> Add global action
        </button>

        <div class="section-title" style="margin-top:4px">Room appearance</div>
        <p class="hint">Applies to all vacuums.</p>
        ${this._numberSlider("Border (idle)", this._config.room_border_normal ?? 2, 0, 12, 1, v => this._setConfig({ room_border_normal: v }), "px")}
        ${this._numberSlider("Border (selected)", this._config.room_border_selected ?? 4, 0, 12, 1, v => this._setConfig({ room_border_selected: v }), "px")}

        <div class="section-title" style="margin-top:4px">Thresholds (border colour by last clean age)</div>
        <p class="hint">Rules ascending — first match wins. Beyond the last = red.</p>
        ${ths.map((th, ti) => b `
          <div class="var-row threshold-row">
            <span class="threshold-label">≤</span>
            <input type="number" class="text-input text-input--sm threshold-days"
              min="0" max="365" .value=${String(th.days)}
              @change=${(e) => {
            const days = parseInt(e.target.value);
            const next = ths.map((t, i) => i === ti ? { ...t, days: isNaN(days) ? t.days : days } : t);
            this._setConfig({ room_thresholds: next });
        }} />
            <span class="threshold-label">days</span>
            <input type="color" class="threshold-color" .value=${th.color}
              @input=${(e) => {
            const color = e.target.value;
            const next = ths.map((t, i) => i === ti ? { ...t, color } : t);
            this._setConfig({ room_thresholds: next });
        }} />
            <button class="icon-btn icon-btn--danger icon-btn--sm"
              @click=${() => {
            const next = ths.filter((_, i) => i !== ti);
            this._setConfig({ room_thresholds: next.length ? next : undefined });
        }}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>`)}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn--add btn--sm" @click=${() => this._setConfig({ room_thresholds: [...ths, { days: 14, color: "#ff4d4f" }] })}>
            <ha-icon icon="mdi:plus"></ha-icon> Add threshold
          </button>
          ${this._config.room_thresholds ? b `
            <button class="btn btn--sm" @click=${() => this._setConfig({ room_thresholds: undefined })}>
              Reset to defaults
            </button>
          ` : A}
        </div>

      </div>`;
    }
    _renderGlobalAccordion(ga, idx) {
        const color = COLOR_HEX[ga.color ?? "orange"];
        const isOpen = this._openGlobal.has(idx);
        const action = ga.action;
        const watches = ga.watch_entities ?? [];
        return b `
      <div class="acc-row" style=${o({ borderLeft: "3px solid " + color })}>
        <div class="acc-header" @click=${() => this._toggleGlobal(idx)}>
          ${ga.image
            ? b `<img class="acc-img" src=${ga.image} alt=${ga.name} />`
            : b `<ha-icon icon="mdi:home-floor-a" style=${o({ color, width: "36px", height: "36px" })}></ha-icon>`}
          <div class="acc-info">
            <span class="acc-name">${ga.name || "Unnamed action"}</span>
            <span class="acc-sub">${action.type === "script" ? action.entity_id : action.service}</span>
          </div>
          <button class="icon-btn icon-btn--danger"
            @click=${(e) => { e.stopPropagation(); this._deleteGlobal(idx); }}>
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
          <ha-icon icon=${isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} class="acc-chevron"></ha-icon>
        </div>
        ${isOpen ? b `
          <div class="acc-body">
            ${this._textField("Display name", ga.name, v => this._setGlobal(idx, { name: v }), "e.g. Whole flat")}
            ${this._textField("Image path", ga.image, v => this._setGlobal(idx, { image: v || undefined }), "/local/...")}
            ${this._selectField("Accent colour", ga.color ?? "orange", [{ value: "green", label: "Green" }, { value: "blue", label: "Blue" }, { value: "orange", label: "Orange" }], v => this._setGlobal(idx, { color: v }))}

            <div class="sub-title">Watch entities (badge glows when any is cleaning)</div>
            ${watches.map((e, wi) => b `
              <div class="var-row">
                <ha-entity-picker .hass=${this.hass} .value=${e} .includeDomains=${["vacuum"]}
                  allow-custom-entity style="flex:1"
                  @value-changed=${(ev) => {
            const updated = [...watches];
            updated[wi] = ev.detail.value;
            this._setGlobal(idx, { watch_entities: updated.filter(Boolean) });
        }}></ha-entity-picker>
                <button class="icon-btn icon-btn--danger icon-btn--sm"
                  @click=${() => this._setGlobal(idx, { watch_entities: watches.filter((_, i) => i !== wi) })}>
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              </div>`)}
            <button class="btn btn--add btn--sm"
              @click=${() => this._setGlobal(idx, { watch_entities: [...watches, ""] })}>
              <ha-icon icon="mdi:plus"></ha-icon> Add entity
            </button>

            <div class="sub-title">Action (hold-to-activate)</div>
            ${this._selectField("Type", action.type, [{ value: "script", label: "Script" }, { value: "service", label: "Service call" }], v => this._setGlobal(idx, { action: v === "script"
                ? { type: "script", entity_id: "" }
                : { type: "service", service: "" } }))}
            ${action.type === "script"
            ? this._entityPicker("Script entity", action.entity_id, ["script"], v => this._setGlobalAction(idx, { entity_id: v }))
            : this._textField("Service", action.service, v => this._setGlobalAction(idx, { service: v }), "e.g. script.celkovy_uklid_bytu")}
          </div>
        ` : A}
      </div>`;
    }
    // ── Main render ───────────────────────────────────────────────────────────
    render() {
        if (!this._config)
            return A;
        return b `
      <datalist id="ha-entities"></datalist>
      <div class="editor-root">
        <div class="tabs-bar">
          ${["vacuums", "maps", "global"].map(t => b `
            <button class="tab-btn ${this._tab === t ? "tab-btn--active" : ""}"
              @click=${() => { this._tab = t; }}>
              ${{ vacuums: "🤖 Vacuums", maps: "🗺 Maps", global: "⚙ Global" }[t]}
            </button>`)}
        </div>
        ${this._tab === "vacuums" ? this._renderVacuumsTab()
            : this._tab === "maps" ? this._renderMapsTab()
                : this._renderGlobalTab()}
      </div>`;
    }
};
// ── Styles ────────────────────────────────────────────────────────────────
RoborockVacuumCardEditor.styles = i$5 `
    .editor-root { display:flex; flex-direction:column; }

    /* ── Tabs ── */
    .tabs-bar {
      display:flex;
      border-bottom:1px solid var(--divider-color,rgba(0,0,0,.12));
      margin-bottom:2px;
    }
    .tab-btn {
      flex:1; padding:10px 4px; background:none; border:none; cursor:pointer;
      font-size:12px; font-weight:600; font-family:inherit;
      color:var(--secondary-text-color);
      border-bottom:2px solid transparent;
      transition:color .15s, border-color .15s;
    }
    .tab-btn--active { color:var(--primary-color); border-bottom-color:var(--primary-color); }

    /* ── Tab body ── */
    .tab-body { display:flex; flex-direction:column; gap:8px; padding:10px 0 4px; }

    /* ── Vacuum accordion ── */
    .acc-row {
      border-radius:10px;
      border:1px solid var(--divider-color,rgba(0,0,0,.12));
      background:var(--secondary-background-color);
      overflow:hidden;
    }
    .acc-header {
      display:flex; align-items:center; gap:8px;
      padding:10px 10px 10px 12px; cursor:pointer;
    }
    .acc-header:hover { background:rgba(0,0,0,.03); }
    .acc-img  { width:36px; height:36px; border-radius:50%; object-fit:cover; flex-shrink:0; }
    .acc-info { flex:1; display:flex; flex-direction:column; min-width:0; }
    .acc-name { font-weight:600; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .acc-sub  { font-size:11px; color:var(--secondary-text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .acc-chevron { color:var(--secondary-text-color); flex-shrink:0; }
    .acc-body {
      padding:12px; display:flex; flex-direction:column; gap:8px;
      border-top:1px solid var(--divider-color,rgba(0,0,0,.12));
    }

    /* ── Collapsible (sensors / clean action) ── */
    .collapsible {
      border-radius:6px; border:1px solid var(--divider-color,rgba(0,0,0,.1)); overflow:hidden;
    }
    .collapsible-header {
      display:flex; align-items:center; gap:8px; padding:8px 10px; cursor:pointer;
      background:rgba(0,0,0,.02);
    }
    .collapsible-header:hover { background:rgba(0,0,0,.05); }
    .collapsible-title {
      flex:1; font-size:11px; font-weight:700; letter-spacing:.7px;
      text-transform:uppercase; color:var(--primary-color);
    }
    .collapsible-body { padding:10px; display:flex; flex-direction:column; gap:8px; }

    .badge {
      font-size:10px; font-weight:600; padding:2px 7px; border-radius:10px;
      background:rgba(0,0,0,.07); color:var(--secondary-text-color);
    }

    /* ── Room accordion ── */
    .room-acc {
      border-radius:6px; border:1px solid var(--divider-color,rgba(0,0,0,.1));
      background:rgba(0,0,0,.015); overflow:hidden;
    }
    .room-acc-header { display:flex; align-items:center; gap:8px; padding:8px 10px; cursor:pointer; }
    .room-acc-header:hover { background:rgba(0,0,0,.04); }
    .room-acc-icon { flex-shrink:0; }
    .room-acc-info { flex:1; display:flex; flex-direction:column; }
    .room-acc-name { font-weight:600; font-size:13px; }
    .room-acc-meta { font-size:11px; color:var(--secondary-text-color); }
    .room-acc-body {
      padding:10px; display:flex; flex-direction:column; gap:8px;
      border-top:1px solid var(--divider-color,rgba(0,0,0,.1));
    }

    /* ── Map hint link ── */
    .map-hint {
      cursor:pointer; color:var(--primary-color) !important;
      text-decoration:underline; text-underline-offset:2px;
    }
    .map-hint:hover { opacity:.8; }

    /* ── Pill rows (Maps tab vacuum/room selectors) ── */
    .pill-row { display:flex; gap:6px; flex-wrap:wrap; }
    .vac-pill {
      padding:5px 12px; border-radius:20px; font-size:12px; font-weight:600; cursor:pointer;
      border:1px solid var(--divider-color,rgba(0,0,0,.15));
      background:var(--secondary-background-color); color:var(--secondary-text-color);
      font-family:inherit;
    }
    .vac-pill--active { background:var(--primary-color); color:white; border-color:var(--primary-color); }
    .room-pill {
      display:flex; align-items:center; gap:4px;
      padding:4px 10px; border-radius:16px; font-size:12px; font-weight:500; cursor:pointer;
      border:1px solid var(--divider-color,rgba(0,0,0,.15));
      background:var(--secondary-background-color); color:var(--secondary-text-color);
      font-family:inherit;
    }
    .room-pill--active { background:rgba(33,150,243,.12); color:var(--primary-color); border-color:var(--primary-color); }

    /* ── Map preview ── */
    .map-pos-container { border-radius:8px; overflow:hidden; }
    .map-pos-container--active { cursor:crosshair; }
    .map-preview-wrap {
      position:relative; width:100%; padding-top:27.5%;
      overflow:hidden; border-radius:8px; background:rgba(0,0,0,.06);
    }
    .map-preview-img { position:absolute; transform-origin:center center; object-fit:cover; }

    .pos-dot {
      position:absolute; transform:translate(-50%,-50%);
      width:26px; height:26px; border-radius:6px;
      background:rgba(0,0,0,.55); border:2px solid rgba(255,255,255,.4);
      display:flex; align-items:center; justify-content:center;
      color:rgba(255,255,255,.7); cursor:pointer;
    }
    .pos-dot--active { background:rgba(33,150,243,.75); border-color:#2196F3; color:white; }

    .two-col { display:flex; gap:8px; }
    .two-col > * { flex:1; min-width:0; }

    /* ── Section title ── */
    .section-title {
      font-size:12px; font-weight:700; letter-spacing:.8px;
      text-transform:uppercase; color:var(--primary-color);
      border-bottom:1px solid var(--divider-color,rgba(0,0,0,.12));
      padding-bottom:4px; margin-bottom:2px;
    }
    .sub-section {
      display:flex; flex-direction:column; gap:8px;
      padding-left:8px; border-left:3px solid var(--divider-color,rgba(0,0,0,.1));
    }
    .sub-title { font-size:11px; font-weight:600; color:var(--secondary-text-color); margin-top:4px; }

    /* ── Fields ── */
    .field { display:flex; flex-direction:column; gap:4px; }
    .field--row { flex-direction:row; align-items:center; }
    .field--row label { width:130px; flex-shrink:0; }
    label { font-size:13px; color:var(--secondary-text-color); }
    .required { color:var(--error-color,#f44336); }

    .text-input {
      width:100%; box-sizing:border-box; padding:8px 10px;
      border:1px solid var(--divider-color,rgba(0,0,0,.2)); border-radius:6px;
      background:var(--card-background-color); color:var(--primary-text-color);
      font-size:13px; font-family:inherit;
    }
    .text-input--sm   { width:auto; flex:1; }
    .text-input--half { flex:1; min-width:0; }

    .select-input {
      flex:1; padding:6px 8px;
      border:1px solid var(--divider-color,rgba(0,0,0,.2)); border-radius:6px;
      background:var(--card-background-color); color:var(--primary-text-color);
      font-size:13px; font-family:inherit; cursor:pointer;
    }

    .slider-wrap { display:flex; align-items:center; gap:8px; flex:1; }
    .slider { flex:1; accent-color:var(--primary-color); }
    .slider-val { width:52px; text-align:right; font-size:13px; font-weight:600; color:var(--primary-color); flex-shrink:0; }

    /* ── Buttons ── */
    .btn {
      display:flex; align-items:center; gap:6px;
      padding:8px 14px; border-radius:8px;
      cursor:pointer; font-size:13px; font-weight:600; font-family:inherit; border:none;
    }
    .btn--add {
      background:rgba(33,150,243,.1); color:var(--primary-color);
      border:1px dashed var(--primary-color) !important;
    }
    .btn--sm { padding:4px 10px; font-size:12px; }

    .icon-btn {
      display:flex; align-items:center; justify-content:center;
      width:32px; height:32px; border-radius:6px;
      cursor:pointer; background:transparent; border:none; color:var(--secondary-text-color);
      flex-shrink:0;
    }
    .icon-btn:hover { background:rgba(0,0,0,.08); }
    .icon-btn:disabled { opacity:.35; cursor:default; }
    .icon-btn--danger { color:var(--error-color,#f44336); }
    .icon-btn--sm { width:24px; height:24px; }

    /* ── Misc ── */
    .hint { font-size:12px; color:var(--secondary-text-color); margin:0; }

    .var-row { display:flex; align-items:center; gap:6px; }
    .var-sep { color:var(--secondary-text-color); flex-shrink:0; }

    .anchor-picker { display:grid; grid-template-columns:repeat(3, 32px); gap:3px; }
    .anchor-cell {
      width:32px; height:32px; border-radius:6px; cursor:pointer;
      background:var(--secondary-background-color);
      border:1px solid var(--divider-color,rgba(0,0,0,.2));
      font-size:15px; display:flex; align-items:center; justify-content:center;
    }
    .anchor-cell--active { background:var(--primary-color); color:white; border-color:var(--primary-color); }

    .threshold-row { align-items:center; gap:6px; }
    .threshold-label { font-size:12px; color:var(--secondary-text-color); flex-shrink:0; }
    .threshold-days { width:56px !important; flex:none; padding:6px 8px; }
    .threshold-color {
      width:36px; height:28px; padding:2px; border-radius:6px;
      border:1px solid var(--divider-color,rgba(0,0,0,.2));
      background:var(--card-background-color); cursor:pointer;
    }
  `;
__decorate([
    n$1({ attribute: false })
], RoborockVacuumCardEditor.prototype, "hass", void 0);
__decorate([
    r()
], RoborockVacuumCardEditor.prototype, "_config", void 0);
__decorate([
    r()
], RoborockVacuumCardEditor.prototype, "_tab", void 0);
__decorate([
    r()
], RoborockVacuumCardEditor.prototype, "_openVac", void 0);
__decorate([
    r()
], RoborockVacuumCardEditor.prototype, "_openSensors", void 0);
__decorate([
    r()
], RoborockVacuumCardEditor.prototype, "_openAction", void 0);
__decorate([
    r()
], RoborockVacuumCardEditor.prototype, "_openGlobal", void 0);
__decorate([
    r()
], RoborockVacuumCardEditor.prototype, "_openRoom", void 0);
__decorate([
    r()
], RoborockVacuumCardEditor.prototype, "_mapVac", void 0);
__decorate([
    r()
], RoborockVacuumCardEditor.prototype, "_mapRoom", void 0);
RoborockVacuumCardEditor = __decorate([
    t$1(EDITOR_NAME)
], RoborockVacuumCardEditor);

export { RoborockVacuumCard, RoborockVacuumCardEditor };
