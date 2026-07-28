import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bell, BookOpen, Calendar, ChevronRight, ClipboardList,
  FileText, Loader2, MessageSquare, Scale, Shield, TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnimatedSection from '../components/AnimatedSection.jsx';
import DashboardCard from '../components/DashboardCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { dashboardCards } from '../data/mockData.js';

export default function UserDashboard() {
  const { t } = useTranslation();

  const translatedCards = [
    { ...dashboardCards[0], label: t('dashCards.recentQueries'), icon: MessageSquare },
    { ...dashboardCards[1], label: t('dashCards.complaints'), icon: ClipboardList },
    { ...dashboardCards[2], label: t('dashCards.generatedDocs'), icon: FileText },
    { ...dashboardCards[3], label: t('dashCards.legalAidApps'), icon: Shield },
  ];

  const quickLinks = [
    { label: 'AI Legal Guidance', desc: 'Get instant AI-powered legal assistance', path: '/ai-legal-guidance', icon: MessageSquare, color: 'text-legalGold' },
    { label: 'Guided Intake', desc: 'Step-by-step issue assessment', path: '/guided-intake', icon: ClipboardList, color: 'text-aidGreen' },
    { label: 'Generate Documents', desc: 'Create legal documents', path: '/document-generator', icon: FileText, color: 'text-navy-700' },
    { label: 'Track Case', desc: 'Monitor your case status', path: '/case-tracker', icon: Scale, color: 'text-legalGold' },
  ];

  return (
    <section className="min-h-screen bg-surface py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-legalGold">Citizen Dashboard</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-navy-900 dark:text-white">{t('userDash.title')}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{t('userDash.desc')}</p>
          </div>
        </AnimatedSection>

        {/* Metrics Cards */}
        <AnimatedSection delay={50}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {translatedCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-navy-50 dark:bg-navy-800">
                    {card.icon ? <card.icon className="h-5 w-5 text-legalGold" /> : <TrendingUp className="h-5 w-5 text-legalGold" />}
                  </div>
                  <span className="text-2xl font-extrabold text-navy-900 dark:text-white">{card.value}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">{card.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Quick Links */}
        <AnimatedSection delay={100}>
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-navy-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-4 shadow-sm glass-panel group flex items-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-navy-800 transition-colors group-hover:bg-navy-50 dark:group-hover:bg-navy-700 ${link.color}`}>
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-navy-900 dark:text-white">{link.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{link.desc}</p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-legalGold transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Recent Activity */}
        <AnimatedSection delay={150}>
          <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
            <h3 className="font-display text-lg font-bold text-navy-900 dark:text-white mb-4">{t('userDash.recentActivity')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('userDash.thType')}</th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('userDash.thSubject')}</th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('userDash.thStatus')}</th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t('userDash.thDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[t('userDash.legalQuery'), t('userDash.complaintRequest'), t('userDash.documentDraft'), t('userDash.legalAidApp')].map((type, index) => (
                    <tr className="border-b border-slate-100 dark:border-slate-800/50 last:border-0" key={type}>
                      <td className="py-3 font-semibold text-navy-900 dark:text-white">{type}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{t('userDash.subject')}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-legalGold/10 px-2.5 py-0.5 text-xs font-semibold text-legalGold">
                          {t('userDash.statusInProgress')}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">Jun {20 + index}, 2026</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
