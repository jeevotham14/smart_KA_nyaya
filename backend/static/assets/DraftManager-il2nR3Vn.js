import{c,u as m,j as e,r as d}from"./index-BcL0Lz8i.js";import{S as h}from"./save-BOVdEvcL.js";import{F as u}from"./file-text-BcKSAeSR.js";import{D as x}from"./download-Q5XI2AXj.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=c("Printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);function w({onPrint:t,onDownloadPdf:r,onDownloadDocx:o,onSave:s,saved:l}){const{t:n}=m();return e.jsxs("div",{className:"flex gap-2",children:[s&&e.jsxs("button",{className:"inline-flex h-10 px-3 items-center justify-center rounded-sm border border-slate-300 text-navy-800 hover:bg-slate-50 transition-colors",onClick:s,title:n("docGen.saveDraft")||"Save Draft",type:"button",children:[e.jsx(h,{className:"h-4 w-4 mr-2","aria-hidden":"true"}),e.jsx("span",{className:"text-sm font-semibold",children:l?"Saved":"Save"})]}),e.jsx("button",{className:"inline-flex h-10 w-10 items-center justify-center rounded-sm border border-slate-300 text-navy-800 hover:bg-slate-50 transition-colors",onClick:t,title:n("docGen.printPlaceholder")||"Print",type:"button",children:e.jsx(p,{className:"h-4 w-4","aria-hidden":"true"})}),e.jsx("button",{className:"inline-flex h-10 w-10 items-center justify-center rounded-sm bg-legalGold text-navy-900 hover:bg-legalGold/90 transition-colors",onClick:r,title:"Download PDF",type:"button",children:e.jsx(u,{className:"h-4 w-4","aria-hidden":"true"})}),e.jsx("button",{className:"inline-flex h-10 w-10 items-center justify-center rounded-sm bg-navy-800 text-white hover:bg-navy-700 transition-colors",onClick:o,title:"Download DOCX",type:"button",children:e.jsx(x,{className:"h-4 w-4","aria-hidden":"true"})})]})}function j({content:t,isHtml:r=!1}){return e.jsxs("div",{className:"print-ready",children:[e.jsx("div",{className:"mt-5 min-h-[520px] whitespace-pre-wrap rounded-sm border border-slate-200 bg-slate-50 p-6 sm:p-8 text-sm leading-6 text-slate-800 shadow-inner font-serif",children:r?e.jsx("div",{dangerouslySetInnerHTML:{__html:t}}):t}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
      `}})]})}function S(t,r){const[o,s]=d.useState(()=>{try{const a=window.localStorage.getItem(t);return a?JSON.parse(a):r}catch(a){return console.error("Error reading from localStorage",a),r}}),[l,n]=d.useState(!1);return d.useEffect(()=>{},[r]),{draft:o,setDraft:s,saveDraft:a=>{try{const i=a||o;s(i),window.localStorage.setItem(t,JSON.stringify(i)),n(!0),setTimeout(()=>n(!1),3e3)}catch(i){console.error("Error saving to localStorage",i)}},saved:l}}export{w as D,p as P,j as a,S as u};
