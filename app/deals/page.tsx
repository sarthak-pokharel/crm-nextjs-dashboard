'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { useDeals } from '@/lib/hooks';
import { Search, Plus, Download, DollarSign, Eye, Pencil, TrendingUp, Trophy, Clock } from 'lucide-react';

const STAGE_OPTIONS = ['all', 'prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const;
const PRIORITY_OPTIONS = ['all', 'low', 'medium', 'high', 'urgent'] as const;

function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    prospecting: 'bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-900/40 dark:text-slate-400',
    qualification: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400',
    proposal: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400',
    negotiation: 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-400',
    closed_won: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400',
    closed_lost: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-400',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset capitalize ${colors[stage] || colors.prospecting}`}>{stage.replace(/_/g, ' ')}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = { low: 'text-gray-500', medium: 'text-blue-600', high: 'text-amber-600', urgent: 'text-red-600' };
  const dots: Record<string, string> = { low: 'bg-gray-400', medium: 'bg-blue-500', high: 'bg-amber-500', urgent: 'bg-red-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium capitalize ${colors[priority] || colors.medium}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[priority] || dots.medium}`} />
      {priority}
    </span>
  );
}

export default function DealsPage() {
  const router = useRouter();
  const { data: deals, isLoading } = useDeals();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const allDeals = deals || [];
  const filtered = allDeals.filter((deal: any) => {
    const matchSearch = !search || deal.title.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'all' || deal.stage === stageFilter;
    const matchPriority = priorityFilter === 'all' || deal.priority === priorityFilter;
    return matchSearch && matchStage && matchPriority;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalValue = filtered.reduce((s: number, d: any) => s + (parseFloat(d.value) || 0), 0);

  // Stats
  const wonDeals = allDeals.filter((d: any) => d.stage === 'closed_won');
  const wonValue = wonDeals.reduce((s: number, d: any) => s + (parseFloat(d.value) || 0), 0);
  const openDeals = allDeals.filter((d: any) => !['closed_won', 'closed_lost'].includes(d.stage));
  const avgProbability = openDeals.length > 0 ? Math.round(openDeals.reduce((s: number, d: any) => s + (parseInt(d.probability) || 0), 0) / openDeals.length) : 0;

  const columns = [
    { key: 'title', label: 'Deal', render: (_: any, row: any) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{row.title}</p>
        {row.description && <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-xs">{row.description}</p>}
      </div>
    )},
    { key: 'value', label: 'Value', render: (v: any) => (
      <span className="font-semibold tabular-nums text-gray-900 dark:text-white">${parseFloat(v).toLocaleString()}</span>
    )},
    { key: 'stage', label: 'Stage', render: (v: any) => <StageBadge stage={v} /> },
    { key: 'priority', label: 'Priority', render: (v: any) => <PriorityBadge priority={v} /> },
    { key: 'probability', label: 'Prob.', render: (v: any) => {
      const pct = parseInt(v) || 0;
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">{pct}%</span>
        </div>
      );
    }},
    { key: 'expectedCloseDate', label: 'Close Date', render: (v: any) => v ? <span className="text-xs tabular-nums text-gray-500">{new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span> : <span className="text-gray-300 dark:text-gray-600">—</span> },
    { key: 'actions', label: '', render: (_: any, row: any) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => router.push(`/deals/${row.id}`)} className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-blue-950/40" title="View"><Eye size={14} /></button>
        <button onClick={() => router.push(`/deals/${row.id}?edit=1`)} className="rounded-lg p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors dark:hover:bg-amber-950/40" title="Edit"><Pencil size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <Header
        title="Deals"
        description={`${filtered.length} deals · $${(totalValue / 1000).toFixed(0)}k total pipeline`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download size={14} /> Export</Button>
            <Button size="sm" href="/deals/new"><Plus size={14} /> New Deal</Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40"><DollarSign size={16} className="text-blue-600 dark:text-blue-400" /></div>
            <div><p className="text-xs text-gray-400">Pipeline</p><p className="text-lg font-bold text-gray-900 dark:text-white">${(totalValue / 1000).toFixed(0)}k</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40"><Trophy size={16} className="text-emerald-600 dark:text-emerald-400" /></div>
            <div><p className="text-xs text-gray-400">Won</p><p className="text-lg font-bold text-gray-900 dark:text-white">${(wonValue / 1000).toFixed(0)}k</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40"><Clock size={16} className="text-amber-600 dark:text-amber-400" /></div>
            <div><p className="text-xs text-gray-400">Open Deals</p><p className="text-lg font-bold text-gray-900 dark:text-white">{openDeals.length}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40"><TrendingUp size={16} className="text-purple-600 dark:text-purple-400" /></div>
            <div><p className="text-xs text-gray-400">Avg Probability</p><p className="text-lg font-bold text-gray-900 dark:text-white">{avgProbability}%</p></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500"
          />
        </div>
        <select
          value={stageFilter}
          onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-600 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {STAGE_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Stages' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-600 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      <Table columns={columns} data={paginated} loading={isLoading} onRowClick={(row) => router.push(`/deals/${row.id}`)} />

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
