import React from 'react';
import { motion } from 'framer-motion';

export type Column<T> = {
    header: string;
    accessor: keyof T;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
    className?: string;
};

type DataTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    striped?: boolean;
    noDataMessage?: string;
    error?: boolean;
};

const DataTable = <T,>({
    data,
    columns,
    loading = false,
    striped = false,
    noDataMessage = 'No data available',
    error = false,
}: DataTableProps<T>) => {
    return (
        <div className="w-full rounded-lg overflow-hidden">
            <motion.table
                className="min-w-full text-sm text-left"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: {},
                    visible: {
                        transition: {
                            staggerChildren: 0.05,
                        },
                    },
                }}
            >
                <thead className="bg-[#364153] text-gray-200 uppercase text-xs tracking-wider">
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} className={`px-6 py-3 ${col.className ?? ''}`}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {error ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-6 text-center text-red-400">
                                Failed to load data.
                            </td>
                        </tr>
                    ) : loading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-6 text-center text-gray-400">
                                Loading...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-6 text-center text-gray-400">
                                {noDataMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <motion.tr
                                key={rowIndex}
                                variants={{
                                    hidden: { opacity: 0, y: 0 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className={`transition-all duration-300 ${striped ? (rowIndex % 2 === 0 ? 'bg-[#364153]' : '') : ''
                                    } hover:bg-[#1f2937]`}
                            >
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className={`px-6 py-4 ${col.className ?? ''}`}>
                                        {col.render
                                            ? col.render(row[col.accessor], row)
                                            : (row[col.accessor] as React.ReactNode)}
                                    </td>
                                ))}
                            </motion.tr>
                        ))
                    )}
                </tbody>
            </motion.table>
        </div>
    );
};

export default DataTable;