import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Languages, Scale, SendHorizontal, UserRound, Mic, MicOff, Volume2,
  Loader2, Phone, ShieldAlert, FileWarning, FileText, Laptop, ScrollText,
  ShoppingBag, BadgeCheck, Clock, Building2, ExternalLink, Sparkles,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Heart, X, Check, Copy, Sliders
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getApiError, legalApi } from '../services/api.js';
import { karnatakaDistricts } from '../data/mockData.js';

// Map icon strings to Lucide components
const WIDGET_ICONS = {
  ShieldAlert,
  FileWarning,
  FileText,
  Laptop,
  ScrollText,
  ShoppingBag,
  BadgeCheck,
  Clock,
  Scale,
  Building2,
  Heart,
};

// ── Markdown Formatter ──
function FormattedMessage({ text }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-base text-navy-900 dark:text-legalGold mt-3 mb-1">
              {trimmed.slice(4)}
            </h4>
          );
        }
        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-bold text-lg text-navy-900 dark:text-white mt-4 mb-1">
              {trimmed.slice(3)}
            </h3>
          );
        }
        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-legalGold font-bold mt-0.5">•</span>
              <span className="flex-1">{renderFormattedText(trimmed.slice(2))}</span>
            </div>
          );
        }
        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-legalGold font-bold shrink-0">{numMatch[1]}.</span>
              <span className="flex-1">{renderFormattedText(numMatch[2])}</span>
            </div>
          );
        }

        // Standard paragraph
        return <p key={idx}>{renderFormattedText(trimmed)}</p>;
      })}
    </div>
  );
}

