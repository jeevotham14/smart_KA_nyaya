import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Building2, CheckCircle2, FileText, Gavel,
  Landmark, MessageSquare, Scale, Search, Shield, ShieldAlert, Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AlertBanner from '../components/AlertBanner.jsx';
import AnimatedSection from '../components/AnimatedSection.jsx';
import GlassCard from '../components/GlassCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import { services } from '../data/mockData.js';

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
  const isKn = i18n.language === 'kn';

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
      {/* ── Hero ── */}
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-legalGold/3 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:py-36 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
              <Scale className="h-3.5 w-3.5" /> {isKn ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ — ಸಾರ್ವಜನಿಕ ಕಾನೂನು ಸೇವಾ ಪೋರ್ಟಲ್' : 'Government of Karnataka'}
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {isKn ? 'ಪ್ರತಿಯೊಬ್ಬ ನಾಗರಿಕನಿಗೂ ' : 'Justice Made Simple '}
              <span className="bg-gradient-to-r from-legalGold to-yellow-300 bg-clip-text text-transparent">
                {isKn ? 'ಸರಳ ನ್ಯಾಯ ವ್ಯವಸ್ಥೆ' : 'for Every Citizen'}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              {isKn
                ? 'ಕರ್ನಾಟಕದ ಜನತೆಗಾಗಿ AI-ಬೆಂಬಲಿತ ಕಾನೂನು ಮಾರ್ಗದರ್ಶನ, ದಾಖಲೆ ಕರಡು ಸಿದ್ಧತೆ, ಪ್ರಕರಣ ಟ್ರ್ಯಾಕಿಂಗ್ ಮತ್ತು ಉಚಿತ ಕಾನೂನು ನೆರವು.'
                : 'AI-powered legal guidance, document generation, case tracking, and legal support for the people of Karnataka.'}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/ai-legal-guidance" className="premium-btn premium-btn-gold text-base">
                {isKn ? 'ಕಾನೂನು ಸಹಾಯ ಪ್ರಾರಂಭಿಸಿ' : 'Start Legal Assistance'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/case-tracker" className="premium-btn premium-btn-secondary !border-white/20 !text-white hover:!border-legalGold hover:!text-legalGold text-base">
                {isKn ? 'ಪ್ರಕರಣ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ' : 'Track My Case'}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafb] dark:from-navy-950 to-transparent" />
      </section>

      {/* ── Stats Bar ── */}
      <AnimatedSection>
        <section className="relative -mt-8 z-10">
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