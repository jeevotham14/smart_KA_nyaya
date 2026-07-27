import { useState } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, ExternalLink,
  Loader2, RefreshCw, Scale, Shield, ShoppingCart, Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SectionHeader from '../components/SectionHeader.jsx';
import { legalApi } from '../services/api.js';

// ── Rich static content for each resource (shown instantly) ──────────────────
const RESOURCE_CONTENT = {
  dlsa: {
    icon: Scale,
    color: 'text-legalGold',
    title: 'How to Approach DLSA',
    desc: 'A plain-language guide to District Legal Services Authority support.',
    tag: 'Free Legal Aid',
    steps: [
      {
        heading: 'What is DLSA?',
        body: 'The District Legal Services Authority (DLSA) is a government body under the Legal Services Authorities Act, 1987. It provides FREE legal assistance to eligible citizens — including representation by a government-appointed lawyer, help filing court documents, and access to Lok Adalats.',
      },
      {
        heading: 'Who is eligible?',
        body: `You are entitled to free legal aid if you are:\n• A woman or child\n• A member of SC/ST community\n• A person with disability\n• A victim of trafficking or mass disaster\n• An industrial workman\n• A person whose annual income is below ₹3 lakh (varies by state)\n• A person in custody or remand`,
      },
      {
        heading: 'How to apply?',
        body: `1. Visit your District Court Complex — the DLSA office is located inside.\n2. Carry: Aadhaar card, income certificate (if available), any documents related to your case.\n3. Fill out the free legal aid application form.\n4. A Panel Lawyer will be assigned to represent you free of charge.\n5. You can also call the KSLSA helpline: 080-22111730`,
      },
      {
        heading: 'Lok Adalats — fast-track settlements',
        body: 'Lok Adalats are organised by the DLSA to settle disputes out of court. They are free, fast, and the award is final. Common cases resolved: motor accident claims, matrimonial disputes, labour disputes, cheque bounce cases.',
      },
    ],
    links: [
      { label: 'KSLSA Official Website', url: 'https://kslsa.kar.nic.in/' },
      { label: 'NALSA Free Legal Services', url: 'https://nalsa.gov.in/' },
    ],
    aiPrompt: 'Explain in detail how a Karnataka citizen can approach the District Legal Services Authority (DLSA) for free legal aid. Include eligibility criteria, the process, what documents to bring, and what Lok Adalats are.',
  },

  police: {
    icon: Shield,
    color: 'text-alertRed',
    title: 'Filing a Police Complaint',
    desc: 'What details to collect before approaching a police station.',
    tag: 'Criminal / Complaint',
    steps: [
      {
        heading: 'Before you go — collect these details',
        body: `Write down and keep safe:\n• Date, time, and exact location of the incident\n• Names of accused (if known)\n• Names and contact numbers of witnesses\n• Photographs, screenshots, or videos as evidence\n• Any physical evidence (don't wash or clean)`,
      },
      {
        heading: 'Types of police complaints',
        body: `• FIR (First Information Report): Filed for cognizable offences (theft, assault, murder, domestic violence). Police MUST register an FIR — they cannot refuse.\n• Written complaint: For non-cognizable offences. Police forward it to a magistrate.\n• Online complaint: Available on Karnataka Police website at ksp.karnataka.gov.in`,
      },
      {
        heading: 'If police refuse to register your FIR',
        body: `Under Section 173(3) of BNSS 2023, if police refuse to register your FIR:\n1. Send a written complaint to the Superintendent of Police (SP) of the district.\n2. Approach the nearest Judicial Magistrate directly.\n3. Contact the Karnataka State Human Rights Commission.\n4. Call 112 and report the refusal.`,
      },
      {
        heading: 'Women — special protections',
        body: `• Complaints related to rape, sexual assault, or domestic violence MUST be recorded by a female officer.\n• Call the Women Helpline (181) for immediate assistance.\n• One Stop Centres (Sakhi) can help you file complaints safely.`,
      },
    ],
    links: [
      { label: 'Karnataka Police Online Complaint', url: 'https://ksp.karnataka.gov.in/' },
      { label: 'National Emergency: 112', url: 'tel:112' },
    ],
    aiPrompt: 'Explain step by step how a Karnataka citizen can file a police complaint including FIR, what to do if police refuse, and special protections for women under Indian law.',
  },

  women: {
    icon: Users,
    color: 'text-pink-600',
    title: 'Women & Child Safety',
    desc: 'Emergency numbers, legal protections, and first-response routes.',
    tag: 'Safety & Protection',
    steps: [
      {
        heading: 'Emergency contacts — save these now',
        body: `📞 112 — Police Emergency (24/7)\n📞 181 — Vanitha Sahayavani Women Helpline (Karnataka, free)\n📞 1098 — Childline (children in distress)\n📞 102 — Ambulance\n📞 1091 — Women in distress (national)\n📞 080-22111730 — KSLSA Legal Aid`,
      },
      {
        heading: 'Laws protecting women in Karnataka',
        body: `• Protection of Women from Domestic Violence Act, 2005 — covers physical, emotional, sexual, economic abuse\n• Dowry Prohibition Act, 1961 — giving/taking dowry is a criminal offence\n• POCSO Act, 2012 — protection of children from sexual offences\n• BNS 2023, Section 85 — cruelty by husband or his relatives\n• Maternity Benefit Act — maternity leave and benefits for working women`,
      },
      {
        heading: 'One Stop Centres (Sakhi)',
        body: `Sakhi One Stop Centres are government facilities at district hospitals. They provide:\n• Shelter (up to 5 days)\n• Medical examination and treatment\n• Police assistance for filing FIR\n• Legal aid and court assistance\n• Psychological counselling\n\nNearest centre: Visit your district government hospital or call 181.`,
      },
      {
        heading: 'How to get a Protection Order',
        body: `Under the Domestic Violence Act:\n1. Contact a Protection Officer (available at every district collectorate)\n2. File a Domestic Incident Report (DIR)\n3. The Magistrate can issue a Protection Order within 3 working days\n4. Violation of a Protection Order is punishable with jail and fine`,
      },
    ],
    links: [
      { label: 'Women Helpline (181)', url: 'tel:181' },
      { label: 'Karnataka WCD Department', url: 'https://wcd.karnataka.gov.in/' },
    ],
    aiPrompt: 'Provide detailed information about laws protecting women and children in Karnataka, emergency contacts, One Stop Centres (Sakhi), and how to get a Protection Order under the Domestic Violence Act.',
  },

  consumer: {
    icon: ShoppingCart,
    color: 'text-blue-600',
    title: 'Consumer Complaint Basics',
    desc: 'Documents and facts useful for consumer disputes in Karnataka.',
    tag: 'Consumer Rights',
    steps: [
      {
        heading: 'When can you file a consumer complaint?',
        body: `You can file a complaint if you experienced:\n• Defective goods (product doesn't work as described)\n• Deficient services (bank, hospital, builder didn't deliver)\n• Overcharging or unfair trade practices\n• Misleading advertisements\n• Online fraud / e-commerce fraud (Flipkart, Amazon, etc.)`,
      },
      {
        heading: 'Documents to collect',
        body: `Keep safe:\n• Original bill / invoice / receipt\n• Order confirmation email or SMS\n• Product warranty card\n• Photographs of defective goods\n• All written communication with the seller/company\n• Bank statement showing the transaction`,
      },
      {
        heading: 'Where to file — jurisdiction',
        body: `• Up to ₹50 lakh claim → District Consumer Disputes Redressal Commission (CDRC)\n• ₹50 lakh to ₹2 crore → State Consumer Commission, Bengaluru\n• Above ₹2 crore → National Consumer Disputes Redressal Commission, Delhi\n\n✅ Filing fee is free for claims up to ₹5 lakh.`,
      },
      {
        heading: 'How to file — step by step',
        body: `1. First, send a written complaint/legal notice to the company (keep a copy).\n2. If no response in 30 days, file a complaint at the CDRC.\n3. You can file online at: consumerhelpline.gov.in or edaakhil.nic.in\n4. You do NOT need a lawyer to file a consumer complaint.\n5. The commission must resolve your complaint within 90 days.`,
      },
    ],
    links: [
      { label: 'E-Daakhil Online Filing', url: 'https://edaakhil.nic.in/' },
      { label: 'National Consumer Helpline: 1800-11-4000', url: 'tel:18001144000' },
    ],
    aiPrompt: 'Explain how a Karnataka citizen can file a consumer complaint, including jurisdiction thresholds, required documents, online filing process, and what to do if a company refuses to respond.',
  },
};

