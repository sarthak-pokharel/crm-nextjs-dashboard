'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Form } from '@/components/form';
import { Input } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { Button } from '@/components/button';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateOrganizationPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            console.log('[Create Org] Submitting:', data);
            const response = await apiClient('/organizations', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            
            console.log('[Create Org] Response:', response);
            
            // Redirect to the new organization's page
            if (response && typeof response.id === 'number' && response.id > 0) {
                console.log('[Create Org] Redirecting to:', `/organizations/${response.id}`);
                router.push(`/organizations/${response.id}`);
            } else {
                console.warn('[Create Org] Invalid response structure:', response);
                // Fallback: try to get ID from response
                const id = response?.id || response?.[0]?.id;
                if (id) {
                    console.log('[Create Org] Found ID in response, redirecting to:', `/organizations/${id}`);
                    router.push(`/organizations/${id}`);
                } else {
                    console.log('[Create Org] No valid ID found, redirecting to list');
                    router.push('/organizations');
                }
            }
        } catch (error: any) {
            console.error('[Create Org] Error:', error);
            setErrors(error.errors || { general: 'Failed to create organization' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Link href="/organizations" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
                <ArrowLeft size={16} />
                Back to Organizations
            </Link>

            <Header
                title="Create Organization"
                description="Add a new organization to your system"
            />

            <div className="max-w-2xl">
                <Form onSubmit={handleSubmit} isLoading={isLoading}>
                    <Input
                        name="name"
                        label="Organization Name"
                        placeholder="Acme Corporation"
                        required
                        error={errors.name}
                    />

                    <Input
                        name="slug"
                        label="Slug"
                        placeholder="acme-corp (auto-generated if empty)"
                        error={errors.slug}

                    />

                    <Textarea
                        name="description"
                        label="Description"
                        placeholder="Brief description of the organization"
                        error={errors.description}
                    />

                    <Input
                        name="website"
                        label="Website"
                        type="url"
                        placeholder="https://example.com"
                        error={errors.website}
                    />

                    <Input
                        name="logo"
                        label="Logo URL"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        error={errors.logo}
                    />

                    {errors.general && (
                        <div className="text-red-600 text-sm">{errors.general}</div>
                    )}

                    <div className="flex gap-4">
                        <Button type="submit" disabled={isLoading} variant="primary">
                            {isLoading ? 'Creating...' : 'Create Organization'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => router.back()}>
                            Cancel
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}
