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
import { useDeal } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

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
      await apiClient(`/deals/${dealId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
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

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading deal</div>;
  if (!deal) return <div className="p-8">Deal not found</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <Header title={deal.title} description={`$${deal.value?.toLocaleString() || '0'}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <Details
              data={{
                value: deal.value,
                stage: deal.stage,
                probability: deal.probability,
                priority: deal.priority,
                expectedCloseDate: deal.expectedCloseDate,
                description: deal.description,
              }}
              labels={{ expectedCloseDate: 'Expected Close Date' }}
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
            Edit Deal
          </Button>
          <Button 
            onClick={handleDelete} 
            className="w-full"
            variant="outline"
          >
            <Trash2 size={18} className="mr-2" />
            Delete Deal
          </Button>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Deal">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input
            name="title"
            label="Deal Title"
            defaultValue={deal.title}
            required
            error={editErrors.title}
          />
          
          <Input
            name="value"
            label="Deal Value"
            type="number"
            defaultValue={deal.value}
            required
            error={editErrors.value}
          />
          
          <Select
            name="stage"
            label="Stage"
            defaultValue={deal.stage}
            options={[
              { value: 'PROSPECTING', label: 'Prospecting' },
              { value: 'QUALIFICATION', label: 'Qualification' },
              { value: 'PROPOSAL', label: 'Proposal' },
              { value: 'NEGOTIATION', label: 'Negotiation' },
              { value: 'CLOSED_WON', label: 'Closed Won' },
              { value: 'CLOSED_LOST', label: 'Closed Lost' },
            ]}
            error={editErrors.stage}
          />
          
          <Input
            name="probability"
            label="Probability (%)"
            type="number"
            defaultValue={deal.probability}
            error={editErrors.probability}
          />
          
          <Input
            name="expectedCloseDate"
            label="Expected Close Date"
            type="date"
            defaultValue={deal.expectedCloseDate}
            error={editErrors.expectedCloseDate}
          />
          
          <Select
            name="priority"
            label="Priority"
            defaultValue={deal.priority}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
            ]}
            error={editErrors.priority}
          />
          
          <Textarea
            name="description"
            label="Description"
            defaultValue={deal.description}
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
