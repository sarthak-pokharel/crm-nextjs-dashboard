'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { apiClient } from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
    };

    try {
      const response = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Store token in localStorage
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Also store in cookie for middleware
      document.cookie = `token=${response.accessToken}; path=/; max-age=86400`;

      // Redirect to dashboard
      router.push('/');
      router.refresh();
    } catch (error: any) {
      setErrors(error.errors || { general: error.message || 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">CRM</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          {errors.general && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
              {errors.general}
            </div>
          )}

          <Input
            name="firstName"
            label="First Name"
            placeholder="John"
            required
            error={errors.firstName}
          />

          <Input
            name="lastName"
            label="Last Name"
            placeholder="Doe"
            required
            error={errors.lastName}
          />

          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            required
            error={errors.email}
          />

          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            required
            error={errors.password}
          />

          <Input
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            required
            error={errors.confirmPassword}
          />

          <Button type="submit" disabled={isLoading} className="w-full" variant="primary">
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