function renderFormattedText(text) {
  // Support **bold** and `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-navy-950 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-slate-200 dark:bg-navy-800 px-1 py-0.5 font-mono text-xs text-legalGold">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ── Interactive Action Card ──
function ActionCard({ widget, isKn, onAction }) {
  const IconComponent = WIDGET_ICONS[widget.icon] || FileText;
  const isEmergency = widget.type === 'emergency_sos';

  return (
    <div
      className={`rounded-xl border p-4 transition-all shadow-sm ${
        isEmergency
          ? 'border-red-300 dark:border-red-800/60 bg-red-50/80 dark:bg-red-950/40 text-red-950 dark:text-red-100'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/90 hover:border-legalGold/60 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
            isEmergency
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-legalGold/10 text-legalGold border border-legalGold/30'
          }`}
        >
          <IconComponent className="h-5 w-5" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="font-bold text-xs text-navy-900 dark:text-white truncate">
              {isKn && widget.title_kn ? widget.title_kn : widget.title}
            </h5>
            {widget.badge && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isEmergency
                    ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-legalGold/15 text-legalGold dark:bg-legalGold/20'
                }`}
              >
                {widget.badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            {isKn && widget.description_kn ? widget.description_kn : widget.description}
          </p>

          <div className="mt-3 flex items-center justify-end">
            <button
              type="button"
              onClick={() => onAction(widget.target_url)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                isEmergency
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-navy-900 dark:bg-legalGold hover:bg-navy-800 dark:hover:bg-yellow-500 text-white dark:text-navy-950'
              }`}
            >
              <span>{isKn && widget.action_label_kn ? widget.action_label_kn : widget.action_label}</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Statutory Reference Component ──
function StatuteCard({ statute, isKn }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-900/60 overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-2.5 text-left hover:bg-slate-100 dark:hover:bg-navy-800/60 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Scale className="h-3.5 w-3.5 text-legalGold shrink-0" />
          <span className="text-xs font-bold text-navy-900 dark:text-white truncate">
            {statute.act} — <span className="text-legalGold">{statute.section}</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
            ✓ {isKn ? 'ಕರ್ನಾಟಕ ಗೆಜೆಟ್ ಮಾನ್ಯತೆ' : 'Gazette Verified'}
          </span>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-400 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
      </button>
      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-navy-950 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
          <p>{isKn && statute.summary_kn ? statute.summary_kn : statute.summary}</p>
          {statute.remedy && (
            <div className="rounded-lg bg-legalGold/5 border border-legalGold/20 p-2 text-[11px]">
              <strong className="text-navy-900 dark:text-legalGold block mb-0.5">{isKn ? 'ಕಾನೂನು ಪರಿಹಾರ / ಶಿಕ್ಷೆ:' : 'Statutory Remedy / Punishment:'}</strong>
              <span>{statute.remedy}</span>
            </div>
          )}
          {statute.gazette_ref && (
            <p className="text-[10px] text-slate-400 font-mono">
              Official Reference: {statute.gazette_ref}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Case Health Diagnostic Score Component ──
function DiagnosticScoreCard({ score, isKn }) {
  if (!score) return null;

  const limitationColor = {
    safe: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  }[score.limitation_risk] || 'bg-slate-100 text-slate-800';

  const limitationLabel = {
    safe: isKn ? 'ಕಾಲಮಿತಿ ಸುರಕ್ಷಿತ (Safe)' : 'Within Limitation (Safe)',
    warning: isKn ? 'ಕಾಲಮಿತಿ ಅಪಾಯ (Approaching Expiry)' : 'Expiring Soon (Warning)',
    expired: isKn ? 'ಕಾಲಮಿತಿ ಮೀರಿದೆ (Expired / Section 5 needed)' : 'Statutory Limit Expired',
  }[score.limitation_risk] || score.limitation_risk;

  return (
    <div className="mt-4 rounded-xl border border-legalGold/30 bg-gradient-to-br from-legalGold/5 to-navy-900/10 dark:from-legalGold/10 dark:to-navy-900/40 p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-legalGold/20 pb-3 mb-3">
        <span className="flex items-center gap-2 text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider">
          <Sparkles className="h-4 w-4 text-legalGold" />
          {isKn ? 'ಪ್ರಕರಣ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ (Legal Health Assessment)' : 'Case Health & Strategy Assessment'}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${limitationColor}`}>
          {limitationLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-lg bg-white/80 dark:bg-navy-950/80 p-2.5 border border-slate-200 dark:border-slate-800">
          <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {isKn ? 'ಪ್ರಕರಣದ ಸಾಮರ್ಥ್ಯ' : 'Case Strength'}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black text-navy-900 dark:text-white">{score.strength_score}%</span>
            <span className="text-[10px] font-bold text-legalGold">
              {score.strength_score >= 70 ? (isKn ? 'ಉತ್ತಮ' : 'Strong') : score.strength_score >= 45 ? (isKn ? 'ಮಧ್ಯಮ' : 'Moderate') : (isKn ? 'ಹೆಚ್ಚುವರಿ ಪುರಾವೆ ಬೇಕು' : 'Needs Evidence')}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden">
            <div className="h-full bg-legalGold rounded-full transition-all duration-500" style={{ width: `${score.strength_score}%` }} />
          </div>
        </div>

        <div className="rounded-lg bg-white/80 dark:bg-navy-950/80 p-2.5 border border-slate-200 dark:border-slate-800">
          <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {isKn ? 'ದಾಖಲೆಗಳ ಸನ್ನದ್ಧತೆ' : 'Evidence Readiness'}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-black text-navy-900 dark:text-white">{score.evidence_readiness}%</span>
            <span className="text-[10px] font-bold text-slate-500">
              {score.evidence_readiness >= 60 ? (isKn ? 'ಸಿದ್ಧವಿದೆ' : 'Prepared') : (isKn ? 'ದಾಖಲೆ ಕೊರತೆ' : 'Gaps Present')}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${score.evidence_readiness}%` }} />
          </div>
        </div>
      </div>

      {score.missing_evidence && score.missing_evidence.length > 0 && (
        <div className="mb-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 p-2.5 border border-amber-200 dark:border-amber-800/40">
          <span className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            {isKn ? 'ಸಂಗ್ರಹಿಸಬೇಕಾದ ದಾಖಲೆಗಳು:' : 'Critical Missing Evidence to Gather:'}
          </span>
          <ul className="grid gap-1 pl-4 list-disc text-[11px] text-amber-800 dark:text-amber-300">
            {score.missing_evidence.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {score.recommended_step && (
        <div className="rounded-lg bg-navy-900 text-white p-3 text-xs leading-relaxed">
          <span className="font-bold text-legalGold block mb-0.5">
            {isKn ? '👉 ಮುಂದಿನ ಕಾನೂನು ಕ್ರಮ:' : '👉 Recommended Official Action:'}
          </span>
          {isKn && score.recommended_step_kn ? score.recommended_step_kn : score.recommended_step}
        </div>
      )}
    </div>
  );
}

// ── Interactive Diagnostic Questionnaire Modal ──
function DiagnosticModal({ isOpen, onClose, onComplete, isKn }) {
  const [category, setCategory] = useState('property');
  const [timeframe, setTimeframe] = useState('recent');
  const [hasProof, setHasProof] = useState(true);
  const [hasNotice, setHasNotice] = useState(false);
  const [district, setDistrict] = useState('Bengaluru Urban');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const districtNames = Object.keys(karnatakaDistricts).sort();

  const handleRun = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const score = await legalApi.diagnoseQuiz({
        category,
        incident_timeframe: timeframe,
        has_written_proof: hasProof,
        has_lodged_police_or_notice: hasNotice,
        district,
      });
      onComplete(score, category, district);
    } catch (err) {
      console.error('Diagnostic error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-navy-900 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-legalGold/15 text-legalGold">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
              {isKn ? 'ಪ್ರಕರಣ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ' : 'Guided Case Health Diagnostic'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isKn ? '೩೦ ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಪ್ರಕರಣದ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಕಾಲಮಿತಿ ಪರಿಶೀಲಿಸಿ' : 'Assess case viability & limitation in 30 seconds'}
            </p>
          </div>
        </div>

        <form onSubmit={handleRun} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-navy-900 dark:text-white mb-1.5">
              1. {isKn ? 'ವಿವಾದದ ವರ್ಗ' : 'Legal Dispute Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 p-2.5 text-navy-900 dark:text-white font-medium"
            >
              <option value="property">{isKn ? 'ಆಸ್ತಿ & ಭೂ ದಾಖಲೆಗಳು (Property / Land)' : 'Property & Land Dispute'}</option>
              <option value="tenancy">{isKn ? 'ಬಾಡಿಗೆ & ಮನೆ ಖಾಲಿ (Tenancy & Rent)' : 'Tenancy & Rental Eviction'}</option>
              <option value="criminal">{isKn ? 'ಕ್ರಿಮಿನಲ್ / ಕಳ್ಳತನ / ಹಲ್ಲೆ (Criminal / Police)' : 'Criminal / Theft / Assault'}</option>
              <option value="cyber">{isKn ? 'ಸೈಬರ್ ವಂಚನೆ (Cyber Crime / Online Fraud)' : 'Cyber Crime & Online Fraud'}</option>
              <option value="consumer">{isKn ? 'ಗ್ರಾಹಕರ ದೂರು (Consumer Defect / Refund)' : 'Consumer Defect & Refund'}</option>
              <option value="labour">{isKn ? 'ಕಾರ್ಮಿಕ ವೇತನ / ಉದ್ಯೋಗ (Labour / Wages)' : 'Employment & Unpaid Wages'}</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-navy-900 dark:text-white mb-1.5">
              2. {isKn ? 'ಘಟನೆ ನಡೆದ ಸಮಯ (ಕಾಲಮಿತಿ ಲೆಕ್ಕಾಚಾರ)' : 'When did this incident occur? (Limitation check)'}
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 p-2.5 text-navy-900 dark:text-white font-medium"
            >
              <option value="recent">{isKn ? 'ಇತ್ತೀಚೆಗೆ (< ೬ ತಿಂಗಳು - ಸುರಕ್ಷಿತ)' : 'Recently (< 6 months ago)'}</option>
              <option value="within_1_year">{isKn ? '೬ ತಿಂಗಳು - ೧ ವರ್ಷದೊಳಗೆ' : '6 months to 1 year ago'}</option>
              <option value="1_to_3_years">{isKn ? '೧ - ೩ ವರ್ಷಗಳ ಹಿಂದೆ (ಎಚ್ಚರಿಕೆ)' : '1 to 3 years ago (Approaching limit)'}</option>
              <option value="over_3_years">{isKn ? '೩ ವರ್ಷಗಳಿಗಿಂತ ಹೆಚ್ಚು (ಕಾಲಮಿತಿ ಮೀರಿದೆ)' : 'Over 3 years ago (Limitation expired)'}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-navy-950">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasProof}
                  onChange={(e) => setHasProof(e.target.checked)}
                  className="rounded text-legalGold focus:ring-legalGold"
                />
                <span className="font-bold text-navy-900 dark:text-white">
                  {isKn ? 'ಲಿಖಿತ ದಾಖಲೆಗಳಿವೆ' : 'Have written receipts/proof'}
                </span>
              </label>
              <span className="block mt-1 text-[10px] text-slate-500">
                {isKn ? 'ಕರಾರು, ಬ್ಯಾಂಕ್ ರಶೀದಿ, ಚಾಟ್' : 'Agreements, transactions, chats'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-navy-950">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNotice}
                  onChange={(e) => setHasNotice(e.target.checked)}
                  className="rounded text-legalGold focus:ring-legalGold"
                />
                <span className="font-bold text-navy-900 dark:text-white">
                  {isKn ? 'ನೋಟಿಸ್ / ದೂರು ನೀಡಲಾಗಿದೆ' : 'Prior notice / FIR lodged'}
                </span>
              </label>
              <span className="block mt-1 text-[10px] text-slate-500">
                {isKn ? 'ಪೊಲೀಸ್ ದೂರು ಸ್ವೀಕೃತಿ ಅಥವಾ ನೋಟಿಸ್' : 'Formal demand or SHO acknowledgment'}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-navy-900 dark:text-white mb-1.5">
              3. {isKn ? 'ಕರ್ನಾಟಕದ ಜಿಲ್ಲೆ' : 'Karnataka District'}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 p-2.5 text-navy-900 dark:text-white font-medium"
            >
              {districtNames.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              {isKn ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="premium-btn premium-btn-gold px-5 py-2.5 text-xs font-bold flex items-center gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>{isKn ? 'ವಿಶ್ಲೇಷಣೆ ನಡೆಸಿ' : 'Evaluate Case Health'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main AssistantChat Component ──
export default function AssistantChat() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKn = i18n.language === 'kn';

  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('English');
  const legalCategories = [
    { title: t('categories.familyLaw'), prompt: t('categories.familyLawPrompt'), examples: t('categories.familyLawEx') },
    { title: t('categories.property'), prompt: t('categories.propertyPrompt'), examples: t('categories.propertyEx') },
    { title: t('categories.labour'), prompt: t('categories.labourPrompt'), examples: t('categories.labourEx') },
    { title: t('categories.consumer'), prompt: t('categories.consumerPrompt'), examples: t('categories.consumerEx') },
    { title: t('categories.criminal'), prompt: t('categories.criminalPrompt'), examples: t('categories.criminalEx') },
    { title: t('categories.womenSafety'), prompt: t('categories.womenSafetyPrompt'), examples: t('categories.womenSafetyEx') },
  ];

  const [category, setCategory] = useState(t('categories.familyLaw'));
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: t('chat.greeting'),
      steps: [t('chat.step1'), t('chat.step2'), t('chat.step3')],
      action_widgets: [
        {
          id: 'welcome-draft',
          type: 'draft_document',
          title: 'High Court Compliant Document Generator',
          title_kn: 'ಹೈಕೋರ್ಟ್ ಮಾನ್ಯತೆ ಪಡೆದ ದಾಖಲೆ ತಯಾರಕ',
          description: 'Draft 24 formal document types: FIR complaints, legal notices, RTIs, and rental agreements.',
          description_kn: '೨೪ ಮಾದರಿಯ ಅಧಿಕೃತ ಕಾನೂನು ಕರಡುಗಳು: ಎಫ್‌ಐಆರ್ ದೂರು, ಲೀಗಲ್ ನೋಟಿಸ್, ಆರ್‌ಟಿಐ.',
          target_url: '/document-generator',
          action_label: 'Explore Templates ↗',
          action_label_kn: 'ಮಾದರಿಗಳನ್ನು ನೋಡಿ ↗',
          badge: '24 Templates',
          icon: 'FileText'
        },
        {
          id: 'welcome-dlsa',
          type: 'legal_aid',
          title: 'Section 12 Free Legal Aid Eligibility',
          title_kn: 'ಕಲಂ ೧೨ ಉಚಿತ ಕಾನೂನು ನೆರವು ಅರ್ಹತೆ',
          description: 'Check if you qualify for a free DLSA panel advocate and fee exemption in Karnataka.',
          description_kn: 'ಉಚಿತ ಸರ್ಕಾರಿ ವಕೀಲರ ಸೇವೆಗೆ ನಿಮ್ಮ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ.',
          target_url: '/legal-aid',
          action_label: 'Check DLSA Eligibility ↗',
          action_label_kn: 'ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ ↗',
          badge: 'Section 12 DLSA',
          icon: 'BadgeCheck'
        }
      ]
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isSplitView, setIsSplitView] = useState(true);
  const [activeLiveDraft, setActiveLiveDraft] = useState(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Audio Recording (Sarvam ASR) State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, transcribing]);

  const chooseCategory = (item) => {
    setCategory(item.title);
    setQuery(item.prompt);
    setError('');
  };

  const handleActionClick = (targetUrl) => {
    if (!targetUrl) return;
    if (targetUrl.startsWith('http')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(targetUrl);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        clearInterval(recordingTimerRef.current);
        setRecordingSecs(0);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setTranscribing(true);
        try {
          const langCode = language === 'Kannada' || language === 'Kannada + English' ? 'kn-IN' : 'en-IN';
          const res = await legalApi.speechToText(audioBlob, langCode);
          if (res.transcript) {
            setQuery(res.transcript);
            handleSendQuery(res.transcript);
          }
        } catch (err) {
          console.error('ASR error', err);
          setError('Speech recognition failed. Please try typing your message.');
        } finally {
          setTranscribing(false);
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSecs(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSecs((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied', err);
      setError('Microphone permission required for voice input.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const playTTS = async (text) => {
    try {
      const res = await legalApi.textToSpeech({ text, language });
      if (res.audio_base64) {
        const audio = new Audio('data:audio/wav;base64,' + res.audio_base64);
        audio.play();
      }
    } catch (err) {
      console.error('TTS playback error', err);
    }
  };

  const handleSendQuery = async (textToSend) => {
    const userText = textToSend || query;
    if (!userText.trim() || loading) return;
    setLoading(true);
    setError('');
    const newUserMsg = { role: 'user', text: userText };
    setMessages((prev) => [...prev, newUserMsg]);
    setQuery('');

    try {
      const history = messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

      const result = await legalApi.askAssistant({ query: userText, language, history });
      const assistantMsg = {
        role: 'assistant',
        text: result.answer,
        provider: result.provider,
        model: result.model,
        category: result.category,
        urgency: result.urgency,
        action_widgets: result.action_widgets || [],
        applicable_statutes: result.applicable_statutes || [],
        diagnostic_score: result.diagnostic_score || null,
        quick_replies: result.quick_replies || [],
        live_draft: result.live_draft || null,
      };

      if (result.live_draft) {
        setActiveLiveDraft(result.live_draft);
      }

      setMessages((prev) => [...prev, assistantMsg]);
      playTTS(result.answer);
    } catch (apiError) {
      setError(getApiError(apiError));
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: t('chat.errorMsg') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnosticComplete = (diagnosticScore, cat, dist) => {
    setIsDiagnosticOpen(false);
    const diagnosticMessage = {
      role: 'assistant',
      text: isKn
        ? `### 🩺 ಪ್ರಕರಣ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ (${dist} ಜಿಲ್ಲೆ)\n\nನೀವು ಒದಗಿಸಿದ ವಿವರಗಳ ಆಧಾರದ ಮೇಲೆ, ನಿಮ್ಮ ಪ್ರಕರಣದ ಪ್ರಾಥಮಿಕ ಸಾಮರ್ಥ್ಯವನ್ನು **${diagnosticScore.strength_score}%** ಎಂದು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗಿದೆ. ಕಾನೂನು ಕಾಯಿದೆಗಳು ಹಾಗೂ ಪ್ರಕ್ರಿಯೆಗಳ ವಿವರಗಳನ್ನು ಕೆಳಗೆ ನೀಡಲಾಗಿದೆ.`
        : `### 🩺 Case Health Diagnostic Completed (${dist} District)\n\nBased on your answers, your case viability has been assessed with a **${diagnosticScore.strength_score}%** initial strength score. Key statutory requirements, evidence checklist, and actionable next steps are presented below.`,
      diagnostic_score: diagnosticScore,
      action_widgets: [
        {
          id: 'diag-draft',
          type: 'draft_document',
          title: `Draft Legal Representation (${cat.toUpperCase()})`,
          title_kn: `ಕಾನೂನು ಅರ್ಜಿ ಸಿದ್ಧಪಡಿಸಿ (${cat})`,
          description: 'Create a pre-filled High Court complaint or legal notice ready for submission.',
          description_kn: 'ಸಲ್ಲಿಸಲು ಸಿದ್ಧವಾಗಿರುವ ದೂರು ಅಥವಾ ನೋಟಿಸ್ ಸಿದ್ಧಪಡಿಸಿ.',
          target_url: `/document-generator?type=${encodeURIComponent(cat)}`,
          action_label: 'Draft Document ↗',
          action_label_kn: 'ದಾಖಲೆ ರಚಿಸಿ ↗',
          badge: 'Pre-filled Template',
          icon: 'FileText'
        },
        {
          id: 'diag-dlsa',
          type: 'legal_aid',
          title: `Free Legal Aid Clinic (${dist})`,
          title_kn: `ಉಚಿತ ಕಾನೂನು ನೆರವು ಕ್ಲಿನಿಕ್ (${dist})`,
          description: `Access panel advocates at the ${dist} District Legal Services Authority.`,
          description_kn: `${dist} ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವೆಗಳ ಪ್ರಾಧಿಕಾರದ ಉಚಿತ ವಕೀಲರ ನೆರವು ಪಡೆಯಿರಿ.`,
          target_url: `/directory?district=${encodeURIComponent(dist)}&type=dlsa`,
          action_label: 'View DLSA Office ↗',
          action_label_kn: 'ಡಿಎಲ್‌ಎಸ್‌ಎ ಕಚೇರಿ ↗',
          badge: 'Local Clinic',
          icon: 'Building2'
        }
      ],
      applicable_statutes: [
        {
          act: 'Legal Services Authorities Act, 1987',
          section: 'Section 12 & 19 (Lok Adalat & Free Legal Aid)',
          summary: 'Statutory right to free advocate assistance and zero court fees for eligible citizens and Lok Adalat settlements.',
          summary_kn: 'ಅರ್ಹ ನಾಗರಿಕರಿಗೆ ಉಚಿತ ವಕೀಲರ ಸೇವೆ ಮತ್ತು ಲೋಕ ಅದಾಲತ್‌ನಲ್ಲಿ ಶುಲ್ಕ ರಹಿತ ರಾಜಿ ಸಂಧಾನದ ಸಾಂವಿಧಾನಿಕ ಹಕ್ಕು.'
        }
      ]
    };
    setMessages((prev) => [...prev, diagnosticMessage]);
  };

  const submit = (event) => {
    event.preventDefault();
    handleSendQuery();
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 shadow-xl">
      {/* Header */}
      <div className="border-b border-white/10 bg-navy-900 p-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-legalGold text-navy-950 font-bold">
              <Bot className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-2xl font-bold">{t('chat.title')}</h3>
                <span className="rounded-full bg-legalGold/20 px-2 py-0.5 text-[10px] font-bold text-legalGold border border-legalGold/40">
                  Nyaya Mitra AI
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">{t('chat.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Split Workspace Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSplitView(!isSplitView)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all shadow-sm ${
                isSplitView
                  ? 'border-legalGold bg-legalGold text-navy-950 shadow-md'
                  : 'border-white/20 bg-navy-950/80 text-white hover:border-legalGold/50'
              }`}
              title="Toggle Live Auto-Draft Split Workspace (Plan A)"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{isSplitView ? (isKn ? 'ಸ್ಪ್ಲಿಟ್ ಸಕ್ರಿಯ' : 'Split Workspace On') : (isKn ? 'ಸ್ಪ್ಲಿಟ್ ಬೋರ್ಡ್' : 'Split View')}</span>
            </button>

            {/* Quick Diagnostic Assessment Trigger */}
            <button
              type="button"
              onClick={() => setIsDiagnosticOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-legalGold/40 bg-navy-950/80 hover:bg-legalGold hover:text-navy-950 px-3.5 py-2 text-xs font-bold text-legalGold transition-all shadow-sm"
              title="Run 30-second case viability test"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t('chat.diagnoseBtn')}</span>
            </button>

            <label className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300">
                <Languages className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <select
                className="rounded-xl border border-white/20 bg-navy-950 px-3 py-2 text-xs text-white outline-none focus:border-legalGold"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="English">{t('chat.english')}</option>
                <option value="Kannada">{t('chat.kannada')}</option>
                <option value="Kannada + English">{t('chat.kannadaEnglish')}</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className={`grid gap-0 ${isSplitView && activeLiveDraft ? 'lg:grid-cols-[220px_1fr_360px]' : 'lg:grid-cols-[280px_1fr]'}`}>
        {/* Suggested Categories Sidebar */}
        <aside className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-900/50 p-4 lg:border-b-0 lg:border-r">
          <p className="text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wider">
            {t('chat.suggestedCategories')}
          </p>
          <div className="mt-3 grid gap-2">
            {legalCategories.map((item) => (
              <button
                className={`rounded-xl border px-3.5 py-3 text-left transition-all ${
                  category === item.title
                    ? 'border-legalGold bg-white dark:bg-navy-900 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-navy-950/50 hover:border-legalGold'
                }`}
                key={item.title}
                onClick={() => chooseCategory(item)}
                type="button"
              >
                <span className="block text-xs font-bold text-navy-900 dark:text-white">{item.title}</span>
                <span className="mt-1 block text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                  {item.examples}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-legalGold/30 bg-legalGold/5 dark:bg-legalGold/10 p-3 text-xs">
            <span className="font-bold text-navy-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-legalGold" />
              {isKn ? 'ಸ್ವಯಂ ಪ್ರಕರಣ ವಿಶ್ಲೇಷಣೆ' : 'Diagnostic Intake'}
            </span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('chat.quizPrompt')}
            </p>
            <button
              type="button"
              onClick={() => setIsDiagnosticOpen(true)}
              className="mt-2.5 w-full rounded-lg bg-navy-900 dark:bg-legalGold px-3 py-1.5 text-[11px] font-bold text-white dark:text-navy-950 hover:opacity-90 transition-opacity"
            >
              {t('chat.diagnoseBtn')}
            </button>
          </div>
        </aside>

        {/* Chat Thread */}
        <div>
          <div className="max-h-[580px] min-h-[440px] space-y-5 overflow-y-auto bg-white dark:bg-navy-950 p-5">
            {messages.map((message, index) => (
              <article
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                key={`${message.role}-${index}`}
              >
                {message.role === 'assistant' ? (
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-legalGold/10 text-legalGold border border-legalGold/30">
                    <Scale className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}

                <div
                  className={`max-w-2xl rounded-2xl border p-4 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'border-navy-800 bg-navy-800 text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-900 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {/* Emergency SOS Banner */}
                  {message.role === 'assistant' && (message.urgency === 'high' || message.urgency === 'emergency') && (
                    <div className="mb-3 rounded-xl border border-red-300 dark:border-red-800 bg-red-100/90 dark:bg-red-950/80 p-3 text-red-900 dark:text-red-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 animate-bounce text-red-600" />
                        <span className="text-xs font-black uppercase tracking-wider">
                          {isKn ? 'ಕರ್ನಾಟಕ ತುರ್ತು ರಕ್ಷಣಾ ಸಹಾಯವಾಣಿಗಳು' : 'Immediate Emergency Assistance (Karnataka)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <a
                          href="tel:112"
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1 font-bold text-white hover:bg-red-700 shadow"
                        >
                          <Phone className="h-3 w-3" /> 112 {isKn ? 'ಪೊಲೀಸ್' : 'Police'}
                        </a>
                        <a
                          href="tel:181"
                          className="inline-flex items-center gap-1 rounded-lg bg-pink-700 px-3 py-1 font-bold text-white hover:bg-pink-800 shadow"
                        >
                          <Heart className="h-3 w-3" /> 181 {isKn ? 'ವನಿತಾ ಸಹಾಯವಾಣಿ' : 'Women Helpline'}
                        </a>
                        <a
                          href="tel:1098"
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1 font-bold text-white hover:bg-amber-700 shadow"
                        >
                          1098 {isKn ? 'ಮಕ್ಕಳ ಸಹಾಯವಾಣಿ' : 'Childline'}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Formatted Markdown Content */}
                  <FormattedMessage text={message.text} />

                  {/* Diagnostic Score Assessment */}
                  {message.role === 'assistant' && message.diagnostic_score && (
                    <DiagnosticScoreCard score={message.diagnostic_score} isKn={isKn} />
                  )}

                  {/* Applicable Statutes (BNS / BNSS / Karnataka Acts) */}
                  {message.role === 'assistant' && message.applicable_statutes && message.applicable_statutes.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Scale className="h-3.5 w-3.5 text-legalGold" />
                        {t('chat.statutesTitle')}
                      </p>
                      <div className="grid gap-2">
                        {message.applicable_statutes.map((statute, sIdx) => (
                          <StatuteCard key={sIdx} statute={statute} isKn={isKn} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generative Interactive Action Widgets */}
                  {message.role === 'assistant' && message.action_widgets && message.action_widgets.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-legalGold" />
                        {t('chat.actionsTitle')}
                      </p>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {message.action_widgets.map((widget) => (
                          <ActionCard
                            key={widget.id || widget.title}
                            widget={widget}
                            isKn={isKn}
                            onAction={handleActionClick}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dynamic 1-Tap Quick-Reply Suggestion Chips */}
                  {message.role === 'assistant' && message.quick_replies && message.quick_replies.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <span>⚡</span> {isKn ? 'ತ್ವರಿತ ಆಯ್ಕೆಗಳು (1-ಟ್ಯಾಪ್ ಪ್ರತ್ಯುತ್ತರ)' : 'Quick Options (1-Tap Reply)'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {message.quick_replies.map((reply, rIdx) => (
                          <button
                            key={rIdx}
                            type="button"
                            onClick={() => handleSendQuery(reply)}
                            className="rounded-full border border-legalGold/40 bg-white dark:bg-navy-950 text-navy-900 dark:text-legalGold hover:bg-legalGold hover:text-navy-950 px-3 py-1 text-xs font-semibold transition-all shadow-sm flex items-center gap-1 active:scale-95"
                          >
                            <span>{reply}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Text-to-Speech audio button */}
                  {message.role === 'assistant' && (
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-2">
                      <button
                        onClick={() => playTTS(message.text)}
                        className="flex items-center gap-1.5 text-xs font-bold text-legalGold hover:text-yellow-500 transition-colors"
                        title="Listen to Sarvam Voice"
                      >
                        <Volume2 className="h-4 w-4" />
                        <span>{isKn ? 'ಧ್ವನಿಯಲ್ಲಿ ಆಲಿಸಿ (Sarvam Voice)' : 'Listen (Sarvam Voice)'}</span>
                      </button>

                      {message.provider && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Router: {message.provider} ({message.model})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Steps list if present */}
                  {message.steps ? (
                    <ul className="mt-3 grid gap-2 text-xs">
                      {message.steps.map((step) => (
                        <li className="border-l-2 border-legalGold pl-3" key={step}>{step}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {message.role === 'user' ? (
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-legalGold text-navy-950 font-bold">
                    <UserRound className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : null}
              </article>
            ))}

            {loading ? (
              <div className="flex items-center gap-2 rounded-xl bg-navy-50 dark:bg-navy-900 p-3 text-xs font-bold text-navy-900 dark:text-white">
                <Loader2 className="h-4 w-4 animate-spin text-legalGold" />
                <span>{t('chat.loading')}</span>
              </div>
            ) : null}

            {transcribing ? (
              <div className="flex items-center gap-2 rounded-xl bg-legalGold/10 p-3 text-xs font-bold text-legalGold">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isKn ? 'Sarvam AI ಧ್ವನಿಯನ್ನು ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸುತ್ತಿದೆ...' : 'Sarvam AI is transcribing your speech...'}</span>
              </div>
            ) : null}

            {error ? (
              <p className="rounded-xl bg-red-50 dark:bg-red-900/30 p-3 text-xs font-semibold text-alertRed dark:text-red-400">
                {error}
              </p>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Form */}
          <form className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-900 p-4" onSubmit={submit}>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-navy-900 dark:text-white outline-none focus:border-legalGold"
                placeholder={
                  isRecording
                    ? (isKn ? 'ಮಾತನಾಡಿ, ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ...' : 'Speaking... (recording audio)')
                    : t('chat.placeholder')
                }
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              {/* Sarvam Speech-to-Text Microphone Button */}
              {isRecording ? (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-0.5 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] animate-pulse shadow-lg min-w-[60px]"
                  title="Stop recording"
                >
                  <MicOff className="h-5 w-5" />
                  <span>{recordingSecs}s</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  disabled={transcribing || loading}
                  className="p-3 rounded-xl bg-slate-200 dark:bg-navy-800 hover:bg-legalGold hover:text-navy-950 text-slate-700 dark:text-white font-bold text-xs flex items-center justify-center transition-all disabled:opacity-50"
                  title={isKn ? 'Sarvam AI ಧ್ವನಿ ಇನ್‌ಪುಟ್' : 'Sarvam AI Voice Input'}
                >
                  <Mic className="h-5 w-5" />
                </button>
              )}

              <button
                className="premium-btn premium-btn-gold text-xs px-5 py-3 flex items-center gap-2 disabled:opacity-60"
                disabled={loading || transcribing}
                type="submit"
              >
                <SendHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>{loading ? t('chat.asking') : t('chat.ask')}</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{t('disclaimer')}</p>
          </form>
        </div>

        {/* Right Column: Live Legal Strategy Board & Document Auto-Draft (Plan A) */}
        {isSplitView && activeLiveDraft && (
          <aside className="border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-navy-900/80 p-4 flex flex-col justify-between overflow-y-auto max-h-[680px]">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-legalGold text-navy-950 font-bold text-xs">⚖️</span>
                  <h4 className="font-bold text-xs text-navy-900 dark:text-white uppercase tracking-wider">
                    {isKn ? 'ಲೈವ್ ಕಾರ್ಯತಂತ್ರ ಬೋರ್ಡ್' : 'Live Strategy Board'}
                  </h4>
                </div>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Live sync" />
              </div>

              {/* Case Standing & Fee HUD */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 p-3 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {isKn ? 'ಪ್ರಕರಣದ ಸಾಮರ್ಥ್ಯ (Merit)' : 'Merit Assessment'}
                  </span>
                  <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                    {activeLiveDraft.merit_score || 78}% Strong
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-legalGold to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${activeLiveDraft.merit_score || 78}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">{isKn ? 'ನ್ಯಾಯಾಲಯ ಮಟ್ಟ' : 'Forum'}</span>
                    <strong className="text-navy-900 dark:text-white truncate block text-[11px]">
                      {activeLiveDraft.court_level || 'Jurisdictional Court'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{isKn ? 'ಕಾಲಮಿತಿ' : 'Limitation'}</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 block text-[11px]">
                      {activeLiveDraft.limitation || 'Within Limit'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Live Document Auto-Draft */}
              <div className="rounded-xl border border-legalGold/40 bg-white dark:bg-navy-950 p-3.5 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-legalGold" />
                    {isKn && activeLiveDraft.title_kn ? activeLiveDraft.title_kn : activeLiveDraft.title}
                  </span>
                  <span className="rounded bg-legalGold/15 text-legalGold text-[10px] font-mono px-1.5 py-0.5 font-bold">
                    {activeLiveDraft.completion || 65}% Draft
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-navy-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-serif leading-relaxed text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto whitespace-pre-wrap select-text shadow-inner">
                  {activeLiveDraft.preview_text}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(activeLiveDraft.preview_text);
                      setCopiedDraft(true);
                      setTimeout(() => setCopiedDraft(false), 2000);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 px-2 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    {copiedDraft ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedDraft ? (isKn ? 'ನಕಲಿಸಲಾಗಿದೆ' : 'Copied!') : (isKn ? 'ಪ್ರತಿಮಾಡಿ' : 'Copy Draft')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/document-generator?type=${activeLiveDraft.doc_type || 'legal_notice'}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-navy-900 dark:bg-legalGold hover:bg-navy-800 dark:hover:bg-yellow-500 px-2 py-1.5 text-[11px] font-bold text-white dark:text-navy-950 transition-colors shadow-sm"
                  >
                    <span>{isKn ? 'ಸಂಪಾದಕ ತೆರೆಯಿರಿ ↗' : 'Full Editor ↗'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 text-center">
              <span>{isKn ? 'ಕರ್ನಾಟಕ ನ್ಯಾಯ ಮಿತ್ರ ಸ್ವಯಂ ದಾಖಲಾತಿ ಕೋ-ಪೈಲಟ್' : 'Karnataka Nyaya Mitra Real-Time Drafting Co-Pilot'}</span>
            </div>
          </aside>
        )}
      </div>

      {/* Interactive Case Health Diagnostic Modal */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        onComplete={handleDiagnosticComplete}
        isKn={isKn}
      />
    </section>
  );
}
