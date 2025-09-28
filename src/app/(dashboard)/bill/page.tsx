"use client";

import React, { useState } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/button/Button";
import { useRouter } from "next/navigation";
import { useAllBills, useDeleteBill } from "@/hooks/useBill";
import { useDebounce } from "@/hooks/useDebounce";
import { Bill } from "@/types/bill.type";
import { usePopup } from "@/components/ui/DialogProvider";
import { DeleteDialog } from "@/components/ui/DeleteDialog";
import Notify from "@/utils/notify";
import { Download, Trash } from "lucide-react";

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
            <div className="flex flex-col md:flex-row md:p-4 justify-between items-center gap-3">
                <h1 className="p-4 text-sm md:text-xl font-semibold text-center">
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

            <div className="w-1/2 flex justify-between px-4 gap-4 md:px-8 mb-6">
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