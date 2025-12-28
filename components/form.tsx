'use client';

import { ReactNode } from 'react';

interface FormProps {
    children: ReactNode;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading?: boolean;
    title?: string;
    description?: string;
}

export function Form({ children, onSubmit, isLoading, title, description }: FormProps) {
    return (
        <div className="max-w-2xl">
            {title && (
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                    {description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
                    )}
                </div>
            )}

            <form onSubmit={onSubmit} className={title ? "bg-white dark:bg-gray-800 p-6 rounded-lg shadow" : ""}>
                {children}
            </form>
        </div>
    );
}
