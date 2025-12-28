'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { apiClient } from '@/lib/api-client';
import { usePermissionsContext } from '@/lib/PermissionsProvider';

export default function CreateLeadPage() {
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
      await apiClient('/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      router.push('/leads');
    } catch (error: any) {
      setErrors(error.errors || { general: 'Failed to create lead' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header title="Create Lead" description="Add a new sales lead" />
      
      <Form onSubmit={handleSubmit} isLoading={isLoading}>
        <Input
          name="firstName"
          label="First Name"
          placeholder="John"
          required
          error={errors.firstName}
        />
        
        <Input
          name="lastName"
          label="Last Name"
          placeholder="Doe"
          required
          error={errors.lastName}
        />
        
        <Input
          name="email"
          label="Email"
          type="email"
          placeholder="john@example.com"
          required
          error={errors.email}
        />
        
        <Input
          name="jobTitle"
          label="Job Title"
          placeholder="Marketing Manager"
          error={errors.jobTitle}
        />
        
        <Input
          name="phone"
          label="Phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          error={errors.phone}
        />
        
        <Input
          name="company"
          label="Company"
          placeholder="Company name"
          error={errors.company}
        />
        
        <Input
          name="source"
          label="Source"
          placeholder="e.g., LinkedIn, Referral, Website"
          error={errors.source}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} variant="primary">
            {isLoading ? 'Creating...' : 'Create Lead'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}
