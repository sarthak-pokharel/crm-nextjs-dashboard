'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { useCompanies } from '@/lib/hooks';

export default function CompaniesPage() {
  const router = useRouter();
  const { data: companies, isLoading } = useCompanies();

  const columns = [
    { key: 'name', label: 'Company Name' },
    { key: 'industry', label: 'Industry' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Header title="Companies" description="Manage all your companies" />
        <Button href="/companies/new">Add Company</Button>
      </div>

      <Table 
        columns={columns} 
        data={companies || []} 
        loading={isLoading}
        onRowClick={(row) => router.push(`/companies/${row.id}`)}
      />
    </div>
  );
}
