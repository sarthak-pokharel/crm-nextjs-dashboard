'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Details } from '@/components/details';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { useCompany } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = parseInt(params.id as string);
  
  const { data: company, isLoading, error } = useCompany(companyId);
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
      await apiClient(`/companies/${companyId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setIsEditOpen(false);
      // Refetch company data
      window.location.reload();
    } catch (error: any) {
      setEditErrors(error.errors || { general: 'Failed to update company' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this company?')) {
      try {
        await apiClient(`/companies/${companyId}`, { method: 'DELETE' });
        router.push('/companies');
      } catch (error) {
        alert('Failed to delete company');
      }
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading company</div>;
  if (!company) return <div className="p-8">Company not found</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <Header title={company.name} description={company.industry || 'No industry specified'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <Details
              data={{
                email: company.email,
                website: company.website,
                phone: company.phone,
                employeeCount: company.employeeCount,
                annualRevenue: company.annualRevenue,
              }}
              labels={{
                employeeCount: 'Number of Employees',
                annualRevenue: 'Annual Revenue',
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
            Edit Company
          </Button>
          <Button 
            onClick={handleDelete} 
            className="w-full"
            variant="outline"
          >
            <Trash2 size={18} className="mr-2" />
            Delete Company
          </Button>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Company">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input
            name="name"
            label="Company Name"
            defaultValue={company.name}
            required
            error={editErrors.name}
          />
          
          <Input
            name="industry"
            label="Industry"
            defaultValue={company.industry}
            error={editErrors.industry}
          />
          
          <Input
            name="website"
            label="Website"
            type="url"
            defaultValue={company.website}
            error={editErrors.website}
          />
          
          <Input
            name="email"
            label="Email"
            type="email"
            defaultValue={company.email}
            error={editErrors.email}
          />
          
          <Input
            name="phone"
            label="Phone"
            type="tel"
            defaultValue={company.phone}
            error={editErrors.phone}
          />
          
          <Input
            name="employeeCount"
            label="Number of Employees"
            type="number"
            defaultValue={company.employeeCount}
            error={editErrors.employeeCount}
          />
          
          <Input
            name="annualRevenue"
            label="Annual Revenue"
            type="number"
            defaultValue={company.annualRevenue}
            error={editErrors.annualRevenue}
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
