'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Details } from '@/components/details';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { Select } from '@/components/select';
import { useLead } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, Briefcase, Target, ChevronRight, Clock, Calendar, Hash, MapPin } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: 'bg-blue-50 text-blue-700 ring-blue-600/20', contacted: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    qualified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', converted: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    lost: 'bg-red-50 text-red-700 ring-red-600/20', unqualified: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset capitalize ${colors[status] || colors.new}`}>{status}</span>;
}

function ScoreBar({ score }: { score: number | null }) {
  if (score == null) return <span className="text-gray-300">—</span>;
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-blue-500' : score >= 25 ? 'bg-amber-500' : 'bg-gray-400';
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-24 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>
      <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-white">{score}</span>
    </div>
  );
}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = parseInt(params.id as string);
  
  const { data: lead, isLoading, error } = useLead(leadId);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setEditErrors({});
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    try {
      await apiClient(`/leads/${leadId}`, { method: 'PUT', body: JSON.stringify(data) });
      setIsEditOpen(false);
      window.location.reload();
    } catch (error: any) {
      setEditErrors(error.errors || { general: 'Failed to update lead' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await apiClient(`/leads/${leadId}`, { method: 'DELETE' });
        router.push('/leads');
      } catch (error) {
        alert('Failed to delete lead');
      }
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
    </div>
  );
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">Failed to load lead details.</div>;
  if (!lead) return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Lead not found.</div>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => router.push('/leads')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Leads</button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-white">{lead.firstName} {lead.lastName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}><Edit size={14} /> Edit</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg font-bold shadow-sm">
            {lead.firstName?.[0]}{lead.lastName?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{lead.firstName} {lead.lastName}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{lead.jobTitle || 'No title'}{lead.companyName ? ` at ${lead.companyName}` : ''}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><User size={15} /> Contact Information</h3>
            </div>
            <div className="p-6">
              <Details
                data={{ email: lead.email, phone: lead.phone, jobTitle: lead.jobTitle, company: lead.companyName }}
                labels={{ jobTitle: 'Job Title', company: 'Company' }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Target size={15} /> Lead Details</h3>
            </div>
            <div className="p-6">
              <Details
                data={{ status: lead.status, source: lead.source, score: lead.score }}
                renders={{
                  status: (v) => <StatusBadge status={v} />,
                  source: (v) => <span className="capitalize text-sm">{v?.replace(/_/g, ' ') || '—'}</span>,
                  score: (v) => <ScoreBar score={v} />,
                }}
              />
            </div>
          </div>

          {/* Description / Notes */}
          {lead.description && (
            <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
              <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Hash size={15} /> Notes</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{lead.description}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Clock size={15} /> Timeline</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {lead.createdAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40"><Calendar size={12} className="text-emerald-600" /></div>
                    <div><span className="text-gray-400 text-xs">Created</span><p className="text-gray-700 dark:text-gray-300">{new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                  </div>
                )}
                {lead.updatedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40"><Clock size={12} className="text-blue-600" /></div>
                    <div><span className="text-gray-400 text-xs">Last Updated</span><p className="text-gray-700 dark:text-gray-300">{new Date(lead.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Info</h3>
            <div className="space-y-3">
              {lead.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={14} className="text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">{lead.email}</span>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={14} className="text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{lead.phone}</span>
                </div>
              )}
              {lead.companyName && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase size={14} className="text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{lead.companyName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Actions</h3>
            <div className="space-y-2">
              <Button onClick={() => setIsEditOpen(true)} className="w-full" variant="primary" size="sm"><Edit size={14} /> Edit Lead</Button>
              <Button onClick={handleDelete} className="w-full" variant="outline" size="sm"><Trash2 size={14} /> Delete</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Lead">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input name="firstName" label="First Name" defaultValue={lead.firstName} required error={editErrors.firstName} />
          <Input name="lastName" label="Last Name" defaultValue={lead.lastName} required error={editErrors.lastName} />
          <Input name="email" label="Email" type="email" defaultValue={lead.email} required error={editErrors.email} />
          <Input name="jobTitle" label="Job Title" defaultValue={lead.jobTitle} error={editErrors.jobTitle} />
          <Input name="phone" label="Phone" type="tel" defaultValue={lead.phone} error={editErrors.phone} />
          <Input name="company" label="Company" defaultValue={lead.company} error={editErrors.company} />
          <Select name="status" label="Status" defaultValue={lead.status} options={[
            { value: 'NEW', label: 'New' }, { value: 'CONTACTED', label: 'Contacted' }, { value: 'QUALIFIED', label: 'Qualified' },
            { value: 'CONVERTED', label: 'Converted' }, { value: 'LOST', label: 'Lost' },
          ]} error={editErrors.status} />
          <Input name="source" label="Source" defaultValue={lead.source} error={editErrors.source} />
          <Input name="score" label="Score" type="number" defaultValue={lead.score} error={editErrors.score} />
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
