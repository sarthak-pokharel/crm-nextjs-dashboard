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

export default function CreateTaskPage() {
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
      await apiClient('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      router.push('/tasks');
    } catch (error: any) {
      setErrors(error.errors || { general: 'Failed to create task' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header title="Create Task" description="Create a new task" />
      
      <Form onSubmit={handleSubmit} isLoading={isLoading}>
        <Input
          name="title"
          label="Task Title"
          placeholder="What needs to be done?"
          required
          error={errors.title}
        />
        
        <Textarea
          name="description"
          label="Description"
          placeholder="Task details"
          rows={4}
          error={errors.description}
        />
        
        <Select
          name="status"
          label="Status"
          options={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
          error={errors.status}
        />
        
        <Select
          name="priority"
          label="Priority"
          options={[
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
            { value: 'URGENT', label: 'Urgent' },
          ]}
          error={errors.priority}
        />
        
        <Input
          name="dueDate"
          label="Due Date"
          type="date"
          error={errors.dueDate}
        />
        
        <Input
          name="assignedTo"
          label="Assigned To (User ID)"
          placeholder="User ID"
          error={errors.assignedTo}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} variant="primary">
            {isLoading ? 'Creating...' : 'Create Task'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}
