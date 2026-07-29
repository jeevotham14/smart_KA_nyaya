import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, CheckCircle2, ChevronRight, ClipboardList,
  FileText, Loader2, MessageSquare, NotebookPen, Plus, Save,
  Scale, Trash2, X,
} from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection.jsx';
import { legalApi } from '../services/api.js';

export default function CaseWorkspace() {
  const { caseId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await legalApi.trackCase(caseId);
        setCaseData(data);
      } catch {
        setCaseData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [caseId]);

  // Load workspace data
  useEffect(() => {
    if (!caseData?.case_id) return;
    // Load notes
    legalApi.getWorkspaceNotes?.(caseData.case_id)
      .then((data) => { if (data?.[0]) setNotes(data[0].content); })
      .catch(() => {});
    // Load tasks
    legalApi.getWorkspaceTasks?.(caseData.case_id)
      .then(setTasks)
      .catch(() => {});
  }, [caseData?.case_id]);

  const saveNotes = async () => {
    if (!caseData?.case_id) return;
    try {
      await legalApi.saveWorkspaceNote?.(caseData.case_id, { content: notes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {}
  };

  const addTask = async () => {
    if (!newTask.trim() || !caseData?.case_id) return;
    setTaskLoading(true);
    try {
      const task = await legalApi.createWorkspaceTask?.(caseData.case_id, { title: newTask.trim() });
      if (task) setTasks((prev) => [task, ...prev]);
      setNewTask('');
    } catch {}
    setTaskLoading(false);
  };

  const toggleTask = async (taskId, completed) => {
    if (!caseData?.case_id) return;
    try {
      await legalApi.updateWorkspaceTask?.(caseData.case_id, taskId, { completed: !completed });
      setTasks((prev) => prev.map((t) => t.task_id === taskId ? { ...t, completed: !completed } : t));
    } catch {}
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Scale },
    { id: 'notes', label: 'Notes', icon: NotebookPen },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  if (loading) {
    return (
      <section className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-legalGold" />
      </section>
    );
  }

  const cn = caseData?.case_number || caseId;

  return (
    <section className="min-h-screen bg-surface dark:bg-navy-950 py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/case-tracker"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Case Tracker
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-legalGold">Case Workspace</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold text-navy-900 dark:text-white sm:text-3xl">
                {cn}
              </h1>
              {caseData?.court_type && (
                <p className="mt-1 text-sm text-slate-500">{caseData.court_type}</p>
              )}
            </div>
            {caseData?.status && (
              <span className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                caseData.status === 'resolved' ? 'bg-aidGreen/10 text-aidGreen' :
                caseData.status === 'under_review' ? 'bg-legalGold/10 text-legalGold' :
                'bg-navy-50 text-navy-700'
              }`}>
                {caseData.status?.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Tab bar */}
        <div className="mb-6 flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-legalGold text-navy-900 dark:text-white'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatedSection>
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
                <h3 className="font-display text-base font-bold text-navy-900 dark:text-white mb-4">Case Details</h3>
                <div className="grid gap-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-navy-800 p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Case Number</p>
                    <p className="text-sm font-bold text-navy-900 dark:text-white font-mono">{cn}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-navy-800 p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Court</p>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">{caseData?.court_type || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-navy-800 p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                    <p className="text-sm font-bold text-navy-900 dark:text-white capitalize">{caseData?.status?.replace(/_/g, ' ') || 'N/A'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-navy-800 p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Estimated Duration</p>
                    <p className="text-sm font-bold text-navy-900 dark:text-white">{caseData?.estimated_duration_days || '—'} days</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
                <h3 className="font-display text-base font-bold text-navy-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid gap-2">
                  <button onClick={() => setActiveTab('notes')} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-navy-800 p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white dark:hover:bg-navy-700">
                    <NotebookPen className="h-5 w-5 text-legalGold" />
                    <div>
                      <p className="text-sm font-semibold text-navy-900 dark:text-white">Write Notes</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Add private notes about this case</p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-300 dark:text-slate-600" />
                  </button>
                  <button onClick={() => setActiveTab('tasks')} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-navy-800 p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white dark:hover:bg-navy-700">
                    <ClipboardList className="h-5 w-5 text-aidGreen" />
                    <div>
                      <p className="text-sm font-semibold text-navy-900 dark:text-white">Manage Tasks</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{tasks.filter((t) => !t.completed).length} pending tasks</p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-300 dark:text-slate-600" />
                  </button>
                  <button onClick={() => setActiveTab('documents')} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-navy-800 p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-white dark:hover:bg-navy-700">
                    <FileText className="h-5 w-5 text-navy-700 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-semibold text-navy-900 dark:text-white">View Documents</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded case documents</p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-300 dark:text-slate-600" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {activeTab === 'notes' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-navy-900 dark:text-white">Case Notes</h3>
                <button
                  onClick={saveNotes}
                  className="premium-btn premium-btn-primary !py-2 !px-4 text-sm"
                >
                  <Save className="h-4 w-4" />
                  {notesSaved ? 'Saved ' : 'Save Notes'}
                </button>
              </div>
              <textarea
                className="w-full min-h-[300px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 p-4 text-sm text-navy-900 dark:text-white outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 resize-y transition-all"
                placeholder="Write your private notes about this case here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {/* Tasks */}
          {activeTab === 'tasks' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
              <h3 className="font-display text-base font-bold text-navy-900 dark:text-white mb-4">Task List</h3>
              <div className="mb-4 flex gap-2">
                <input
                  className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 px-4 py-3 text-sm text-navy-900 dark:text-white outline-none focus:border-legalGold focus:ring-2 focus:ring-legalGold/20 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                  placeholder="Add a new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
                <button
                  onClick={addTask}
                  disabled={!newTask.trim() || taskLoading}
                  className="premium-btn premium-btn-primary !py-2.5 !px-4 text-sm disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              <div className="grid gap-2">
                {tasks.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No tasks yet. Add your first task above.</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.task_id}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                        task.completed
                          ? 'border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-navy-900 opacity-60'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-800'
                      }`}
                    >
                      <button
                        onClick={() => toggleTask(task.task_id, task.completed)}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          task.completed
                            ? 'border-aidGreen bg-aidGreen text-white'
                            : 'border-slate-300 hover:border-legalGold'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="h-3 w-3" />}
                      </button>
                      <p className={`text-sm flex-1 ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-navy-900 dark:text-white font-medium'}`}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">{task.due_date}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
              <h3 className="font-display text-base font-bold text-navy-900 dark:text-white mb-4">Case Documents</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Documents uploaded for this case will appear here. Use the Case Tracker to upload new documents.</p>
              <Link
                to="/case-tracker"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-legalGold hover:underline"
              >
                Go to Case Tracker <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Calendar */}
          {activeTab === 'calendar' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 p-6 sm:p-8 shadow-sm glass-panel">
              <h3 className="font-display text-base font-bold text-navy-900 dark:text-white mb-4">Hearing Calendar</h3>
              <div className="rounded-xl bg-slate-50 dark:bg-navy-800 p-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-sm font-semibold text-navy-900 dark:text-white">Hearing dates will appear here</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">When hearing dates are scheduled for your case, they will be displayed in a calendar view.</p>
              </div>
            </div>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
}
