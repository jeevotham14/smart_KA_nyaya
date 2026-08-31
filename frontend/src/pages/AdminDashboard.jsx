import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserCheck, ShieldAlert, HeartHandshake, Loader2, AlertTriangle, Scale, Shield } from "lucide-react";
import DashboardCard from "../components/DashboardCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { adminApi } from "../services/api.js";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pendingAdvocates, setPendingAdvocates] = useState([]);

  const token = localStorage.getItem("smartNyayaToken");
  const role = localStorage.getItem("role");

  const fetchPending = () => {
    adminApi.getPendingAdvocates().then(setPendingAdvocates).catch(console.error);
  };

  useEffect(() => {
    if (!token || role !== "admin") {
      setLoading(false);
      return;
    }

    adminApi.getDashboard()
      .then((res) => {
        setData(res);
        setError(false);
      })
      .catch((err) => {
        console.error("Admin Dashboard error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));

    fetchPending();
  }, [token, role]);

  // Unauthenticated -> Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Non-admin -> Dashboard
  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <Loader2 className="animate-spin text-legalGold h-12 w-12" />
        <span className="ml-3 text-slate-500 font-semibold">Loading admin dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg font-bold text-navy-900 dark:text-white">Unable to load admin dashboard.</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(false);
              adminApi.getDashboard()
                .then((res) => { setData(res); setError(false); })
                .catch(() => setError(true))
                .finally(() => setLoading(false));
            }}
            className="mt-4 rounded-xl bg-legalGold px-4 py-2 text-sm font-bold text-navy-950 hover:bg-yellow-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const translatedCards = [
    { label: "Registered Users", value: data?.registered_users || 0, icon: UserCheck, tone: "navy" },
    { label: "Advocates", value: data?.advocates || 0, icon: Scale, tone: "navy" },
    { label: "Consultations", value: data?.consultations || 0, icon: HeartHandshake, tone: "navy" },
    { label: "Open Broadcasts", value: data?.open_broadcasts || 0, icon: Shield, tone: "gold" },
    { label: "Open Complaints", value: data?.complaints || 0, icon: ShieldAlert, tone: "red" },
    { label: "Legal Aid Cases", value: data?.legal_aid_applications || 0, icon: HeartHandshake, tone: "green" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-28 dark:bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <SectionHeader
            title="Admin Dashboard"
            subtitle="Manage users, legal services, advocates, consultations, and platform activity."
            centered={false}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {translatedCards.map((card, idx) => (
            <DashboardCard key={idx} {...card} />
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <h3 className="mb-6 font-display text-xl font-bold text-navy-900 dark:text-white">Recent Activity</h3>
          {!data?.recent_activity || data.recent_activity.length === 0 ? (
            <p className="text-slate-500">No recent activity yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="pb-3 font-semibold text-slate-500">Subject</th>
                    <th className="pb-3 font-semibold text-slate-500">Type</th>
                    <th className="pb-3 font-semibold text-slate-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recent_activity || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <td className="py-3 font-medium text-navy-900 dark:text-white">{item.subject}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{item.type}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
