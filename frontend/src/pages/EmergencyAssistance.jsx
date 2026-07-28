import React, { useState } from 'react';
import { Phone, AlertTriangle, Shield, HeartPulse, UserCheck, ShieldAlert, Monitor } from 'lucide-react';
import { legalApi } from '../services/api';

const CATEGORIES = [
  { id: 'domestic_violence', label: 'Domestic Violence', icon: HeartPulse },
  { id: 'cyber_fraud', label: 'Cyber Fraud', icon: Monitor },
  { id: 'child_abuse', label: 'Child Abuse', icon: Shield },
  { id: 'police_harassment', label: 'Police Harassment', icon: ShieldAlert },
  { id: 'women_safety', label: 'Women Safety', icon: UserCheck },
  { id: 'senior_citizen_abuse', label: 'Senior Citizen Abuse', icon: AlertTriangle },
];

export default function EmergencyAssistance() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const data = await legalApi.getEmergencyResources(category);
      setResources(data.resources || data || []);
    } catch (err) {
      console.error(err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Premium Hero ── */}
      <section className="hero-gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-alertRed/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-alertRed/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-alertRed/30 bg-alertRed/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" /> Emergency Services
            </p>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              Emergency Assistance
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              If you are in immediate danger, please contact the authorities directly. 
              Find resources for specific emergencies below.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-12 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-8 sm:p-10 text-center shadow-sm glass-panel">
          <AlertTriangle className="mx-auto mb-6 h-16 w-16 text-alertRed dark:text-red-500 animate-pulse" />
          <h2 className="mb-4 text-3xl font-bold text-navy-900 dark:text-white">National Helplines</h2>
          <p className="mb-8 text-lg text-slate-700 dark:text-slate-300">Tap to call immediately from your device</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:112" className="flex items-center gap-2 rounded-xl bg-alertRed px-8 py-4 text-xl font-bold text-white transition-all hover:bg-red-700 hover:shadow-lg hover:-translate-y-1">
              <Phone className="h-6 w-6" />
              112 - National Emergency
            </a>
            <a href="tel:181" className="flex items-center gap-2 rounded-xl bg-pink-600 px-8 py-4 text-xl font-bold text-white transition-all hover:bg-pink-700 hover:shadow-lg hover:-translate-y-1">
              <Phone className="h-6 w-6" />
              181 - Women Helpline
            </a>
            <a href="tel:1098" className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-xl font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1">
              <Phone className="h-6 w-6" />
              1098 - Child Helpline
            </a>
          </div>
        </div>

        <h2 className="mb-8 text-2xl font-serif font-bold text-navy-900 dark:text-white text-center">Select a Category for Specific Resources</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => fetchResources(cat.id)}
                className={`flex items-center gap-5 rounded-2xl border p-6 text-left transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'border-legalGold bg-legalGold/10 dark:bg-legalGold/5 shadow-md scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 shadow-sm hover:border-legalGold/50 hover:shadow-md'
                }`}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${selectedCategory === cat.id ? 'bg-legalGold/20 text-legalGold' : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-lg font-bold text-navy-900 dark:text-white">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 shadow-sm glass-panel animate-scale-in">
            <h3 className="mb-6 text-2xl font-serif font-bold text-navy-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">Resources Available</h3>
            {loading ? (
              <div className="flex justify-center p-12 text-legalGold">
                <span className="animate-pulse font-semibold text-lg">Loading resources...</span>
              </div>
            ) : resources.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {resources.map((res, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 p-6 transition-colors hover:border-legalGold/30 hover:shadow-sm">
                    <h4 className="font-bold text-lg text-navy-900 dark:text-white mb-2">{res.name}</h4>
                    <p className="text-base leading-relaxed text-slate-800 dark:text-slate-200">{res.description}</p>
                    {res.contact && (
                      <a href={`tel:${res.contact}`} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy-900 dark:bg-navy-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-legalGold hover:border-legalGold transition-all">
                        <Phone className="h-4 w-4" />
                        Call {res.contact}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                <AlertTriangle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No specific resources found for this category.</p>
                <p className="text-slate-500 dark:text-slate-500 mt-2">Please use the National Helplines above.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
