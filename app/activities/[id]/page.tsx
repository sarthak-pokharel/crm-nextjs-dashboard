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
import { useActivity } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { Edit, Trash2, Calendar, CheckCircle2, Circle, ChevronRight } from 'lucide-react';

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { icon: string; color: string }> = {
    call: { icon: '📞', color: 'bg-blue-50 text-blue-700 ring-blue-600/20' },
    email: { icon: '✉️', color: 'bg-purple-50 text-purple-700 ring-purple-600/20' },
    meeting: { icon: '🤝', color: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
    note: { icon: '📝', color: 'bg-gray-50 text-gray-600 ring-gray-500/20' },
    task: { icon: '✅', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  };
  const c = config[type] || config.note;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset capitalize ${c.color}`}>{c.icon} {type}</span>;
}

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = parseInt(params.id as string);
  
  const { data: activity, isLoading, error } = useActivity(activityId);
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
      await apiClient(`/activities/${activityId}`, { method: 'PUT', body: JSON.stringify(data) });
      setIsEditOpen(false);
      window.location.reload();
    } catch (error: any) {
      setEditErrors(error.errors || { general: 'Failed to update activity' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        await apiClient(`/activities/${activityId}`, { method: 'DELETE' });
        router.push('/activities');
      } catch (error) {
        alert('Failed to delete activity');
      }
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">Failed to load activity.</div>;
  if (!activity) return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Activity not found.</div>;

  const typeIcons: Record<string, string> = { call: '📞', email: '✉️', meeting: '🤝', note: '📝', task: '✅' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => router.push('/activities')} className="text-gray-400 hover:text-gray-600 transition-colors">Activities</button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-white">{activity.subject}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}><Edit size={14} /> Edit</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-2xl shadow-sm">
            {typeIcons[activity.type] || '📌'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{activity.subject}</h1>
              <TypeBadge type={activity.type} />
              {activity.isCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-emerald-600/20"><CheckCircle2 size={12} /> Completed</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-gray-500/20"><Circle size={12} /> Pending</span>
              )}
            </div>
            {activity.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">{activity.description}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Calendar size={15} /> Activity Details</h3>
            </div>
            <div className="p-6">
              <Details
                data={{ type: activity.type, activityDate: activity.activityDate, relationType: activity.relationType, status: activity.isCompleted, description: activity.description }}
                labels={{ activityDate: 'Date', relationType: 'Related To', status: 'Completion' }}
                renders={{
                  type: (v) => <TypeBadge type={v} />,
                  activityDate: (v) => v ? new Date(v).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : null,
                  relationType: (v) => v ? <span className="capitalize text-sm">{v}</span> : null,
                  status: (v) => v ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600"><CheckCircle2 size={14} /> Completed</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400"><Circle size={14} /> Pending</span>
                  ),
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Actions</h3>
            <div className="space-y-2">
              <Button onClick={() => setIsEditOpen(true)} className="w-full" variant="primary" size="sm"><Edit size={14} /> Edit Activity</Button>
              <Button onClick={handleDelete} className="w-full" variant="outline" size="sm"><Trash2 size={14} /> Delete</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Activity">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input name="subject" label="Subject" defaultValue={activity.subject} required error={editErrors.subject} />
          <Select name="type" label="Activity Type" defaultValue={activity.type} options={[
            { value: 'CALL', label: 'Call' }, { value: 'EMAIL', label: 'Email' }, { value: 'MEETING', label: 'Meeting' },
            { value: 'NOTE', label: 'Note' }, { value: 'TASK', label: 'Task' },
          ]} error={editErrors.type} />
          <Input name="activityDate" label="Activity Date" type="datetime-local" defaultValue={activity.activityDate} required error={editErrors.activityDate} />
          <Select name="relationType" label="Related To" defaultValue={activity.relationType} options={[
            { value: 'COMPANY', label: 'Company' }, { value: 'CONTACT', label: 'Contact' },
            { value: 'DEAL', label: 'Deal' }, { value: 'LEAD', label: 'Lead' },
          ]} error={editErrors.relationType} />
          <Textarea name="description" label="Description" defaultValue={activity.description} rows={4} error={editErrors.description} />
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
