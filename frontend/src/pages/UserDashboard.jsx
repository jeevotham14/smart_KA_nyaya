import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, ClipboardList, FileText, Scale, Shield, TrendingUp, AlertTriangle, Loader2, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import AnimatedSection from "../components/AnimatedSection.jsx";
import api from "../services/api.js";

export default function UserDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.dashboard.getMe()
      .then(setData)
      .catch((err) => {
        console.error("Dashboard error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const quickLinks = [
    { label: "AI Legal Guidance", desc: "Get instant AI-powered legal assistance", path: "/ai-legal-guidance", icon: MessageSquare, color: "text-legalGold" },
    { label: "Guided Intake", desc: "Step-by-step issue assessment", path: "/guided-intake", icon: ClipboardList, color: "text-aidGreen" },
    { label: "Generate Documents", desc: "Create legal documents", path: "/document-generator", icon: FileText, color: "text-navy-700" },
    { label: "Track Case", desc: "Monitor your case status", path: "/case-tracker", icon: Scale, color: "text-legalGold" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-legalGold h-12 w-12" />
        <span className="ml-3 text-slate-500 font-semibold">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg font-bold text-navy-900 dark:text-white">Unable to load dashboard.</p>
        </div>
      </div>
    );
  }

  const role = localStorage.getItem("role") || "citizen";
  const name = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).full_name : "User";

  const cards = [
    { label: "Recent Queries", value: data?.legal_queries || 0, icon: MessageSquare },
    { label: "Complaints", value: data?.complaints || 0, icon: ClipboardList },
    { label: "Consultations", value: data?.consultations || 0, icon: Scale },
    { label: "Broadcasts", value: data?.broadcast_requests || 0, icon: Shield },
  ];

  return (
    <section className="min-h-screen bg-surface py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-legalGold">{role === "advocate" ? "Advocate Dashboard" : "Citizen Dashboard"}</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-navy-900 dark:text-white">Welcome, {name}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{t("userDash.desc")}</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={50}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-navy-50 dark:bg-navy-800">
                    <card.icon className="h-5 w-5 text-legalGold" />
                  </div>
                  <span className="text-2xl font-extrabold text-navy-900 dark:text-white">{card.value}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">{card.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

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

        <AnimatedSection delay={150}>
          <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
            <h3 className="font-display text-lg font-bold text-navy-900 dark:text-white mb-4">{t("userDash.recentActivity")}</h3>
            {!data.recent_activity || data.recent_activity.length === 0 ? (
              <p className="text-slate-500">No recent activity yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</th>
                      <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Subject</th>
                      <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_activity.map((act, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                        <td className="py-3 font-semibold text-navy-900 dark:text-white">{act.type}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{act.subject}</td>
                        <td className="py-3 text-slate-500 dark:text-slate-400">{act.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
