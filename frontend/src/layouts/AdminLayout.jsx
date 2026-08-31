import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader.jsx';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <AdminHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
