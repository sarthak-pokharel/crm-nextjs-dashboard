'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { useLeads } from '@/lib/hooks';

export default function LeadsPage() {
  const router = useRouter();
  const { data: leads, isLoading } = useLeads();

  const columns = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Header title="Leads" description="Track and manage your sales leads" />
        <Button href="/leads/new">Add Lead</Button>
      </div>

      <Table 
        columns={columns} 
        data={leads || []} 
        loading={isLoading}
        onRowClick={(row) => router.push(`/leads/${row.id}`)}
      />
    </div>
  );
}
