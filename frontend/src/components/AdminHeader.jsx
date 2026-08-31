import { Link, useNavigate } from 'react-router-dom';
import { Scale, LogOut, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api.js';

export default function AdminHeader() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <header className="relative z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/admin" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-legalGold">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <span className="block font-serif text-lg font-bold leading-tight">Smart Karnataka Nyaya</span>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Admin Workspace</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <span className="rounded bg-slate-700 border border-slate-600 px-2.5 py-1 text-xs uppercase font-black text-amber-400">
            ADMIN
          </span>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-red-950/40 hover:text-alertRed hover:border-red-800 transition-all"
            type="button"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
