"use client";

import React, { useState, useMemo } from "react";
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import DataTable, { Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { useAllBills, useDeleteBill } from "@/hooks/useBill";
import { useDebounce } from "@/hooks/useDebounce";
import { Bill, MonthlyTrend, TopProduct } from "@/types/bill.type";
import { usePopup } from "@/components/ui/DialogProvider";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import Notify from "@/utils/notify";
import { Download, Trash } from "lucide-react";
import { StatCard } from "@/components/ui/card/StatCard";
import { calculatePercentage, formatCurrency, formatCurrencyShort } from "@/utils/formatCurrency";
import { ChartCard } from "@/components/ui/card/ChartCard";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const BillPage = () => {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [invoiceNo, setInvoiceNo] = useState("");
    const [date, setDate] = useState("");
    const debouncedInvoiceNo = useDebounce(invoiceNo, 1000);

    const { showPopup, hidePopup } = usePopup();

    const { data, isLoading, error } = useAllBills({
        page,
        limit,
        invoiceNo: debouncedInvoiceNo,
        date: date,
    });

    const transformMonthlyTrendData = (monthlyTrend?: MonthlyTrend[] | null) => {
        const labels = monthlyTrend?.map(item => item.label) ?? [];
        const dataPoints = monthlyTrend?.map(item => item.totalRevenue) ?? [];

        return {
            labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: dataPoints,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                },
            ],
        };
    };

    const transformTopProductsData = (topProducts?: TopProduct[] | null) => {
        const labels = topProducts?.map(item => item.name ?? "Unknown") ?? [];
        const dataPoints = topProducts?.map(item => item.totalRevenue) ?? [];

        return {
            labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: dataPoints,
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.6)',
                },
            ],
        };
    };


    const deleteBill = useDeleteBill();

    const handleDelete = (row: Bill) => {
        showPopup({
            children: (
                <DeleteDialog
                    title="Bill"
                    subTitle={`${row.clientName} & ${row.invoiceNo}`}
                    isSubmitting={false}
                    closePopup={hidePopup}
                    handleDelete={async () => {
                        try {
                            await deleteBill.mutateAsync(row.id ?? "");
                        } catch {
                            Notify("danger", "Delete failed", "Error");
                        }
                        hidePopup();
                    }}
                />
            ),
            width: "w-full max-w-md",
            backdropOpacity: 0.4,
        });
    };

    const columns: Column<Bill>[] = [
        { header: "Invoice No.", accessor: "invoiceNo" },
        {
            header: "Date",
            accessor: "date",
            render: (value) => {
                const [y, m, d] = value.split("-");
                return `${d}-${m}-${y}`;
            },
        },
        { header: "Client Name", accessor: "clientName" },
        {
            header: "",
            accessor: "pdfUrl",
            render: (value, row) => (
                <div className="flex flex-col justify-end sm:flex-row gap-2">
                    <Button
                        onClick={() => window.open(value, "_blank")}
                        icon={<Download className="w-4 h-4" />}
                        variant="ghost"
                    >
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-red-500 cursor-pointer inline-flex items-center gap-1"
                        isLoading={deleteBill.isPending && deleteBill.variables === row.id}
                        icon={<Trash className="w-4 h-4" />}
                        onClick={() => handleDelete(row)}
                    >
                    </Button>
                </div>

            ),
        },
    ];

    return (
        <>
            <div className="flex p-4 justify-between items-center gap-3">
                <h1 className="text-sm md:text-xl font-semibold text-center">
                    All Bills
                </h1>
                <Button
                    type="button"
                    variant="primary"
                    onClick={() => router.push("/dashboard")}
                >
                    Add Bill
                </Button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Total Revenue"
                    value={data?.statistics?.totalRevenue ?? 0}
                    subtitle={`${data?.pagination?.totalItems ?? 0} total bills`}
                    subtitleCount={data?.pagination?.totalItems ?? 0}
                    // change="12.5%"
                    // changeType="positive"
                    icon="revenue"
                    isCurrency
                    delay={0}
                />
                <StatCard
                    title="Average Bill"
                    value={Math.round(data?.statistics?.averageBill ?? 0)}
                    subtitle={`Min: ${formatCurrency(data?.statistics?.minBill ?? 0)} | Max: ${formatCurrency(
                        data?.statistics?.maxBill ?? 0
                    )}`}
                    icon="average"
                    isCurrency
                    delay={100}
                />
                <StatCard
                    title="Received Bills"
                    value={data?.statistics?.receivedCount ?? 0}
                    subtitle={`${calculatePercentage(
                        data?.statistics?.receivedCount ?? 0,
                        data?.pagination?.totalItems ?? 0
                    )}% of total bills`}
                    // change="8.3%"
                    // changeType="positive"
                    icon="received"
                    delay={200}
                />
                <StatCard
                    title="Pending Bills"
                    value={data?.statistics?.pendingCount ?? 0}
                    subtitle={`${calculatePercentage(
                        data?.statistics?.pendingCount ?? 0,
                        data?.pagination?.totalItems ?? 0
                    )}% of total bills`}
                    // change="15.2%"
                    // changeType="negative"
                    icon="pending"
                    delay={300}
                />
            </div>

            {/* Charts Grid */}
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Monthly Revenue Trend" delay={400}>
                    {data?.monthlyTrend?.length ? (
                        <Line
                            data={transformMonthlyTrendData(data.monthlyTrend)}
                            options={{
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            color: '#a7a9a9',
                                            callback: function (tickValue) {
                                                return formatCurrencyShort(Number(tickValue));
                                            },
                                        },
                                        grid: { color: 'rgba(119, 124, 124, 0.2)' },
                                    },
                                    x: {
                                        ticks: { color: '#a7a9a9' },
                                        grid: { display: false },
                                    },
                                },
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => `Revenue: ${formatCurrency(Number(context.parsed.y ?? 0))}`,
                                        },
                                    },
                                },
                            }}
                        />
                    ) : (
                        <p className="text-gray-400 text-sm text-center">No monthly trend data</p>
                    )}
                </ChartCard>
                <ChartCard title="Top Products by Revenue" delay={850}>
                    {data?.topProducts && data.topProducts.length > 0 && (
                        <Bar
                            data={transformTopProductsData(data.topProducts)}
                            options={{
                                indexAxis: 'y' as const,
                                scales: {
                                    x: {
                                        ticks: {
                                            color: '#a7a9a9',
                                            callback: (value) => formatCurrencyShort(value as number),
                                        },
                                        grid: { color: 'rgba(119, 124, 124, 0.2)' },
                                    },
                                    y: {
                                        ticks: { color: '#a7a9a9', font: { size: 11 } },
                                        grid: { display: false },
                                    },
                                },
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => {
                                                const product = data.topProducts[context.dataIndex];
                                                return [
                                                    `Revenue: ${formatCurrency(product.totalRevenue)}`,
                                                    `Quantity: ${product.totalQuantity.toLocaleString()}`,
                                                ];
                                            },
                                        },
                                    },
                                },
                            }}
                        />
                    )}
                </ChartCard>
            </div>

            <div className="lg:w-1/2 flex justify-between p-4 gap-4 md:px-4 mb-6">
                <input
                    type="text"
                    placeholder="Search Invoice No."
                    value={invoiceNo}
                    onChange={(e) => {
                        setPage(1);
                        setInvoiceNo(e.target.value);
                    }}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--focus-color)]"
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => {
                        setPage(1);
                        setDate(e.target.value);
                    }}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--focus-color)]"
                />
            </div>

            <div className="overflow-x-auto">
                <DataTable<Bill>
                    data={data?.data ?? []}
                    columns={columns}
                    loading={isLoading}
                    noDataMessage="No Bill found"
                    error={!!error}
                />
            </div>

            {data?.pagination && (
                <div className="flex justify-end pr-4 items-center my-6 gap-4">
                    <button
                        className={`px-3 py-1 border rounded disabled:opacity-50 ${page === 1 ? "cursor-not-allowed" : "cursor-pointer"
                            }`}
                        disabled={page === 1}
                        onClick={() => setPage((prev) => prev - 1)}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-200">
                        Page {data.pagination.page} of {data.pagination.totalPages}
                    </span>
                    <button
                        className={`px-3 py-1 border rounded disabled:opacity-50 ${page >= data.pagination.totalPages
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                            }`}
                        disabled={page >= data.pagination.totalPages}
                        onClick={() => setPage((prev) => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

        </>
    );
};

export default BillPage;