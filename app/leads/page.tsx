'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { useLeads } from '@/lib/hooks';
import { Search, Filter, Plus, Download, Upload, Eye, Pencil, TrendingUp, Users, Target, Zap } from 'lucide-react';

const STATUS_OPTIONS = ['all', 'new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'] as const;
const SOURCE_OPTIONS = ['all', 'website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'event', 'other'] as const;

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400',
    contacted: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400',
    qualified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400',
    unqualified: 'bg-gray-100 text-gray-600 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-400',
    converted: 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-400',
    lost: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-400',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset capitalize ${colors[status] || colors.new}`}>{status}</span>;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : score >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400';
  return <span className={`text-xs font-semibold tabular-nums ${color}`}>{score}</span>;
}

export default function LeadsPage() {
  const router = useRouter();
  const { data: leads, isLoading } = useLeads();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const allLeads = leads || [];
  const filtered = allLeads.filter((lead: any) => {
    const matchSearch = !search || `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.companyName || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchSource = sourceFilter === 'all' || lead.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Stats
  const newCount = allLeads.filter((l: any) => l.status === 'new').length;
  const qualifiedCount = allLeads.filter((l: any) => l.status === 'qualified').length;
  const convertedCount = allLeads.filter((l: any) => l.status === 'converted').length;
  const avgScore = allLeads.length > 0 ? Math.round(allLeads.reduce((s: number, l: any) => s + (l.score || 0), 0) / allLeads.length) : 0;

  const columns = [
    { key: 'name', label: 'Name', render: (_: any, row: any) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{row.firstName} {row.lastName}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{row.email}</p>
      </div>
    )},
    { key: 'companyName', label: 'Company', render: (v: any) => <span className="text-gray-600 dark:text-gray-300">{v || '—'}</span> },
    { key: 'jobTitle', label: 'Title' },
    { key: 'source', label: 'Source', render: (v: any) => <span className="capitalize text-xs text-gray-500 dark:text-gray-400">{v?.replace(/_/g, ' ') || '—'}</span> },
    { key: 'score', label: 'Score', render: (v: any) => v != null ? <ScoreBadge score={v} /> : <span className="text-gray-300 dark:text-gray-600">—</span> },
    { key: 'status', label: 'Status', render: (v: any) => <StatusBadge status={v} /> },
    { key: 'actions', label: '', render: (_: any, row: any) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => router.push(`/leads/${row.id}`)} className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-blue-950/40" title="View"><Eye size={14} /></button>
        <button onClick={() => router.push(`/leads/${row.id}?edit=1`)} className="rounded-lg p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors dark:hover:bg-amber-950/40" title="Edit"><Pencil size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <Header
        title="Leads"
        description={`${filtered.length} leads found`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download size={14} /> Export</Button>
            <Button variant="outline" size="sm"><Upload size={14} /> Import</Button>
            <Button size="sm" href="/leads/new"><Plus size={14} /> Add Lead</Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40"><Users size={16} className="text-blue-600 dark:text-blue-400" /></div>
            <div><p className="text-xs text-gray-400">Total Leads</p><p className="text-lg font-bold text-gray-900 dark:text-white">{allLeads.length}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40"><Zap size={16} className="text-amber-600 dark:text-amber-400" /></div>
            <div><p className="text-xs text-gray-400">New</p><p className="text-lg font-bold text-gray-900 dark:text-white">{newCount}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40"><Target size={16} className="text-emerald-600 dark:text-emerald-400" /></div>
            <div><p className="text-xs text-gray-400">Qualified</p><p className="text-lg font-bold text-gray-900 dark:text-white">{qualifiedCount}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40"><TrendingUp size={16} className="text-purple-600 dark:text-purple-400" /></div>
            <div><p className="text-xs text-gray-400">Avg Score</p><p className="text-lg font-bold text-gray-900 dark:text-white">{avgScore}</p></div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500 dark:focus:border-blue-600 dark:focus:ring-blue-950"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-600 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-600 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Sources' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
      </div>

      <Table
        columns={columns}
        data={paginated}
        loading={isLoading}
        onRowClick={(row) => router.push(`/leads/${row.id}`)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
          </p>
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
