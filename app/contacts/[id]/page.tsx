'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Details } from '@/components/details';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { useContact } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { Edit, Trash2, User, Mail, Phone, Briefcase, ChevronRight } from 'lucide-react';

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
      await apiClient(`/contacts/${contactId}`, { method: 'PUT', body: JSON.stringify(data) });
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

  if (isLoading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">Failed to load contact.</div>;
  if (!contact) return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Contact not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => router.push('/contacts')} className="text-gray-400 hover:text-gray-600 transition-colors">Contacts</button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-white">{contact.firstName} {contact.lastName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}><Edit size={14} /> Edit</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-lg font-bold shadow-sm">
            {contact.firstName?.[0]}{contact.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{contact.firstName} {contact.lastName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{contact.jobTitle || 'No title'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><User size={15} /> Contact Information</h3>
            </div>
            <div className="p-6">
              <Details
                data={{ email: contact.email, phone: contact.phone, jobTitle: contact.jobTitle, company: contact.company?.name }}
                labels={{ jobTitle: 'Job Title' }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Info</h3>
            <div className="space-y-3">
              {contact.email && <div className="flex items-center gap-3 text-sm"><Mail size={14} className="text-gray-400" /><span className="text-gray-700 dark:text-gray-300 truncate">{contact.email}</span></div>}
              {contact.phone && <div className="flex items-center gap-3 text-sm"><Phone size={14} className="text-gray-400" /><span className="text-gray-700 dark:text-gray-300">{contact.phone}</span></div>}
              {contact.company?.name && <div className="flex items-center gap-3 text-sm"><Briefcase size={14} className="text-gray-400" /><span className="text-gray-700 dark:text-gray-300">{contact.company.name}</span></div>}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Actions</h3>
            <div className="space-y-2">
              <Button onClick={() => setIsEditOpen(true)} className="w-full" variant="primary" size="sm"><Edit size={14} /> Edit Contact</Button>
              <Button onClick={handleDelete} className="w-full" variant="outline" size="sm"><Trash2 size={14} /> Delete</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Contact">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input name="firstName" label="First Name" defaultValue={contact.firstName} required error={editErrors.firstName} />
          <Input name="lastName" label="Last Name" defaultValue={contact.lastName} required error={editErrors.lastName} />
          <Input name="email" label="Email" type="email" defaultValue={contact.email} required error={editErrors.email} />
          <Input name="jobTitle" label="Job Title" defaultValue={contact.jobTitle} error={editErrors.jobTitle} />
          <Input name="phone" label="Phone" type="tel" defaultValue={contact.phone} error={editErrors.phone} />
          <Input name="companyId" label="Company ID" defaultValue={contact.companyId} error={editErrors.companyId} />
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
