'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Modal } from '@/components/modal';
import { Details } from '@/components/details';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { useCompany } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { Edit, Trash2, Building2, Globe, Mail, Phone, Users, DollarSign, ChevronRight, MapPin, Clock, Calendar, FileText } from 'lucide-react';

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
      await apiClient(`/companies/${companyId}`, { method: 'PUT', body: JSON.stringify(data) });
      setIsEditOpen(false);
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

  if (isLoading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" /></div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">Failed to load company.</div>;
  if (!company) return <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Company not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => router.push('/companies')} className="text-gray-400 hover:text-gray-600 transition-colors">Companies</button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-white">{company.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}><Edit size={14} /> Edit</Button>
          <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /> Delete</Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-sm">
            <Building2 size={24} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{company.industry || 'No industry specified'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Building2 size={15} /> Company Details</h3>
            </div>
            <div className="p-6">
              <Details
                data={{ email: company.email, website: company.website, phone: company.phone, employeeCount: company.employeeCount, annualRevenue: company.annualRevenue }}
                labels={{ employeeCount: 'Employees', annualRevenue: 'Annual Revenue' }}
                renders={{
                  website: (v) => v ? <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">{v}</a> : null,
                  annualRevenue: (v) => v ? <span className="font-semibold">${parseFloat(v).toLocaleString()}</span> : null,
                  employeeCount: (v) => v ? <span>{v.toLocaleString()} people</span> : null,
                }}
              />
            </div>
          </div>

          {/* Address Section */}
          {(company.address || company.city || company.state || company.country) && (
            <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
              <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><MapPin size={15} /> Location</h3>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40 mt-0.5"><MapPin size={16} className="text-rose-500" /></div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {company.address && <p>{company.address}</p>}
                    <p>{[company.city, company.state, company.zipCode].filter(Boolean).join(', ')}</p>
                    {company.country && <p className="text-gray-400">{company.country}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {company.description && (
            <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
              <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FileText size={15} /> About</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{company.description}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Clock size={15} /> Timeline</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {company.createdAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40"><Calendar size={12} className="text-emerald-600" /></div>
                    <div><span className="text-gray-400 text-xs">Created</span><p className="text-gray-700 dark:text-gray-300">{new Date(company.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                  </div>
                )}
                {company.updatedAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40"><Clock size={12} className="text-blue-600" /></div>
                    <div><span className="text-gray-400 text-xs">Last Updated</span><p className="text-gray-700 dark:text-gray-300">{new Date(company.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Quick Info</h3>
            <div className="space-y-3">
              {company.email && <div className="flex items-center gap-3 text-sm"><Mail size={14} className="text-gray-400" /><span className="text-gray-700 dark:text-gray-300 truncate">{company.email}</span></div>}
              {company.phone && <div className="flex items-center gap-3 text-sm"><Phone size={14} className="text-gray-400" /><span className="text-gray-700 dark:text-gray-300">{company.phone}</span></div>}
              {company.website && <div className="flex items-center gap-3 text-sm"><Globe size={14} className="text-gray-400" /><span className="text-gray-700 dark:text-gray-300 truncate">{company.website}</span></div>}
              {company.employeeCount && <div className="flex items-center gap-3 text-sm"><Users size={14} className="text-gray-400" /><span className="text-gray-700 dark:text-gray-300">{company.employeeCount} employees</span></div>}
              {company.annualRevenue && <div className="flex items-center gap-3 text-sm"><DollarSign size={14} className="text-gray-400" /><span className="text-gray-700 dark:text-gray-300">${parseFloat(company.annualRevenue).toLocaleString()}</span></div>}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Actions</h3>
            <div className="space-y-2">
              <Button onClick={() => setIsEditOpen(true)} className="w-full" variant="primary" size="sm"><Edit size={14} /> Edit Company</Button>
              <Button onClick={handleDelete} className="w-full" variant="outline" size="sm"><Trash2 size={14} /> Delete</Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Company">
        <Form onSubmit={handleUpdate} isLoading={isSaving}>
          <Input name="name" label="Company Name" defaultValue={company.name} required error={editErrors.name} />
          <Input name="industry" label="Industry" defaultValue={company.industry} error={editErrors.industry} />
          <Input name="website" label="Website" type="url" defaultValue={company.website} error={editErrors.website} />
          <Input name="email" label="Email" type="email" defaultValue={company.email} error={editErrors.email} />
          <Input name="phone" label="Phone" type="tel" defaultValue={company.phone} error={editErrors.phone} />
          <Input name="employeeCount" label="Number of Employees" type="number" defaultValue={company.employeeCount} error={editErrors.employeeCount} />
          <Input name="annualRevenue" label="Annual Revenue" type="number" defaultValue={company.annualRevenue} error={editErrors.annualRevenue} />
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
