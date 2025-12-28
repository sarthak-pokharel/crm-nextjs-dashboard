'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { useContacts } from '@/lib/hooks';

export default function ContactsPage() {
  const router = useRouter();
  const { data: contacts, isLoading } = useContacts();

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'phone', label: 'Phone' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Header title="Contacts" description="Manage your business contacts" />
        <Button href="/contacts/new">Add Contact</Button>
      </div>

      <Table 
        columns={columns} 
        data={contacts || []} 
        loading={isLoading}
        onRowClick={(row) => router.push(`/contacts/${row.id}`)}
      />
    </div>
  );
}
