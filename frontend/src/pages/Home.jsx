import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, FileText, Mic, Scale, Shield, Zap, Loader2, Sparkles, MessageSquare
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AlertBanner from '../components/AlertBanner.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import GlassCard from '../components/GlassCard.jsx';
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
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isKn ? 'ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ.' : 'Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isKn ? 'kn-IN' : 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setSituationText('');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const currentText = finalTranscript || interimTranscript;
      setSituationText(currentText);
      
      if (finalTranscript.trim()) {
         setIsListening(false);
         recognition.stop();
         navigate(`/ai-legal-guidance?q=${encodeURIComponent(finalTranscript.trim())}`);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert(isKn ? 'ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು ನೀಡಿ.' : 'Please allow microphone access to use voice search.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

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

  // 3-card "What We Do" section — focused, not a feature dump
  const whatWeDo = [
    {
      icon: Scale,
      color: 'text-legalGold bg-legalGold/10',
      title: isKn ? 'AI ಕಾನೂನು ಮಾರ್ಗದರ್ಶನ' : 'AI Legal Guidance',
      desc: isKn
        ? 'ನಿಮ್ಮ ಸನ್ನಿವೇಶ ವಿವರಿಸಿ — AI ಅನ್ವಯವಾಗುವ ಕಾನೂನು, ಹಕ್ಕುಗಳು ಮತ್ತು ತಕ್ಷಣದ ಮುಂದಿನ ಹೆಜ್ಜೆಗಳನ್ನು ಸ್ಪಷ್ಟ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸುತ್ತದೆ.'
        : 'Describe your situation and our AI instantly explains applicable laws, your rights, and the clearest next steps in plain language.',
      path: '/ai-legal-guidance',
      cta: isKn ? 'ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ' : 'Get Guidance',
    },
    {
      icon: Shield,
      color: 'text-alertRed bg-red-50 dark:bg-red-900/20',
      title: isKn ? 'ಮಹಿಳಾ ಸಂರಕ್ಷಣೆ' : 'Women Protection',
      desc: isKn
        ? 'DV ಕಾಯ್ದೆ, POCSO, ಗೃಹ ಹಿಂಸೆ — ನಿಮ್ಮ ಜಿಲ್ಲೆಯಲ್ಲಿ ಹತ್ತಿರದ ಸುರಕ್ಷತಾ ಕೇಂದ್ರಗಳು ಮತ್ತು ತುರ್ತು ಸಂಖ್ಯೆಗಳನ್ನು ತಕ್ಷಣ ಪಡೆಯಿರಿ.'
        : 'DV Act, POCSO, domestic violence — instantly find nearby safety centres in your district and emergency numbers.',
      path: '/women-protection',
      cta: isKn ? 'ಸಹಾಯ ಪಡೆಯಿರಿ' : 'Get Help Now',
    },
    {
      icon: FileText,
      color: 'text-aidGreen bg-green-50 dark:bg-green-900/20',
      title: isKn ? 'ಉಚಿತ ಕಾನೂನು ನೆರವು' : 'Free Legal Aid',
      desc: isKn
        ? 'Section 12 LSA 1987 ಅಡಿ ಅರ್ಹತೆ ತಕ್ಷಣ ತಿಳಿಯಿರಿ ಮತ್ತು ನಿಮ್ಮ ಜಿಲ್ಲಾ ಕಾನೂನು ಸೇವಾ ಪ್ರಾಧಿಕಾರಕ್ಕೆ DLSA ಅರ್ಜಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.'
        : 'Check your eligibility under Section 12 LSA 1987 instantly, then download a DLSA application for your district.',
      path: '/legal-aid',
      cta: isKn ? 'ಅರ್ಹತೆ ಪರೀಕ್ಷಿಸಿ' : 'Check Eligibility',
    },
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
                  className="w-full py-4 pl-5 pr-44 text-sm md:text-base text-white placeholder-slate-400 bg-transparent focus:outline-none"
                />
                <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={startListening}
                    className={`p-2.5 rounded-xl transition-colors ${isListening ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-slate-400 hover:text-legalGold hover:bg-legalGold/10'}`}
                    title={isKn ? 'ಧ್ವನಿ ಮೂಲಕ ಕೇಳಿ' : 'Ask via Voice'}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={classifying || !situationText.trim()}
                    className="h-full px-5 rounded-xl bg-gradient-to-r from-legalGold to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-navy-950 font-bold text-sm flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
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
            <div className="glass-card grid grid-cols-1 gap-6 p-8 md:grid-cols-3 md:gap-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
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

      {/* ── What We Do — 3 focused cards ── */}
      <AnimatedSection>
        <section className="py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-legalGold">
                {isKn ? 'ಸೇವೆಗಳು' : 'What We Do'}
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
                {isKn ? 'ನಿಮಗೆ ಬೇಕಾದ ಕಾನೂನು ನೆರವು' : 'Legal help that actually reaches you'}
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {whatWeDo.map((card, i) => {
                const Icon = card.icon;
                return (
                  <Link key={i} to={card.path} className="group">
                    <GlassCard className="h-full p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-legalGold">
                      <div className={`mb-5 flex h-13 w-13 items-center justify-center rounded-2xl ${card.color} p-3`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white group-hover:text-legalGold transition-colors">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 flex-1">
                        {card.desc}
                      </p>
                      <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-legalGold group-hover:translate-x-1 transition-transform">
                        <span>{card.cta}</span>
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

    </>
  );
}