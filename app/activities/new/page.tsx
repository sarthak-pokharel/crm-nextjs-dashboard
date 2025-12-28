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

export default function CreateActivityPage() {
  const router = useRouter();
  const { organizationId } = usePermissionsContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      ...Object.fromEntries(formData),
      organizationId,
    };

    try {
      await apiClient('/activities', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      router.push('/activities');
    } catch (error: any) {
      setErrors(error.errors || { general: 'Failed to create activity' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header title="Create Activity" description="Log a new activity" />
      
      <Form onSubmit={handleSubmit} isLoading={isLoading}>
        <Input
          name="subject"
          label="Subject"
          placeholder="Activity subject"
          required
          error={errors.subject}
        />
        
        <Select
          name="type"
          label="Activity Type"
          options={[
            { value: 'CALL', label: 'Call' },
            { value: 'EMAIL', label: 'Email' },
            { value: 'MEETING', label: 'Meeting' },
            { value: 'NOTE', label: 'Note' },
            { value: 'TASK', label: 'Task' },
          ]}
          error={errors.type}
        />
        
        <Input
          name="activityDate"
          label="Activity Date"
          type="datetime-local"
          required
          error={errors.activityDate}
        />
        
        <Select
          name="relationType"
          label="Related To"
          options={[
            { value: 'COMPANY', label: 'Company' },
            { value: 'CONTACT', label: 'Contact' },
            { value: 'DEAL', label: 'Deal' },
            { value: 'LEAD', label: 'Lead' },
          ]}
          error={errors.relationType}
        />
        
        <Input
          name="relationId"
          label="Related Entity ID"
          placeholder="Entity ID"
          error={errors.relationId}
        />
        
        <Textarea
          name="description"
          label="Description"
          placeholder="Activity details"
          rows={4}
          error={errors.description}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} variant="primary">
            {isLoading ? 'Creating...' : 'Create Activity'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}
