'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { useDeals } from '@/lib/hooks';

export default function DealsPage() {
  const router = useRouter();
  const { data: deals, isLoading } = useDeals();

  const columns = [
    { key: 'title', label: 'Deal Title' },
    { key: 'value', label: 'Value' },
    { key: 'stage', label: 'Stage' },
    { key: 'probability', label: 'Probability' },
    { key: 'expectedCloseDate', label: 'Expected Close' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Header title="Deals" description="Monitor your sales pipeline" />
        <Button href="/deals/new">Add Deal</Button>
      </div>

      <Table 
        columns={columns} 
        data={deals || []} 
        loading={isLoading}
        onRowClick={(row) => router.push(`/deals/${row.id}`)}
      />
    </div>
  );
}
