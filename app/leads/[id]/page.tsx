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
import { useLead } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

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
      await apiClient(`/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
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

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading lead</div>;
  if (!lead) return <div className="p-8">Lead not found</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <Header title={`${lead.firstName} ${lead.lastName}`} description={lead.jobTitle || 'Prospect'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <Details
              data={{
                email: lead.email,
                phone: lead.phone,
                jobTitle: lead.jobTitle,
                company: lead.company,
                status: lead.status,
                source: lead.source,
                score: lead.score,
              }}
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
            Edit Lead
          </Button>
          <Button 
            onClick={handleDelete} 
            className="w-full"
            variant="outline"
          >
            <Trash2 size={18} className="mr-2" />
            Delete Lead
          </Button>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Lead">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input
            name="firstName"
            label="First Name"
            defaultValue={lead.firstName}
            required
            error={editErrors.firstName}
          />
          
          <Input
            name="lastName"
            label="Last Name"
            defaultValue={lead.lastName}
            required
            error={editErrors.lastName}
          />
          
          <Input
            name="email"
            label="Email"
            type="email"
            defaultValue={lead.email}
            required
            error={editErrors.email}
          />
          
          <Input
            name="jobTitle"
            label="Job Title"
            defaultValue={lead.jobTitle}
            error={editErrors.jobTitle}
          />
          
          <Input
            name="phone"
            label="Phone"
            type="tel"
            defaultValue={lead.phone}
            error={editErrors.phone}
          />
          
          <Input
            name="company"
            label="Company"
            defaultValue={lead.company}
            error={editErrors.company}
          />
          
          <Select
            name="status"
            label="Status"
            defaultValue={lead.status}
            options={[
              { value: 'NEW', label: 'New' },
              { value: 'CONTACTED', label: 'Contacted' },
              { value: 'QUALIFIED', label: 'Qualified' },
              { value: 'CONVERTED', label: 'Converted' },
              { value: 'LOST', label: 'Lost' },
            ]}
            error={editErrors.status}
          />
          
          <Input
            name="source"
            label="Source"
            defaultValue={lead.source}
            error={editErrors.source}
          />
          
          <Input
            name="score"
            label="Score"
            type="number"
            defaultValue={lead.score}
            error={editErrors.score}
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
