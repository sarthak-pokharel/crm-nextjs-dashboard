'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { useActivities } from '@/lib/hooks';

export default function ActivitiesPage() {
  const router = useRouter();
  const { data: activities, isLoading } = useActivities();

  const columns = [
    { key: 'subject', label: 'Subject' },
    { key: 'type', label: 'Type' },
    { key: 'relationType', label: 'Related To' },
    { key: 'activityDate', label: 'Date' },
    { key: 'isCompleted', label: 'Status' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Header title="Activities" description="Track all your interactions" />
        <Button href="/activities/new">Add Activity</Button>
      </div>

      <Table 
        columns={columns} 
        data={activities || []} 
        loading={isLoading}
        onRowClick={(row) => router.push(`/activities/${row.id}`)}
      />
    </div>
  );
}
