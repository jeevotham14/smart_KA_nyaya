import re

with open('frontend/src/pages/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Imports
c = c.replace('import api from "../services/api.js";', 'import api, { adminApi } from "../services/api.js";')
c = c.replace('import { Users, FileText, AlertCircle, Scale, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";', 'import { Users, FileText, AlertCircle, Scale, Loader2, AlertTriangle, ShieldCheck, Check, X, Ban } from "lucide-react";')

# 2. State
c = c.replace('const [error, setError] = useState(false);', '''const [error, setError] = useState(false);
  const [pendingAdvocates, setPendingAdvocates] = useState([]);
  
  const fetchPending = () => {
    adminApi.getPendingAdvocates().then(setPendingAdvocates).catch(console.error);
  };''')

# 3. UseEffect
old_eff = '''  useEffect(() => {
    api.admin.getDashboard()
      .then(setData)
      .catch((err) => {
        console.error("Admin Dashboard error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);'''

new_eff = '''  useEffect(() => {
    api.admin.getDashboard()
      .then(setData)
      .catch((err) => {
        console.error("Admin Dashboard error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
      
    fetchPending();
  }, []);
  
  const handleApprove = async (id) => {
    await adminApi.updateAdvocateStatus(id, { verification_status: 'VERIFIED', is_active: true });
    fetchPending();
    api.admin.getDashboard().then(setData);
  };
  const handleReject = async (id) => {
    await adminApi.updateAdvocateStatus(id, { verification_status: 'REJECTED', is_active: false });
    fetchPending();
    api.admin.getDashboard().then(setData);
  };
  const handleSuspend = async (id) => {
    await adminApi.updateAdvocateStatus(id, { verification_status: 'SUSPENDED', is_active: false });
    fetchPending();
    api.admin.getDashboard().then(setData);
  };
'''
c = c.replace(old_eff, new_eff)

# 4. Rendering
pending_ui = '''
          <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900">
            <h3 className="mb-6 font-display text-xl font-bold text-navy-900 dark:text-white">Pending Advocate Approvals</h3>
            {pendingAdvocates.length === 0 ? (
              <p className="text-slate-500">No pending profiles.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Bar Council No.</th>
                      <th className="pb-3 font-semibold">District</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAdvocates.map((adv) => (
                      <tr key={adv.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                        <td className="py-3 font-medium text-navy-900 dark:text-white">{adv.full_name}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{adv.bar_council_number}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{adv.district}</td>
                        <td className="py-3 text-yellow-600 font-medium">{adv.verification_status}</td>
                        <td className="py-3 flex gap-2">
                          <button onClick={() => handleApprove(adv.id)} className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200" title="Approve">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleReject(adv.id)} className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200" title="Reject">
                            <X className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleSuspend(adv.id)} className="p-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" title="Suspend">
                            <Ban className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
'''
c = c.replace('          <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 \ndark:bg-navy-900">\n            <h3 className="mb-6 font-display text-xl font-bold text-navy-900 dark:text-white">Recent Activity</h3>', pending_ui + '\n          <div className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900">\n            <h3 className="mb-6 font-display text-xl font-bold text-navy-900 dark:text-white">Recent Activity</h3>')

with open('frontend/src/pages/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
