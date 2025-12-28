'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { apiClient } from '@/lib/api-client';
import { usePermissionsContext } from '@/lib/PermissionsProvider';

export default function CreateCompanyPage() {
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
      employeeCount: rawData.employeeCount ? Number(rawData.employeeCount) : undefined,
      annualRevenue: rawData.annualRevenue ? Number(rawData.annualRevenue) : undefined,
      organizationId,
    };

    try {
      await apiClient('/companies', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      router.push('/companies');
    } catch (error: any) {
      setErrors(error.errors || { general: 'Failed to create company' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header title="Create Company" description="Add a new company to your CRM" />
      
      <Form onSubmit={handleSubmit} isLoading={isLoading}>
        <Input
          name="name"
          label="Company Name"
          placeholder="Enter company name"
          required
          error={errors.name}
        />
        
        <Input
          name="industry"
          label="Industry"
          placeholder="e.g., Technology, Finance"
          error={errors.industry}
        />
        
        <Input
          name="website"
          label="Website"
          type="url"
          placeholder="https://example.com"
          error={errors.website}
        />
        
        <Input
          name="email"
          label="Email"
          type="email"
          placeholder="contact@company.com"
          error={errors.email}
        />
        
        <Input
          name="phone"
          label="Phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          error={errors.phone}
        />
        
        <Input
          name="employeeCount"
          label="Number of Employees"
          type="number"
          placeholder="0"
          error={errors.employeeCount}
        />
        
        <Input
          name="annualRevenue"
          label="Annual Revenue"
          type="number"
          placeholder="0"
          error={errors.annualRevenue}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} variant="primary">
            {isLoading ? 'Creating...' : 'Create Company'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}