// ── Single resource card ──────────────────────────────────────────────────────
function ResourceCard({ resourceKey, data }) {
  const [expanded, setExpanded] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const Icon = data.icon;

  const toggleExpand = () => setExpanded((e) => !e);

  const loadAiInsight = async () => {
    setAiLoading(true);
    setAiError('');
    setAiContent('');
    try {
      const result = await legalApi.askAssistant({
        query: data.aiPrompt,
        language: 'English',
        history: [],
      });
      setAiContent(result.answer);
    } catch (_) {
      setAiError('Could not load AI insight right now. The static content above is still accurate.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <article className={`rounded-md border bg-white shadow-sm transition-all duration-300 ${expanded ? 'border-legalGold/50 shadow-md' : 'border-slate-200'}`}>
      {/* Card header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 rounded-sm bg-slate-100 p-2 ${data.color}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <span className="inline-block rounded-full bg-navy-50 px-2 py-0.5 text-xs font-bold text-navy-700 mb-1">{data.tag}</span>
              <p className="font-serif text-xl font-bold text-navy-900">{data.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{data.desc}</p>
            </div>
          </div>
        </div>

        <button
          onClick={toggleExpand}
          className={`mt-5 flex w-full items-center justify-center gap-2 rounded-sm border px-4 py-2.5 text-sm font-bold transition-colors ${
            expanded
              ? 'border-legalGold bg-legalGold/10 text-navy-900'
              : 'border-navy-800 bg-navy-800 text-white hover:bg-navy-700'
          }`}
          type="button"
          aria-expanded={expanded}
        >
          <BookOpen className="h-4 w-4" />
          {expanded ? 'Hide Article' : 'Read Update'}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50 px-6 pb-6 pt-5">

          {/* Step-by-step sections */}
          <div className="grid gap-3">
            {data.steps.map((step, i) => (
              <div key={i} className="overflow-hidden rounded-sm border border-slate-200 bg-white">
                <button
                  onClick={() => setActiveSection(activeSection === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left"
                  type="button"
                >
                  <span className="flex items-center gap-3 text-sm font-bold text-navy-900">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-legalGold text-xs font-bold text-navy-900">
                      {i + 1}
                    </span>
                    {step.heading}
                  </span>
                  {activeSection === i
                    ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                    : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
                </button>
                {activeSection === i && (
                  <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{step.body}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* External links */}
          {data.links?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-navy-800 px-3 py-1.5 text-xs font-bold text-navy-800 hover:bg-navy-50 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* AI Deep Dive section */}
          <div className="mt-5 rounded-sm border border-legalGold/30 bg-legalGold/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-navy-900">🤖 Get AI-Powered Deep Dive</p>
              <button
                onClick={loadAiInsight}
                disabled={aiLoading}
                className="flex items-center gap-1.5 rounded-sm bg-navy-800 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60 hover:bg-navy-700 transition-colors"
                type="button"
              >
                {aiLoading
                  ? <><Loader2 className="h-3 w-3 animate-spin" /> Loading…</>
                  : <><RefreshCw className="h-3 w-3" /> Ask Gemini / Groq</>}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Get a detailed, personalised explanation from our legal AI.</p>

            {aiError && (
              <p className="mt-3 text-xs font-semibold text-alertRed">{aiError}</p>
            )}

            {aiContent && (
              <div className="mt-3 rounded-sm border border-legalGold/20 bg-white p-4">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{aiContent}</p>
                <p className="mt-3 text-xs text-slate-400">⚠️ This is legal awareness only, not legal advice. Consult a qualified advocate for official action.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

// ── Main Resources page ───────────────────────────────────────────────────────
export default function Resources() {
  const { t } = useTranslation();

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Resources & Updates" title="Legal Awareness Articles">
          Click on any article below to read detailed guidance on Karnataka legal topics. Each article also lets you ask our AI for a personalised deep dive.
        </SectionHeader>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {Object.entries(RESOURCE_CONTENT).map(([key, data]) => (
            <ResourceCard key={key} resourceKey={key} data={data} />
          ))}
        </div>
      </div>
    </section>
  );
}
