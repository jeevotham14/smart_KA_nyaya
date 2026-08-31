import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import AdvocateHeader from '../components/AdvocateHeader.jsx';
import AdminHeader from '../components/AdminHeader.jsx';
import { isAdvocate, isAdmin } from '../utils/roleUtils.js';

export default function MainLayout() {
  const token = localStorage.getItem('smartNyayaToken');
  const role = localStorage.getItem('role');

  if (token && isAdvocate(role)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col">
        <AdvocateHeader />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  if (token && isAdmin(role)) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <AdminHeader />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

