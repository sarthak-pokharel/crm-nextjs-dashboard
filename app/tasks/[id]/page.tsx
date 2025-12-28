'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Details } from '@/components/details';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { Select } from '@/components/select';
import { Textarea } from '@/components/textarea';
import { useTask } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

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
      await apiClient(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
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

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading task</div>;
  if (!task) return <div className="p-8">Task not found</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <Header title={task.title} description={task.status || 'Task'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <Details
              data={{
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                assignedTo: task.assignedTo,
                description: task.description,
              }}
              labels={{ assignedTo: 'Assigned To', dueDate: 'Due Date' }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => setIsEditOpen(true)} 
            className="w-full"
            variant="primary"
          >
            <Edit size={18} className="mr-2" />
            Edit Task
          </Button>
          <Button 
            onClick={handleDelete} 
            className="w-full"
            variant="outline"
          >
            <Trash2 size={18} className="mr-2" />
            Delete Task
          </Button>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Task">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input
            name="title"
            label="Task Title"
            defaultValue={task.title}
            required
            error={editErrors.title}
          />
          
          <Textarea
            name="description"
            label="Description"
            defaultValue={task.description}
            rows={4}
            error={editErrors.description}
          />
          
          <Select
            name="status"
            label="Status"
            defaultValue={task.status}
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'CANCELLED', label: 'Cancelled' },
            ]}
            error={editErrors.status}
          />
          
          <Select
            name="priority"
            label="Priority"
            defaultValue={task.priority}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' },
            ]}
            error={editErrors.priority}
          />
          
          <Input
            name="dueDate"
            label="Due Date"
            type="date"
            defaultValue={task.dueDate}
            error={editErrors.dueDate}
          />
          
          <Input
            name="assignedTo"
            label="Assigned To (User ID)"
            defaultValue={task.assignedTo}
            error={editErrors.assignedTo}
          />

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSaving} variant="primary">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
