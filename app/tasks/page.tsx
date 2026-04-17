'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { useMyTasks } from '@/lib/hooks';
import { Search, Plus, Clock, AlertCircle, Eye, Pencil, CheckCircle2, ListTodo, AlertTriangle } from 'lucide-react';

const STATUS_OPTIONS = ['all', 'pending', 'in_progress', 'completed', 'cancelled'] as const;
const PRIORITY_OPTIONS = ['all', 'low', 'medium', 'high', 'urgent'] as const;

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: 'bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-400',
    medium: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400',
    high: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400',
    urgent: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-400',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset capitalize ${colors[priority] || colors.medium}`}>{priority}</span>;
}

function TaskStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400',
    in_progress: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400',
    cancelled: 'bg-gray-100 text-gray-500 ring-gray-400/20 dark:bg-gray-800 dark:text-gray-400',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset capitalize ${colors[status] || colors.pending}`}>{status?.replace(/_/g, ' ')}</span>;
}

function DueDateLabel({ date }: { date: string | null }) {
  if (!date) return <span className="text-gray-300 dark:text-gray-600">—</span>;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const isSoon = diffDays >= 0 && diffDays <= 2;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs tabular-nums ${isOverdue ? 'text-red-600 font-medium dark:text-red-400' : isSoon ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
      {(isOverdue || isSoon) && <AlertCircle size={12} />}
      {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      {isOverdue && <span className="text-[10px]">(overdue)</span>}
    </span>
  );
}

export default function TasksPage() {
  const router = useRouter();
  const { data: tasks, isLoading } = useMyTasks();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const allTasks = tasks || [];
  const filtered = allTasks.filter((t: any) => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Stats
  const completedTasks = allTasks.filter((t: any) => t.status === 'completed').length;
  const pendingTasks = allTasks.filter((t: any) => t.status === 'pending' || t.status === 'in_progress').length;
  const now = new Date();
  const overdueTasks = allTasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed' && t.status !== 'cancelled').length;

  const columns = [
    { key: 'title', label: 'Task', render: (v: any) => <span className="font-medium text-gray-900 dark:text-white">{v}</span> },
    { key: 'priority', label: 'Priority', render: (v: any) => <PriorityBadge priority={v} /> },
    { key: 'status', label: 'Status', render: (v: any) => <TaskStatusBadge status={v} /> },
    { key: 'dueDate', label: 'Due Date', render: (v: any) => <DueDateLabel date={v} /> },
    { key: 'relatedToType', label: 'Related To', render: (v: any) => v ? <span className="capitalize text-xs text-gray-500 dark:text-gray-400">{v}</span> : <span className="text-gray-300 dark:text-gray-600">—</span> },
    { key: 'actions', label: '', render: (_: any, row: any) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => router.push(`/tasks/${row.id}`)} className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-blue-950/40" title="View"><Eye size={14} /></button>
        <button onClick={() => router.push(`/tasks/${row.id}?edit=1`)} className="rounded-lg p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors dark:hover:bg-amber-950/40" title="Edit"><Pencil size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <Header
        title="My Tasks"
        description={`${filtered.length} tasks`}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" href="/tasks/new"><Plus size={14} /> Add Task</Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40"><ListTodo size={16} className="text-blue-600 dark:text-blue-400" /></div>
            <div><p className="text-xs text-gray-400">Total</p><p className="text-lg font-bold text-gray-900 dark:text-white">{allTasks.length}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40"><Clock size={16} className="text-amber-600 dark:text-amber-400" /></div>
            <div><p className="text-xs text-gray-400">Pending</p><p className="text-lg font-bold text-gray-900 dark:text-white">{pendingTasks}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40"><AlertTriangle size={16} className="text-red-600 dark:text-red-400" /></div>
            <div><p className="text-xs text-gray-400">Overdue</p><p className="text-lg font-bold text-gray-900 dark:text-white">{overdueTasks}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40"><CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" /></div>
            <div><p className="text-xs text-gray-400">Completed</p><p className="text-lg font-bold text-gray-900 dark:text-white">{completedTasks}</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-600 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-600 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      <Table columns={columns} data={paginated} loading={isLoading} onRowClick={(row) => router.push(`/tasks/${row.id}`)} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-800">Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-800">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
