'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Details } from '@/components/details';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { Select } from '@/components/select';
import { Textarea } from '@/components/textarea';
import { useDeal } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { Edit, Trash2, DollarSign, TrendingUp, Calendar, ChevronRight, Handshake, Clock, FileText } from 'lucide-react';

function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, string> = {
    prospecting: 'bg-slate-50 text-slate-600 ring-slate-500/20', qualification: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    proposal: 'bg-amber-50 text-amber-700 ring-amber-600/20', negotiation: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    closed_won: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', closed_lost: 'bg-red-50 text-red-700 ring-red-600/20',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset capitalize ${colors[stage] || colors.prospecting}`}>{stage?.replace(/_/g, ' ')}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = { low: 'text-gray-500', medium: 'text-blue-600', high: 'text-amber-600', urgent: 'text-red-600' };
  const dots: Record<string, string> = { low: 'bg-gray-400', medium: 'bg-blue-500', high: 'bg-amber-500', urgent: 'bg-red-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium capitalize ${colors[priority] || colors.medium}`}>
      <span className={`h-2 w-2 rounded-full ${dots[priority] || dots.medium}`} />
      {priority}
    </span>
  );
}

// Pipeline stage progress
function StageProgress({ stage }: { stage: string }) {
  const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'];
  const idx = stages.indexOf(stage);
  if (stage === 'closed_lost') return (
    <div className="flex items-center gap-1.5 mt-1">
      {stages.map((s, i) => <div key={s} className="h-1.5 flex-1 rounded-full bg-red-200" />)}
    </div>
  );
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {stages.map((s, i) => (
        <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= idx ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-800'}`} />
      ))}
    </div>
  );
}

export default function DealDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = parseInt(params.id as string);
  
  const { data: deal, isLoading, error } = useDeal(dealId);
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
      await apiClient(`/deals/${dealId}`, { method: 'PUT', body: JSON.stringify(data) });
      setIsEditOpen(false);
      window.location.reload();
    } catch (error: any) {
      setEditErrors(error.errors || { general: 'Failed to update deal' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this deal?')) {
      try {
        await apiClient(`/deals/${dealId}`, { method: 'DELETE' });
        router.push('/deals');
      } catch (error) {
        alert('Failed to delete deal');
      }
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">Failed to load deal.</div>;
  if (!deal) return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Deal not found.</div>;

  const dealValue = parseFloat(deal.value) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => router.push('/deals')} className="text-gray-400 hover:text-gray-600 transition-colors">Deals</button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-white">{deal.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}><Edit size={14} /> Edit</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm">
              <Handshake size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{deal.title}</h1>
                <StageBadge stage={deal.stage} />
              </div>
              {deal.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">{deal.description}</p>}
              <StageProgress stage={deal.stage} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${dealValue.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">Deal Value</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><TrendingUp size={15} /> Deal Information</h3>
            </div>
            <div className="p-6">
              <Details
                data={{ value: deal.value, stage: deal.stage, probability: deal.probability, priority: deal.priority, expectedCloseDate: deal.expectedCloseDate }}
                labels={{ expectedCloseDate: 'Expected Close' }}
                renders={{
                  value: (v) => <span className="text-lg font-bold text-gray-900 dark:text-white">${parseFloat(v).toLocaleString()}</span>,
                  stage: (v) => <StageBadge stage={v} />,
                  priority: (v) => <PriorityBadge priority={v} />,
                  probability: (v) => {
                    const pct = parseInt(v) || 0;
                    return (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-semibold tabular-nums">{pct}%</span>
                      </div>
                    );
                  },
                  expectedCloseDate: (v) => v ? new Date(v).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null,
                }}
              />
            </div>
          </div>

          {/* Notes */}
          {deal.description && (
            <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
              <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FileText size={15} /> Notes</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{deal.description}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Clock size={15} /> Timeline</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {deal.createdAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40"><Calendar size={12} className="text-emerald-600" /></div>
                    <div><span className="text-gray-400 text-xs">Created</span><p className="text-gray-700 dark:text-gray-300">{new Date(deal.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                  </div>
                )}
                {deal.updatedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40"><Clock size={12} className="text-blue-600" /></div>
                    <div><span className="text-gray-400 text-xs">Last Updated</span><p className="text-gray-700 dark:text-gray-300">{new Date(deal.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                  </div>
                )}
                {deal.expectedCloseDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40"><Calendar size={12} className="text-amber-600" /></div>
                    <div><span className="text-gray-400 text-xs">Expected Close</span><p className="text-gray-700 dark:text-gray-300">{new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                  <DollarSign size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Expected Revenue</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">${(dealValue * ((parseInt(deal.probability) || 0) / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              {deal.expectedCloseDate && (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
                    <Calendar size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Close Date</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(deal.expectedCloseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Actions</h3>
            <div className="space-y-2">
              <Button onClick={() => setIsEditOpen(true)} className="w-full" variant="primary" size="sm"><Edit size={14} /> Edit Deal</Button>
              <Button onClick={handleDelete} className="w-full" variant="outline" size="sm"><Trash2 size={14} /> Delete</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Deal">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input name="title" label="Deal Title" defaultValue={deal.title} required error={editErrors.title} />
          <Input name="value" label="Deal Value" type="number" defaultValue={deal.value} required error={editErrors.value} />
          <Select name="stage" label="Stage" defaultValue={deal.stage} options={[
            { value: 'PROSPECTING', label: 'Prospecting' }, { value: 'QUALIFICATION', label: 'Qualification' },
            { value: 'PROPOSAL', label: 'Proposal' }, { value: 'NEGOTIATION', label: 'Negotiation' },
            { value: 'CLOSED_WON', label: 'Closed Won' }, { value: 'CLOSED_LOST', label: 'Closed Lost' },
          ]} error={editErrors.stage} />
          <Input name="probability" label="Probability (%)" type="number" defaultValue={deal.probability} error={editErrors.probability} />
          <Input name="expectedCloseDate" label="Expected Close Date" type="date" defaultValue={deal.expectedCloseDate} error={editErrors.expectedCloseDate} />
          <Select name="priority" label="Priority" defaultValue={deal.priority} options={[
            { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' },
          ]} error={editErrors.priority} />
          <Textarea name="description" label="Description" defaultValue={deal.description} rows={4} error={editErrors.description} />
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
