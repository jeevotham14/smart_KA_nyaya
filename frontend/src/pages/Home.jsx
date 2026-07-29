import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Building2, CheckCircle2, FileText, Gavel,
  Landmark, MessageSquare, Scale, Search, Shield, ShieldAlert, Zap, Loader2, Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AlertBanner from '../components/AlertBanner.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import GlassCard from '../components/GlassCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import { services } from '../data/mockData.js';
import { legalApi } from '../services/api.js';

/* ── Animated counter hook ── */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatItem({ value, suffix = '', label }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-4xl font-extrabold tracking-tight text-navy-900 dark:text-white md:text-5xl">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isKn = i18n.language === 'kn';

  // Hero classifier state
  const [situationText, setSituationText] = useState('');
  const [classifying, setClassifying] = useState(false);
  const [classifyResult, setClassifyResult] = useState(null);
  const [error, setError] = useState('');

  const handleHeroClassify = async (e) => {
    e.preventDefault();
    if (!situationText.trim()) return;
    setClassifying(true);
    setError('');
    setClassifyResult(null);
    try {
      const res = await legalApi.classifyDocument({
        text: situationText.trim(),
        language: isKn ? 'kn' : 'en',
      });
      setClassifyResult(res);
    } catch (err) {
      console.error('Hero classification failed', err);
      // Fallback redirect to AI guidance if API fails
      navigate(`/ai-legal-guidance?q=${encodeURIComponent(situationText)}`);
    } finally {
      setClassifying(false);
    }
  };

  const translatedServices = [
    { ...services[0], title: t('services.aiGuidance'), description: t('services.aiGuidanceDesc') },
    { ...services[1], title: t('services.womenProtection'), description: t('services.womenProtectionDesc') },
    { ...services[2], title: t('services.freeLegalAid'), description: t('services.freeLegalAidDesc') },
    { ...services[3], title: t('services.documentAssistance'), description: t('services.documentAssistanceDesc') },
    { ...services[4], title: t('services.directoryLocator'), description: t('services.directoryLocatorDesc') },
    { ...services[5], title: t('services.caseTracking'), description: t('services.caseTrackingDesc') },
  ];

  const howItWorks = [
    {
      icon: MessageSquare,
      title: isKn ? 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ' : 'Describe Your Issue',
      desc: isKn ? 'ನಿಮ್ಮ ಕಾನೂನು ಸಮಸ್ಯೆಯನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ — ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ತಿಳಿಸಿ.' : 'Tell us about your legal problem in plain language — in English or Kannada.',
    },
    {
      icon: Zap,
      title: isKn ? 'AI ವಿಶ್ಲೇಷಣೆ' : 'AI Analyzes',
      desc: isKn ? 'ನಮ್ಮ AI ಅನ್ವಯವಾಗುವ ಕಾನೂನುಗಳು, ಹಕ್ಕುಗಳು ಮತ್ತು ಉತ್ತಮ ಮುಂದಿನ ಹೆಜ್ಜೆಯನ್ನು ಗುರುತಿಸುತ್ತದೆ.' : 'Our AI identifies applicable laws, rights, and recommends the best course of action.',
    },
    {
      icon: FileText,
      title: isKn ? 'ಮಾರ್ಗದರ್ಶನ & ದಾಖಲೆಗಳನ್ನು ಪಡೆಯಿರಿ' : 'Get Guidance & Documents',
      desc: isKn ? 'ಹಂತ-ಹಂತದ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ, ಕಾನೂನು ದಾಖಲೆಗಳನ್ನು ರಚಿಸಿ, ಮತ್ತು ಪ್ರಾಧಿಕಾರಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.' : 'Receive step-by-step guidance, generate legal documents, and connect with authorities.',
    },
  ];

  const quickActions = [
    { icon: Shield, title: isKn ? 'ತುರ್ತು ಸಹಾಯ' : 'Emergency Help', desc: isKn ? 'ತುರ್ತು ಸನ್ನಿವೇಶಗಳಿಗೆ ತಕ್ಷಣದ ಕಾನೂನು ಮತ್ತು ಸುರಕ್ಷತೆ ಸಹಾಯ' : 'Immediate legal assistance for urgent situations', path: '/women-protection', color: 'text-alertRed' },
    { icon: FileText, title: isKn ? 'ದಾಖಲೆಗಳನ್ನು ರಚಿಸಿ' : 'Generate Documents', desc: isKn ? 'ದೂರುಗಳು, ನೋಟೀಸ್‌ಗಳು ಮತ್ತು ಕಾನೂನು ಅರ್ಜಿಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ' : 'Create complaints, notices, and legal applications', path: '/document-generator', color: 'text-legalGold' },
    { icon: Scale, title: isKn ? 'ಕಾನೂನು ನೆರವು ಪರಿಶೀಲಿಸಿ' : 'Check Legal Aid', desc: isKn ? 'ಉಚಿತ ಕಾನೂನು ಸೇವೆಗಳಿಗೆ ನಿಮ್ಮ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ' : 'Find out if you qualify for free legal services', path: '/legal-aid', color: 'text-aidGreen' },
    { icon: Search, title: isKn ? 'ಪ್ರಕರಣ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track Your Case', desc: isKn ? 'ಪ್ರಕರಣದ ಸ್ಥಿತಿ, ವಿಚಾರಣೆ ದಿನಾಂಕಗಳು ಮತ್ತು ಸಮಯವನ್ನು ವೀಕ್ಷಿಸಿ' : 'Monitor case status, hearings, and timelines', path: '/case-tracker', color: 'text-navy-700 dark:text-blue-400' },
  ];

  return (
    <>
      {/* ── Hero with Situation Classifier ── */}
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-legalGold/3 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
              <Scale className="h-3.5 w-3.5" /> {isKn ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ — ಸಾರ್ವಜನಿಕ ಕಾನೂನು ಸೇವಾ ಪೋರ್ಟಲ್' : 'Government of Karnataka'}
            </p>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              {isKn ? 'ಪ್ರತಿಯೊಬ್ಬ ನಾಗರಿಕನಿಗೂ ' : 'Justice Made Simple '}
              <span className="bg-gradient-to-r from-legalGold to-yellow-300 bg-clip-text text-transparent">
                {isKn ? 'ಸರಳ ನ್ಯಾಯ ವ್ಯವಸ್ಥೆ' : 'for Every Citizen'}
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              {isKn
                ? 'ನಿಮ್ಮ ಸನ್ನಿವೇಶವನ್ನು ವಿವರಿಸಿ — AI ತಕ್ಷಣವೇ ಸರಿಯಾದ ಕಾನೂನು, ದಾಖಲೆ ಮತ್ತು ಪರಿಹಾರ ಮಾರ್ಗವನ್ನು ಸೂಚಿಸುತ್ತದೆ.'
                : 'Describe your situation below — AI instantly analyzes your legal rights, documents, and next steps.'}
            </p>

            {/* Situation Input Search Box */}
            <form onSubmit={handleHeroClassify} className="mt-8 relative max-w-2xl mx-auto">
              <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-legalGold/40 bg-navy-950/80 backdrop-blur-md">
                <input
                  type="text"
                  value={situationText}
                  onChange={(e) => setSituationText(e.target.value)}
                  placeholder={
                    isKn
                      ? 'ಉದಾ: ನನ್ನ ಭೂಮಿಯನ್ನು ಬೇರೆಯವರು ಅಕ್ರಮವಾಗಿ ಆಕ್ರಮಿಸಿಕೊಂಡಿದ್ದಾರೆ...'
                      : 'E.g., My landlord refused to return my security deposit...'
                  }
                  className="w-full py-4 pl-5 pr-32 text-sm md:text-base text-white placeholder-slate-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={classifying || !situationText.trim()}
                  className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-legalGold to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-navy-950 font-bold text-sm flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  {classifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>{isKn ? 'ವಿಶ್ಲೇಷಿಸಿ' : 'Analyze'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Instant AI Classification Result Box */}
            {classifyResult && (
              <div className="mt-6 text-left max-w-2xl mx-auto p-5 rounded-2xl bg-navy-900/90 border border-legalGold/60 shadow-2xl backdrop-blur-xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-legalGold" />
                    <span className="font-serif font-bold text-white text-base">
                      {isKn ? 'AI ಸನ್ನಿವೇಶ ವಿಶ್ಲೇಷಣೆ' : 'AI Situation Analysis'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-legalGold/20 text-legalGold uppercase tracking-wider">
                    {classifyResult.urgency_level || 'Normal'} Urgency
                  </span>
                </div>

                <p className="text-sm text-slate-200 mb-4 leading-relaxed">
                  {classifyResult.reasoning || (isKn ? 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ.' : 'Your situation has been analyzed.')}
                </p>

                {classifyResult.suggested_docs?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-bold text-legalGold uppercase tracking-wider">
                      {isKn ? 'ಶಿಫಾರಸು ಮಾಡಿದ ದಾಖಲೆಗಳು & ಕ್ರಮಗಳು:' : 'Recommended Documents & Actions:'}
                    </p>
                    {classifyResult.suggested_docs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl border border-white/10 transition-all cursor-pointer"
                        onClick={() => navigate(`/document-generator?doc=${doc.doc_type}`)}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-legalGold flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-white">{doc.title || doc.doc_type}</p>
                            <p className="text-xs text-slate-400">{doc.reason}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-legalGold bg-legalGold/10 px-2 py-1 rounded">
                          {doc.confidence || 90}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                  <Link
                    to={`/ai-legal-guidance?q=${encodeURIComponent(situationText)}`}
                    className="text-xs font-bold text-navy-950 bg-legalGold hover:bg-yellow-400 px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <span>{isKn ? 'ಸಂಪೂರ್ಣ AI ಮಾರ್ಗದರ್ಶನ' : 'Full AI Guidance'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to="/legal-aid"
                    className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <span>{isKn ? 'ಉಚಿತ ಕಾನೂನು ನೆರವು' : 'Free Legal Aid'}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#f8fafb] dark:from-navy-950 to-transparent" />
      </section>

      {/* ── Stats Bar ── */}
      <AnimatedSection>
        <section className="relative -mt-6 z-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="glass-card grid grid-cols-2 gap-6 p-8 md:grid-cols-4 md:gap-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
              <StatItem value={50000} suffix="+" label={isKn ? 'ನೆರವು ಪಡೆದ ನಾಗರಿಕರು' : 'Citizens Helped'} />
              <StatItem value={31} label={isKn ? 'ಒಳಗೊಂಡ ಜಿಲ್ಲೆಗಳು' : 'Districts Covered'} />
              <StatItem value={24} suffix="/7" label={isKn ? 'AI ಬೆಂಬಲ' : 'AI Support'} />
              <StatItem value={100} suffix="%" label={isKn ? 'ಉಚಿತ ಸಾರ್ವಜನಿಕ ಸೇವೆ' : 'Free Access'} />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Alert Banner ── */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AlertBanner />
        </div>
      </section>

      {/* ── Quick Action Cards ── */}
      <AnimatedSection>
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link key={i} to={action.path} className="group">
                    <GlassCard className="h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-legalGold">
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-navy-800 ${action.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white group-hover:text-legalGold transition-colors">
                        {action.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {action.desc}
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-legalGold group-hover:translate-x-1 transition-transform">
                        <span>{isKn ? 'ಸೇವೆ ಪ್ರಾರಂಭಿಸಿ' : 'Get Started'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Public Legal Assistance Services ── */}
      <AnimatedSection>
        <section className="py-16 md:py-24 bg-slate-100/50 dark:bg-navy-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow={t('home.servicesEyebrow')}
              title={t('home.servicesTitle')}
              description={t('home.servicesDesc')}
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {translatedServices.map((service, index) => (
                <ServiceCard key={service.path} {...service} index={index} />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── How It Works ── */}
      <AnimatedSection>
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow={isKn ? 'ಸರಳ ಪ್ರಕ್ರಿಯೆ' : 'Simple Process'}
              title={isKn ? 'ವೇದಿಕೆ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?' : 'How Smart Nyaya Works'}
              description={isKn ? 'ಕಾನೂನು ಜಾಗೃತಿ ಮತ್ತು ಸಹಾಯ ಪಡೆಯಲು ಮೂರು ಸರಳ ಹೆಜ್ಜೆಗಳು' : 'Three simple steps to access legal awareness and assistance'}
            />
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {howItWorks.map((step, i) => {
                const Icon = step.icon;
                return (
                  <GlassCard key={i} className="relative p-8 text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-legalGold text-navy-950 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="mx-auto mb-6 mt-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-legalGold/10 text-legalGold">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {step.desc}
                    </p>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>
    </>
  );
}