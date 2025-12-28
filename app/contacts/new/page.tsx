'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { apiClient } from '@/lib/api-client';
import { usePermissionsContext } from '@/lib/PermissionsProvider';

export default function CreateContactPage() {
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
      await apiClient('/contacts', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      router.push('/contacts');
    } catch (error: any) {
      setErrors(error.errors || { general: 'Failed to create contact' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header title="Create Contact" description="Add a new contact" />
      
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
          placeholder="Manager"
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
          name="companyId"
          label="Company ID"
          placeholder="Company ID"
          error={errors.companyId}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} variant="primary">
            {isLoading ? 'Creating...' : 'Create Contact'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}
