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
      <p className="font-display text-4xl font-extrabold tracking-tight text-navy-900 md:text-5xl">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();

  const actions = [
    [t('home.actionAI'), '/ai-legal-guidance'],
    [t('home.actionAid'), '/legal-aid'],
    [t('home.actionWomen'), '/women-protection'],
    [t('home.actionDirectory'), '/directory'],
  ];

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
      title: 'Describe Your Issue',
      desc: 'Tell us about your legal problem in plain language — in English or Kannada.',
    },
    {
      icon: Zap,
      title: 'AI Analyzes',
      desc: 'Our AI identifies applicable laws, rights, and recommends the best course of action.',
    },
    {
      icon: FileText,
      title: 'Get Guidance & Documents',
      desc: 'Receive step-by-step guidance, generate legal documents, and connect with authorities.',
    },
  ];

  const quickActions = [
    { icon: Shield, title: 'Emergency Help', desc: 'Immediate legal assistance for urgent situations', path: '/women-protection', color: 'text-alertRed' },
    { icon: FileText, title: 'Generate Documents', desc: 'Create complaints, notices, and legal applications', path: '/document-generator', color: 'text-legalGold' },
    { icon: Scale, title: 'Check Legal Aid', desc: 'Find out if you qualify for free legal services', path: '/legal-aid', color: 'text-aidGreen' },
    { icon: Search, title: 'Track Your Case', desc: 'Monitor case status, hearings, and timelines', path: '/case-tracker', color: 'text-navy-700' },
  ];

  return (
    <>
      {/* ── Premium Hero ── */}
      <section className="hero-gradient-bg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-legalGold/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-legalGold/3 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:py-36 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-legalGold/30 bg-legalGold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-legalGold">
              <Scale className="h-3.5 w-3.5" /> Government of Karnataka
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Justice Made Simple{' '}
              <span className="bg-gradient-to-r from-legalGold to-yellow-300 bg-clip-text text-transparent">
                for Every Citizen
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              AI-powered legal guidance, document generation, case tracking, and legal support for the people of Karnataka.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/ai-legal-guidance" className="premium-btn premium-btn-gold text-base">
                Start Legal Assistance
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/case-tracker" className="premium-btn premium-btn-secondary !border-white/20 !text-white hover:!border-legalGold hover:!text-legalGold text-base">
                Track My Case
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafb] to-transparent" />
      </section>

      {/* ── Stats Bar ── */}
      <AnimatedSection>
        <section className="relative -mt-8 z-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="glass-card grid grid-cols-2 gap-6 p-8 md:grid-cols-4 md:gap-8">
              <StatItem value={50000} suffix="+" label="Citizens Helped" />
              <StatItem value={31} label="Districts Covered" />
              <StatItem value={24} suffix="/7" label="AI Support" />
              <StatItem value={100} suffix="%" label="Free to Use" />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── How It Works ── */}
      <AnimatedSection delay={100}>
        <section className="bg-surface py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-legalGold">Simple & Effective</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-slate-500">
                Get legal guidance in three simple steps — no legal knowledge required.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {howItWorks.map((step, i) => (
                <div key={step.title} className="card-premium p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-50">
                    <step.icon className="h-7 w-7 text-legalGold" />
                  </div>
                  <div className="mt-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-legalGold/10 text-xs font-bold text-legalGold">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Quick Actions ── */}
      <AnimatedSection delay={150}>
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-legalGold">Quick Access</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
                What Would You Like To Do?
              </h2>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link key={action.path} to={action.path} className="card-premium group p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 transition-colors group-hover:bg-navy-50 ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-navy-900">{action.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500">{action.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-legalGold opacity-0 transition-opacity group-hover:opacity-100">
                    Get Started <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Existing Services Section (preserved) ── */}
      <AnimatedSection delay={200}>
        <section className="bg-surface py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow={t('home.servicesEyebrow')} title={t('home.servicesTitle')}>
              {t('home.servicesDesc')}
            </SectionHeader>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {translatedServices.map((service) => (
                <ServiceCard key={service.path} {...service} />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── Existing Legal Awareness Section (preserved) ── */}
      <AnimatedSection delay={100}>
        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <SectionHeader eyebrow={t('home.awarenessEyebrow')} title={t('home.awarenessTitle')}>
              {t('home.awarenessDesc')}
            </SectionHeader>
            <div className="grid gap-4 md:grid-cols-2">
              {[t('home.tip1'), t('home.tip2'), t('home.tip3'), t('home.tip4')].map((item) => (
                <div className="card-premium p-5" key={item}>
                  <ShieldAlert className="h-6 w-6 text-legalGold" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold leading-6 text-navy-900">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ── CTA Section ── */}
      <AnimatedSection>
        <section className="bg-navy-900 py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Get Legal Assistance?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              Start a conversation with our AI legal assistant. Free, confidential, and available 24/7 in English and Kannada.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/ai-legal-guidance" className="premium-btn premium-btn-gold text-base">
                Start Legal Assistance
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/resources" className="premium-btn premium-btn-secondary !border-white/20 !text-white hover:!border-legalGold hover:!text-legalGold text-base">
                <BookOpen className="h-4 w-4" />
                Browse Resources
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AlertBanner />
    </>
  );
}