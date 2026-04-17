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
import { useTask } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { Edit, Trash2, ListTodo, Clock, AlertCircle, ChevronRight } from 'lucide-react';

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: 'bg-gray-50 text-gray-600 ring-gray-500/20', medium: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    high: 'bg-amber-50 text-amber-700 ring-amber-600/20', urgent: 'bg-red-50 text-red-700 ring-red-600/20',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset capitalize ${colors[priority] || colors.medium}`}>{priority}</span>;
}

function TaskStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20', in_progress: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', cancelled: 'bg-gray-100 text-gray-500 ring-gray-400/20',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset capitalize ${colors[status] || colors.pending}`}>{status?.replace(/_/g, ' ')}</span>;
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = parseInt(params.id as string);

  const { data: task, isLoading, error } = useTask(taskId);
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
      await apiClient(`/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(data) });
      setIsEditOpen(false);
      window.location.reload();
    } catch (error: any) {
      setEditErrors(error.errors || { general: 'Failed to update task' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await apiClient(`/tasks/${taskId}`, { method: 'DELETE' });
        router.push('/tasks');
      } catch (error) {
        alert('Failed to delete task');
      }
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">Failed to load task.</div>;
  if (!task) return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Task not found.</div>;

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'completed';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => router.push('/tasks')} className="text-gray-400 hover:text-gray-600 transition-colors">Tasks</button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{task.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}><Edit size={14} /> Edit</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm">
            <ListTodo size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
              <TaskStatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {isOverdue && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-red-600/20">
                  <AlertCircle size={12} /> Overdue
                </span>
              )}
            </div>
            {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">{task.description}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><ListTodo size={15} /> Task Details</h3>
            </div>
            <div className="p-6">
              <Details
                data={{ status: task.status, priority: task.priority, dueDate: task.dueDate, relatedToType: task.relatedToType, description: task.description }}
                labels={{ dueDate: 'Due Date', relatedToType: 'Related To' }}
                renders={{
                  status: (v) => <TaskStatusBadge status={v} />,
                  priority: (v) => <PriorityBadge priority={v} />,
                  dueDate: (v) => {
                    if (!v) return null;
                    const d = new Date(v);
                    return (
                      <span className={`inline-flex items-center gap-1.5 text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                        <Clock size={14} className={isOverdue ? 'text-red-500' : 'text-gray-400'} />
                        {d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    );
                  },
                  relatedToType: (v) => v ? <span className="capitalize text-sm">{v}</span> : null,
                }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Info</h3>
            <div className="space-y-3">
              {dueDate && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={14} className={isOverdue ? 'text-red-500' : 'text-gray-400'} />
                  <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                    {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {isOverdue && ' (overdue)'}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Actions</h3>
            <div className="space-y-2">
              <Button onClick={() => setIsEditOpen(true)} className="w-full" variant="primary" size="sm"><Edit size={14} /> Edit Task</Button>
              <Button onClick={handleDelete} className="w-full" variant="outline" size="sm"><Trash2 size={14} /> Delete</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Task">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input name="title" label="Task Title" defaultValue={task.title} required error={editErrors.title} />
          <Textarea name="description" label="Description" defaultValue={task.description} rows={4} error={editErrors.description} />
          <Select name="status" label="Status" defaultValue={task.status} options={[
            { value: 'PENDING', label: 'Pending' }, { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'COMPLETED', label: 'Completed' }, { value: 'CANCELLED', label: 'Cancelled' },
          ]} error={editErrors.status} />
          <Select name="priority" label="Priority" defaultValue={task.priority} options={[
            { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
          ]} error={editErrors.priority} />
          <Input name="dueDate" label="Due Date" type="date" defaultValue={task.dueDate} error={editErrors.dueDate} />
          <Input name="assignedTo" label="Assigned To (User ID)" defaultValue={task.assignedTo} error={editErrors.assignedTo} />
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
