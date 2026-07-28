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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 rounded-2xl bg-red-600/10 border border-red-600/30 p-8 text-center backdrop-blur-md">
        <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h1 className="mb-2 text-4xl font-bold text-white">Emergency Assistance</h1>
        <p className="mb-8 text-lg text-red-200">If you are in immediate danger, please contact the authorities directly.</p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <a href="tel:112" className="flex items-center gap-2 rounded-full bg-red-600 px-8 py-4 text-xl font-bold text-white transition-all hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <Phone className="h-6 w-6" />
            112 - National Emergency
          </a>
          <a href="tel:181" className="flex items-center gap-2 rounded-full bg-pink-600 px-8 py-4 text-xl font-bold text-white transition-all hover:bg-pink-500 hover:shadow-[0_0_20px_rgba(219,39,119,0.5)]">
            <Phone className="h-6 w-6" />
            181 - Women Helpline
          </a>
          <a href="tel:1098" className="flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-xl font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]">
            <Phone className="h-6 w-6" />
            1098 - Child Helpline
          </a>
        </div>
      </div>

      <h2 className="mb-6 text-2xl font-semibold text-white">Select a Category for Specific Resources</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => fetchResources(cat.id)}
              className={`flex items-center gap-4 rounded-xl border p-6 text-left transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'border-legalGold bg-legalGold/10 shadow-[0_0_15px_rgba(196,154,58,0.2)]'
                  : 'border-white/10 bg-navy-800/50 hover:border-white/30 hover:bg-navy-700/50'
              }`}
            >
              <Icon className={`h-8 w-8 ${selectedCategory === cat.id ? 'text-legalGold' : 'text-slate-400'}`} />
              <span className="text-lg font-medium text-white">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {selectedCategory && (
        <div className="mt-8 rounded-2xl border border-white/10 bg-navy-800/80 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-xl font-semibold text-white">Resources Available</h3>
          {loading ? (
            <div className="flex justify-center p-8 text-legalGold">
              <span className="animate-pulse">Loading resources...</span>
            </div>
          ) : resources.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {resources.map((res, idx) => (
                <div key={idx} className="rounded-lg border border-white/5 bg-navy-900/50 p-4">
                  <h4 className="font-medium text-white">{res.name}</h4>
                  <p className="text-sm text-slate-400">{res.description}</p>
                  {res.contact && (
                    <a href={`tel:${res.contact}`} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-legalGold hover:underline">
                      <Phone className="h-4 w-4" />
                      {res.contact}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No specific resources found for this category.</p>
          )}
        </div>
      )}
    </div>
  );
}
