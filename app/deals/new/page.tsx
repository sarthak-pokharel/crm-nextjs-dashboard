'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { Select } from '@/components/select';
import { Textarea } from '@/components/textarea';
import { Button } from '@/components/button';
import { apiClient } from '@/lib/api-client';
import { usePermissionsContext } from '@/lib/PermissionsProvider';

export default function CreateDealPage() {
  const router = useRouter();
  const { organizationId } = usePermissionsContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData);
    
    // Convert numeric fields to numbers
    const data = {
      ...rawData,
      value: rawData.value ? Number(rawData.value) : undefined,
      probability: rawData.probability ? Number(rawData.probability) : undefined,
      organizationId,
    };

    try {
      await apiClient('/deals', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      router.push('/deals');
    } catch (error: any) {
      setErrors(error.errors || { general: 'Failed to create deal' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header title="Create Deal" description="Add a new sales deal" />
      
      <Form onSubmit={handleSubmit} isLoading={isLoading}>
        <Input
          name="title"
          label="Deal Title"
          placeholder="Enter deal title"
          required
          error={errors.title}
        />
        
        <Input
          name="value"
          label="Deal Value"
          type="number"
          placeholder="0"
          required
          error={errors.value}
        />
        
        <Select
          name="stage"
          label="Stage"
          options={[
            { value: 'PROSPECTING', label: 'Prospecting' },
            { value: 'QUALIFICATION', label: 'Qualification' },
            { value: 'PROPOSAL', label: 'Proposal' },
            { value: 'NEGOTIATION', label: 'Negotiation' },
            { value: 'CLOSED_WON', label: 'Closed Won' },
            { value: 'CLOSED_LOST', label: 'Closed Lost' },
          ]}
          error={errors.stage}
        />
        
        <Input
          name="probability"
          label="Probability (%)"
          type="number"
          placeholder="0-100"
          error={errors.probability}
        />
        
        <Input
          name="expectedCloseDate"
          label="Expected Close Date"
          type="date"
          error={errors.expectedCloseDate}
        />
        
        <Select
          name="priority"
          label="Priority"
          options={[
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
          ]}
          error={errors.priority}
        />
        
        <Textarea
          name="description"
          label="Description"
          placeholder="Enter deal description"
          rows={4}
          error={errors.description}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} variant="primary">
            {isLoading ? 'Creating...' : 'Create Deal'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}
