import{c,u as h,j as e,r as d}from"./index-p3grlykG.js";import{S as m}from"./save-DwTjY_6Z.js";import{F as u}from"./file-text-DXVa2laU.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=c("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=c("Printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);function g({onPrint:t,onDownloadPdf:r,onDownloadDocx:o,onSave:n,saved:l}){const{t:s}=h();return e.jsxs("div",{className:"flex gap-2",children:[n&&e.jsxs("button",{className:"inline-flex h-10 px-3 items-center justify-center rounded-sm border border-slate-300 text-navy-800 hover:bg-slate-50 transition-colors",onClick:n,title:s("docGen.saveDraft")||"Save Draft",type:"button",children:[e.jsx(m,{className:"h-4 w-4 mr-2","aria-hidden":"true"}),e.jsx("span",{className:"text-sm font-semibold",children:l?"Saved":"Save"})]}),e.jsx("button",{className:"inline-flex h-10 w-10 items-center justify-center rounded-sm border border-slate-300 text-navy-800 hover:bg-slate-50 transition-colors",onClick:t,title:s("docGen.printPlaceholder")||"Print",type:"button",children:e.jsx(y,{className:"h-4 w-4","aria-hidden":"true"})}),e.jsx("button",{className:"inline-flex h-10 w-10 items-center justify-center rounded-sm bg-legalGold text-navy-900 hover:bg-legalGold/90 transition-colors",onClick:r,title:"Download PDF",type:"button",children:e.jsx(u,{className:"h-4 w-4","aria-hidden":"true"})}),e.jsx("button",{className:"inline-flex h-10 w-10 items-center justify-center rounded-sm bg-navy-800 text-white hover:bg-navy-700 transition-colors",onClick:o,title:"Download DOCX",type:"button",children:e.jsx(x,{className:"h-4 w-4","aria-hidden":"true"})})]})}function w({content:t,isHtml:r=!1}){return e.jsxs("div",{className:"print-ready",children:[e.jsx("div",{className:"mt-5 min-h-[520px] whitespace-pre-wrap rounded-sm border border-slate-200 bg-slate-50 p-6 sm:p-8 text-sm leading-6 text-slate-800 shadow-inner font-serif",children:r?e.jsx("div",{dangerouslySetInnerHTML:{__html:t}}):t}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-ready, .print-ready * {
            visibility: visible;
          }
          .print-ready {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            border: none;
            padding: 0;
            margin: 0;
            box-shadow: none;
          }
        }
      `}})]})}function j(t,r){const[o,n]=d.useState(()=>{try{const a=window.localStorage.getItem(t);return a?JSON.parse(a):r}catch(a){return console.error("Error reading from localStorage",a),r}}),[l,s]=d.useState(!1);return d.useEffect(()=>{},[r]),{draft:o,setDraft:n,saveDraft:a=>{try{const i=a||o;n(i),window.localStorage.setItem(t,JSON.stringify(i)),s(!0),setTimeout(()=>s(!1),3e3)}catch(i){console.error("Error saving to localStorage",i)}},saved:l}}export{g as D,y as P,w as a,j as u};
