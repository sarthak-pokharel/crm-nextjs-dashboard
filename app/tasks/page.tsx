'use client';

import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { useMyTasks } from '@/lib/hooks';

export default function TasksPage() {
  const router = useRouter();
  const { data: tasks, isLoading } = useMyTasks();

  const columns = [
    { key: 'title', label: 'Task' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'relatedToType', label: 'Related To' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Header title="My Tasks" description="Stay on top of your tasks" />
        <Button href="/tasks/new">Add Task</Button>
      </div>

      <Table 
        columns={columns} 
        data={tasks || []} 
        loading={isLoading}
        onRowClick={(row) => router.push(`/tasks/${row.id}`)}
      />
    </div>
  );
}
