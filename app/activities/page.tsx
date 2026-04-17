'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { useActivities } from '@/lib/hooks';
import { Search, Plus, CheckCircle2, Circle, Eye, Pencil, Activity, Clock, BarChart3 } from 'lucide-react';

const TYPE_OPTIONS = ['all', 'call', 'email', 'meeting', 'note', 'task'] as const;
const COMPLETION_OPTIONS = ['all', 'completed', 'pending'] as const;

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { icon: string; color: string }> = {
    call: { icon: '📞', color: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400' },
    email: { icon: '✉️', color: 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-400' },
    meeting: { icon: '🤝', color: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400' },
    note: { icon: '📝', color: 'bg-gray-50 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-400' },
    task: { icon: '✅', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400' },
  };
  const c = config[type] || config.note;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset capitalize ${c.color}`}>{c.icon} {type}</span>;
}

export default function ActivitiesPage() {
  const router = useRouter();
  const { data: activities, isLoading } = useActivities();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const allActivities = activities || [];
  const filtered = allActivities.filter((a: any) => {
    const matchSearch = !search || a.subject?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || a.type === typeFilter;
    const matchCompletion = completionFilter === 'all' || (completionFilter === 'completed' ? a.isCompleted : !a.isCompleted);
    return matchSearch && matchType && matchCompletion;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Stats
  const completed = allActivities.filter((a: any) => a.isCompleted).length;
  const pending = allActivities.length - completed;
  const topType = allActivities.reduce((acc: Record<string, number>, a: any) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {} as Record<string, number>);
  const mostCommon = Object.entries(topType).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

  const columns = [
    { key: 'subject', label: 'Subject', render: (v: any) => <span className="font-medium text-gray-900 dark:text-white">{v}</span> },
    { key: 'type', label: 'Type', render: (v: any) => <TypeBadge type={v} /> },
    { key: 'relationType', label: 'Related To', render: (v: any) => v ? <span className="capitalize text-xs text-gray-500 dark:text-gray-400">{v}</span> : <span className="text-gray-300 dark:text-gray-600">—</span> },
    { key: 'activityDate', label: 'Date', render: (v: any) => v ? <span className="text-xs tabular-nums text-gray-500">{new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> : <span className="text-gray-300 dark:text-gray-600">—</span> },
    { key: 'isCompleted', label: 'Status', render: (v: any) => v ? (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={13} /> Done</span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400"><Circle size={13} /> Pending</span>
    )},
    { key: 'actions', label: '', render: (_: any, row: any) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => router.push(`/activities/${row.id}`)} className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-blue-950/40" title="View"><Eye size={14} /></button>
        <button onClick={() => router.push(`/activities/${row.id}?edit=1`)} className="rounded-lg p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors dark:hover:bg-amber-950/40" title="Edit"><Pencil size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <Header
        title="Activities"
        description={`${filtered.length} activities`}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" href="/activities/new"><Plus size={14} /> Log Activity</Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40"><Activity size={16} className="text-blue-600 dark:text-blue-400" /></div>
            <div><p className="text-xs text-gray-400">Total</p><p className="text-lg font-bold text-gray-900 dark:text-white">{allActivities.length}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40"><CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" /></div>
            <div><p className="text-xs text-gray-400">Completed</p><p className="text-lg font-bold text-gray-900 dark:text-white">{completed}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40"><Clock size={16} className="text-amber-600 dark:text-amber-400" /></div>
            <div><p className="text-xs text-gray-400">Pending</p><p className="text-lg font-bold text-gray-900 dark:text-white">{pending}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40"><BarChart3 size={16} className="text-purple-600 dark:text-purple-400" /></div>
            <div><p className="text-xs text-gray-400">Top Type</p><p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{mostCommon ? mostCommon[0] : '—'}</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-600 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <select
          value={completionFilter}
          onChange={(e) => { setCompletionFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-600 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {COMPLETION_OPTIONS.map(c => <option key={c} value={c}>{c === 'all' ? 'All Status' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      <Table columns={columns} data={paginated} loading={isLoading} onRowClick={(row) => router.push(`/activities/${row.id}`)} />

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
