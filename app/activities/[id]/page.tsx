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
import { useActivity } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

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
      await apiClient(`/activities/${activityId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
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

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading activity</div>;
  if (!activity) return <div className="p-8">Activity not found</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <Header title={activity.subject} description={activity.type || 'Activity'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <Details
              data={{
                type: activity.type,
                activityDate: activity.activityDate,
                relationType: activity.relationType,
                isCompleted: activity.isCompleted ? 'Yes' : 'No',
                description: activity.description,
              }}
              labels={{ activityDate: 'Activity Date', relationType: 'Related To' }}
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
            Edit Activity
          </Button>
          <Button 
            onClick={handleDelete} 
            className="w-full"
            variant="outline"
          >
            <Trash2 size={18} className="mr-2" />
            Delete Activity
          </Button>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Activity">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input
            name="subject"
            label="Subject"
            defaultValue={activity.subject}
            required
            error={editErrors.subject}
          />
          
          <Select
            name="type"
            label="Activity Type"
            defaultValue={activity.type}
            options={[
              { value: 'CALL', label: 'Call' },
              { value: 'EMAIL', label: 'Email' },
              { value: 'MEETING', label: 'Meeting' },
              { value: 'NOTE', label: 'Note' },
              { value: 'TASK', label: 'Task' },
            ]}
            error={editErrors.type}
          />
          
          <Input
            name="activityDate"
            label="Activity Date"
            type="datetime-local"
            defaultValue={activity.activityDate}
            required
            error={editErrors.activityDate}
          />
          
          <Select
            name="relationType"
            label="Related To"
            defaultValue={activity.relationType}
            options={[
              { value: 'COMPANY', label: 'Company' },
              { value: 'CONTACT', label: 'Contact' },
              { value: 'DEAL', label: 'Deal' },
              { value: 'LEAD', label: 'Lead' },
            ]}
            error={editErrors.relationType}
          />
          
          <Textarea
            name="description"
            label="Description"
            defaultValue={activity.description}
            rows={4}
            error={editErrors.description}
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
