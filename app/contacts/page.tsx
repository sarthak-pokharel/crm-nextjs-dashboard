'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { useContacts } from '@/lib/hooks';
import { Search, Plus, Download, Upload, Mail, Phone, Eye, Pencil, Users, Building2, Briefcase } from 'lucide-react';

export default function ContactsPage() {
  const router = useRouter();
  const { data: contacts, isLoading } = useContacts();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const allContacts = contacts || [];
  const filtered = allContacts.filter((c: any) => {
    if (!search) return true;
    return `${c.firstName} ${c.lastName} ${c.email} ${c.jobTitle || ''} ${c.phone || ''}`.toLowerCase().includes(search.toLowerCase());
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Stats
  const withEmail = allContacts.filter((c: any) => c.email).length;
  const withPhone = allContacts.filter((c: any) => c.phone).length;
  const withCompany = allContacts.filter((c: any) => c.company?.name).length;

  const columns = [
    { key: 'name', label: 'Contact', render: (_: any, row: any) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          {(row.firstName?.[0] || '')}{(row.lastName?.[0] || '')}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.firstName} {row.lastName}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{row.jobTitle || 'No title'}</p>
        </div>
      </div>
    )},
    { key: 'email', label: 'Email', render: (v: any) => v ? (
      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
        <Mail size={12} className="text-gray-400" /> {v}
      </span>
    ) : <span className="text-gray-300 dark:text-gray-600">—</span> },
    { key: 'phone', label: 'Phone', render: (v: any) => v ? (
      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
        <Phone size={12} className="text-gray-400" /> {v}
      </span>
    ) : <span className="text-gray-300 dark:text-gray-600">—</span> },
    { key: 'company', label: 'Company', render: (_: any, row: any) => (
      <span className="text-sm text-gray-500 dark:text-gray-400">{row.company?.name || '—'}</span>
    )},
    { key: 'actions', label: '', render: (_: any, row: any) => (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => router.push(`/contacts/${row.id}`)} className="rounded-lg p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-blue-950/40" title="View"><Eye size={14} /></button>
        <button onClick={() => router.push(`/contacts/${row.id}?edit=1`)} className="rounded-lg p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors dark:hover:bg-amber-950/40" title="Edit"><Pencil size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <Header
        title="Contacts"
        description={`${filtered.length} contacts`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download size={14} /> Export</Button>
            <Button variant="outline" size="sm"><Upload size={14} /> Import</Button>
            <Button size="sm" href="/contacts/new"><Plus size={14} /> Add Contact</Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40"><Users size={16} className="text-blue-600 dark:text-blue-400" /></div>
            <div><p className="text-xs text-gray-400">Total</p><p className="text-lg font-bold text-gray-900 dark:text-white">{allContacts.length}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40"><Mail size={16} className="text-emerald-600 dark:text-emerald-400" /></div>
            <div><p className="text-xs text-gray-400">With Email</p><p className="text-lg font-bold text-gray-900 dark:text-white">{withEmail}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40"><Phone size={16} className="text-amber-600 dark:text-amber-400" /></div>
            <div><p className="text-xs text-gray-400">With Phone</p><p className="text-lg font-bold text-gray-900 dark:text-white">{withPhone}</p></div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40"><Building2 size={16} className="text-purple-600 dark:text-purple-400" /></div>
            <div><p className="text-xs text-gray-400">With Company</p><p className="text-lg font-bold text-gray-900 dark:text-white">{withCompany}</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-500"
          />
        </div>
      </div>

      <Table columns={columns} data={paginated} loading={isLoading} onRowClick={(row) => router.push(`/contacts/${row.id}`)} />

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
