interface Column {
    key: string;
    label: string;
    render?: (value: any, row: Record<string, any>) => React.ReactNode;
}

interface TableProps {
    columns: Array<Column>;
    data: Array<Record<string, any>>;
    loading?: boolean;
    onRowClick?: (row: Record<string, any>) => void;
}

export function Table({ columns, data, loading, onRowClick }: TableProps) {
    if (loading) {
        return (
            <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center justify-center h-48">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
                        <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No records found</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Get started by creating a new entry</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/50">
                            {columns.map((col) => (
                                <th key={col.key} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                        {data.map((row, idx) => (
                            <tr
                                key={idx}
                                onClick={() => onRowClick?.(row)}
                                className={`transition-colors ${onRowClick ? 'hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer' : ''}`}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-5 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? <span className="text-gray-300 dark:text-gray-600">—</span>)}
                                    </td>
                                ))}
                            </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    );
}
