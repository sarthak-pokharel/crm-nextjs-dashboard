'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/button';
import { Table } from '@/components/table';
import { apiClient } from '@/lib/api-client';
import { Users as UsersIcon, Plus, Mail } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiClient('/auth/users', { method: 'GET' });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (_: any, row: Record<string, any>) => `${row.firstName} ${row.lastName}`,
    },
    { 
      key: 'email', 
      label: 'Email',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-gray-400" />
          {value}
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header
        title="Users"
        description="Manage system users and their access"
      />

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <UsersIcon size={20} />
          <span>{users.length} users</span>
        </div>
        <Button onClick={() => router.push('/register')}>
          <Plus size={20} className="mr-2" />
          Add User
        </Button>
      </div>

      <Table columns={columns} data={users} />
    </div>
  );
}
