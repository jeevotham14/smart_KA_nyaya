import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Scale, Shield, ArrowRight, BookOpen, Briefcase, FileText } from 'lucide-react';

export default function PortalSelection() {
  const { t, i18n } = useTranslation();
  const isKn = i18n.language === 'kn';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-legalGold/10 text-legalGold mb-4 border border-legalGold/20">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-navy-900 dark:text-white tracking-tight">
            {isKn ? 'ಸ್ಮಾರ್ಟ್ ಕರ್ನಾಟಕ ನ್ಯಾಯ ಪೋರ್ಟಲ್' : 'Smart Karnataka Nyaya'}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
            {isKn ? 'ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಆಯ್ಕೆಮಾಡಿ' : 'Choose how you want to continue'}
          </p>
        </div>

        {/* Portals Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* ── Citizen Portal Card ── */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 shadow-sm hover:shadow-xl hover:border-legalGold/40 transition-all duration-300 flex flex-col justify-between group glass-panel">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <User className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 dark:text-white">
                {isKn ? 'ನಾಗರಿಕ ಪೋರ್ಟಲ್' : 'Citizen Portal'}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isKn 
                  ? 'ಕಾನೂನು ಮಾಹಿತಿ, ಪ್ರಕರಣ ಪರಿಕರಗಳು, ವಕೀಲರ ಸಮಾಲೋಚನೆಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ದಾಖಲೆ ನಿರ್ವಹಣೆ.'
                  : 'Legal information, case tools, consultations and secure document management.'}
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-legalGold" />
                  {isKn ? 'AI ಆಧಾರಿತ ಕಾನೂನು ಮಾರ್ಗದರ್ಶನ' : 'AI-powered legal guidance & rights'}
                </li>
                <li className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-legalGold" />
                  {isKn ? 'ನೇರ & ಪ್ರಸಾರ ಸಮಾಲೋಚನೆ ಕೋರಿಕೆಗಳು' : 'Direct & broadcast advocate requests'}
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-legalGold" />
                  {isKn ? 'ಉಚಿತ ಕಾನೂನು ನೆರವು & ದಾಖಲೆಗಳ ಜನರೇಟರ್' : 'Free legal aid & legal document generator'}
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/citizen/login"
                id="citizen-login-btn"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-legalGold dark:hover:bg-yellow-500 text-white dark:text-navy-950 px-5 py-3 text-sm font-bold shadow-md transition-all group-hover:translate-x-0.5"
              >
                <span>{isKn ? 'ನಾಗರಿಕ ಲಾಗಿನ್' : 'Citizen Login'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-3 text-center">
                <Link
                  to="/citizen/register"
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-legalGold hover:underline font-semibold"
                >
                  {isKn ? 'ಹೊಸ ಖಾತೆ ತೆರೆಯಿರಿ →' : 'New Citizen? Create Account →'}
                </Link>
              </div>
            </div>
          </div>

          {/* ── Advocate Portal Card ── */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-8 shadow-sm hover:shadow-xl hover:border-legalGold/40 transition-all duration-300 flex flex-col justify-between group glass-panel">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-legalGold flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Scale className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 dark:text-white">
                {isKn ? 'ವಕೀಲರ ಪೋರ್ಟಲ್' : 'Advocate Portal'}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {isKn
                  ? 'ಸಮಾಲೋಚನೆ ಕೋರಿಕೆಗಳು, ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು ಮತ್ತು ನಾಗರಿಕ ಕಾನೂನು ಸೇವೆಗಳ ನಿರ್ವಹಣೆ.'
                  : 'Manage consultation requests, appointments, and citizen legal-service interactions.'}
              </p>

              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-legalGold" />
                  {isKn ? 'ಪರಿಶೀಲಿಸಿದ ಬಾರ್ ಕೌನ್ಸಿಲ್ ಪ್ರೊಫೈಲ್' : 'Verified Bar Council advocate profile'}
                </li>
                <li className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-legalGold" />
                  {isKn ? 'ನೇರ & ಪ್ರಸಾರ ಕೋರಿಕೆಗಳ ಕಾರ್ಯನಿರ್ವಾಹಕ ಕೇಂದ್ರ' : 'Action center for incoming consultations'}
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-legalGold" />
                  {isKn ? 'ಸುರಕ್ಷಿತ ಸಮಾಲೋಚನೆ ದಾಖಲೆ ಹಂಚಿಕೆ' : 'Protected consultation document access'}
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Link
                to="/advocate/login"
                id="advocate-login-btn"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-legalGold dark:hover:bg-yellow-500 text-white dark:text-navy-950 px-5 py-3 text-sm font-bold shadow-md transition-all group-hover:translate-x-0.5"
              >
                <span>{isKn ? 'ವಕೀಲರ ಲಾಗಿನ್' : 'Advocate Login'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-3 text-center">
                <Link
                  to="/advocate/register"
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-legalGold hover:underline font-semibold"
                >
                  {isKn ? 'ವಕೀಲರಾಗಿ ನೋಂದಾಯಿಸಿ →' : 'Register as Advocate →'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <p className="mt-10 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-legalGold" />
          {isKn 
            ? 'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಡಿಜಿಟಲ್ ಕಾನೂನು ಸೇವೆಗಳ ನಿಯಮಾವಳಿಗಳಿಗೆ ಬದ್ಧವಾಗಿದೆ.' 
            : 'Protected and verified under Karnataka e-Governance and legal aid protocols.'}
        </p>
      </div>
    </div>
  );
}
