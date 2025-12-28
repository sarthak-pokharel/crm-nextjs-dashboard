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
            <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg dark:border-gray-800">
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {data.map((row, idx) => (
                        <tr
                            key={idx}
                            onClick={() => onRowClick?.(row)}
                            className={onRowClick ? 'hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer' : ''}
                        >
                            {columns.map((col) => (
                                <td key={col.key} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
