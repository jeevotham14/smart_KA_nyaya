import { Outlet } from 'react-router-dom';
import AdvocateHeader from '../components/AdvocateHeader.jsx';

export default function AdvocateLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <AdvocateHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
