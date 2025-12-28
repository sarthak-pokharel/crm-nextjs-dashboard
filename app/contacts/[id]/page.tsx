'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Details } from '@/components/details';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { useContact } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = parseInt(params.id as string);
  
  const { data: contact, isLoading, error } = useContact(contactId);
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
      await apiClient(`/contacts/${contactId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setIsEditOpen(false);
      window.location.reload();
    } catch (error: any) {
      setEditErrors(error.errors || { general: 'Failed to update contact' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this contact?')) {
      try {
        await apiClient(`/contacts/${contactId}`, { method: 'DELETE' });
        router.push('/contacts');
      } catch (error) {
        alert('Failed to delete contact');
      }
    }
  };

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading contact</div>;
  if (!contact) return <div className="p-8">Contact not found</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <Header title={`${contact.firstName} ${contact.lastName}`} description={contact.jobTitle || 'Contact'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <Details
              data={{
                email: contact.email,
                phone: contact.phone,
                jobTitle: contact.jobTitle,
                companyId: contact.companyId,
              }}
              labels={{ companyId: 'Company ID' }}
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
            Edit Contact
          </Button>
          <Button 
            onClick={handleDelete} 
            className="w-full"
            variant="outline"
          >
            <Trash2 size={18} className="mr-2" />
            Delete Contact
          </Button>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Contact">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input
            name="firstName"
            label="First Name"
            defaultValue={contact.firstName}
            required
            error={editErrors.firstName}
          />
          
          <Input
            name="lastName"
            label="Last Name"
            defaultValue={contact.lastName}
            required
            error={editErrors.lastName}
          />
          
          <Input
            name="email"
            label="Email"
            type="email"
            defaultValue={contact.email}
            required
            error={editErrors.email}
          />
          
          <Input
            name="jobTitle"
            label="Job Title"
            defaultValue={contact.jobTitle}
            error={editErrors.jobTitle}
          />
          
          <Input
            name="phone"
            label="Phone"
            type="tel"
            defaultValue={contact.phone}
            error={editErrors.phone}
          />
          
          <Input
            name="companyId"
            label="Company ID"
            defaultValue={contact.companyId}
            error={editErrors.companyId}
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
