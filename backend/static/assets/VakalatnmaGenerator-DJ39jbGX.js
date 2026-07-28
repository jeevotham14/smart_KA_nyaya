import{u as h,r as d,j as e,S as A}from"./index-DTtSzRHi.js";import{u as _,F as s}from"./FormInput-BS2Rqn8p.js";import{S as j}from"./SectionHeader-BcAI6UYJ.js";import{u as v,D as g,a as E}from"./DraftManager-DJIt61pB.js";import"./save-CNGYafhE.js";import"./file-text-BwNo286c.js";function D(a){return`IN THE ${a.courtName||"[COURT NAME]"}
AT ${a.place||"[PLACE]"}

CASE NO. ${a.caseNumber||"[CASE NUMBER]"}

${a.petitioner||"[PETITIONER NAME]"} ... Petitioner / Plaintiff

VERSUS

${a.respondent||"[RESPONDENT NAME]"} ... Respondent / Defendant

VAKALATNAMA

I/We, ${a.petitioner||"[NAME]"}, residing at ${a.clientAddress||"[CLIENT ADDRESS]"}, do hereby appoint and retain ${a.advocateName||"[ADVOCATE NAME]"}, Advocate (Enrollment No: ${a.enrollmentNumber||"[ENROLLMENT NUMBER]"}), having office at ${a.officeAddress||"[OFFICE ADDRESS]"}, to act, appear and plead for me/us in the above-mentioned matter.

I/We authorize the said Advocate to:
1. File, present, and defend any application, petition, or reply.
2. Produce and receive documents/money.
3. Accept service of notice or summons.
4. Compromise, compound, or withdraw the case if deemed necessary.

I/We agree to ratify all acts done by the said Advocate in pursuance of this authority.

Date: ${a.date||"[DATE]"}
Place: ${a.place||"[PLACE]"}

______________________
Signature of Client (Executant)

ACCEPTED
______________________
Signature of Advocate
${a.advocateName||"[ADVOCATE NAME]"}
`}function R(){const{t:a}=h(),[n,i]=d.useState("editor"),{register:t,watch:m}=_({defaultValues:{courtName:"HIGH COURT OF KARNATAKA",caseNumber:"",caseTitle:"",petitioner:"",respondent:"",advocateName:"",enrollmentNumber:"",officeAddress:"",clientAddress:"",date:new Date().toISOString().split("T")[0],place:"Bengaluru"}}),c=m(),r=d.useMemo(()=>D(c),[c]),{draft:o,setDraft:l,saveDraft:x,saved:p}=v("vakalatnamaDraft",r);d.useEffect(()=>{l(r)},[r,l]);const f=()=>window.print(),b=()=>alert("Downloading PDF..."),u=()=>alert("Downloading DOCX...");return e.jsx("section",{className:"py-12 md:py-16",children:e.jsxs("div",{className:"mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",children:[e.jsx(j,{eyebrow:"Legal Document",title:"Vakalatnama Generator",children:"Create a legally formatted Vakalatnama to authorize your advocate."}),e.jsxs("div",{className:"mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]",children:[e.jsxs("form",{className:"rounded-md border border-slate-200 bg-white p-6 shadow-sm",children:[e.jsxs("div",{className:"flex items-center gap-3 border-b border-slate-200 pb-5",children:[e.jsx("span",{className:"flex h-11 w-11 items-center justify-center rounded-sm bg-navy-50 text-navy-800",children:e.jsx(A,{className:"h-6 w-6","aria-hidden":"true"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-serif text-2xl font-bold text-navy-900",children:"Case Details"}),e.jsx("p",{className:"text-sm text-slate-600",children:"Enter details to generate Vakalatnama"})]})]}),e.jsxs("div",{className:"mt-6 grid gap-5 md:grid-cols-2",children:[e.jsx("div",{className:"md:col-span-2",children:e.jsx(s,{label:"Court Name",name:"courtName",register:t})}),e.jsx(s,{label:"Case Number (Optional)",name:"caseNumber",register:t}),e.jsx(s,{label:"Case Title",name:"caseTitle",register:t}),e.jsx(s,{label:"Petitioner / Appellant",name:"petitioner",register:t}),e.jsx(s,{label:"Respondent / Defendant",name:"respondent",register:t}),e.jsx(s,{label:"Advocate Name",name:"advocateName",register:t}),e.jsx(s,{label:"Enrollment Number",name:"enrollmentNumber",register:t}),e.jsx("div",{className:"md:col-span-2",children:e.jsx(s,{label:"Advocate Office Address",name:"officeAddress",register:t})}),e.jsx("div",{className:"md:col-span-2",children:e.jsx(s,{label:"Client Address",name:"clientAddress",register:t})}),e.jsx(s,{label:"Date",name:"date",register:t,type:"date"}),e.jsx(s,{label:"Place",name:"place",register:t})]})]}),e.jsxs("aside",{className:"rounded-md border border-slate-200 bg-white p-6 shadow-sm flex flex-col",children:[e.jsxs("div",{className:"flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-serif text-2xl font-bold text-navy-900",children:"Preview"}),e.jsx("p",{className:"mt-1 text-sm text-slate-600",children:"Review your Vakalatnama"})]}),e.jsx(g,{onPrint:f,onDownloadPdf:b,onDownloadDocx:u,onSave:()=>x(o),saved:p})]}),e.jsxs("div",{className:"mt-4 flex gap-4 border-b border-slate-200",children:[e.jsx("button",{type:"button",className:`pb-2 text-sm font-semibold transition-colors border-b-2 ${n==="editor"?"border-legalGold text-navy-900":"border-transparent text-slate-500 hover:text-navy-900"}`,onClick:()=>i("editor"),children:"Draft Editor"}),e.jsx("button",{type:"button",className:`pb-2 text-sm font-semibold transition-colors border-b-2 ${n==="preview"?"border-legalGold text-navy-900":"border-transparent text-slate-500 hover:text-navy-900"}`,onClick:()=>i("preview"),children:"Print Preview"})]}),e.jsx("div",{className:"flex-1 mt-5",children:n==="editor"?e.jsx("textarea",{className:"h-full min-h-[520px] w-full resize-none rounded-sm border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20",value:o||r,onChange:N=>l(N.target.value)}):e.jsx(E,{content:o||r})}),e.jsx("p",{className:"mt-4 text-xs leading-5 text-slate-500",children:"This is a generated draft and should be verified before submission."})]})]})]})})}export{R as default};
