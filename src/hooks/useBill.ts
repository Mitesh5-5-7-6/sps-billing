// hooks/useBill.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BillRequestBody, BillResponse } from "@/types/product.type";
import Notify from "@/utils/notify";
import { BillApiResponse } from "@/types/bill.type";

export const BILL_QUERY_KEYS = {
    bill: "bill",
};

export function useAllBills(params: { page: number; limit: number; invoiceNo?: string, date?: string }) {
    return useQuery<BillApiResponse>({
        queryKey: [BILL_QUERY_KEYS.bill, params],
        queryFn: () => api.bill.getAllBills(params),
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useBillById(id?: string) {
    return useQuery<BillResponse>({
        queryKey: [BILL_QUERY_KEYS.bill, id],
        queryFn: () => api.bill.getBillById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCreateBill() {
    const queryClient = useQueryClient();
    return useMutation<BillResponse, Error, BillRequestBody>({
        mutationFn: api.bill.createBill,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [BILL_QUERY_KEYS.bill] });
            Notify("success", `Bill ${data.invoiceNo} created!`, "Create");
        },
        onError: (error) => {
            Notify("danger", error.message || "Failed to create Bill", "Error");
        },
    });
}

export function useDeleteBill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.bill.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BILL_QUERY_KEYS.bill] });
            Notify("success", `Bill deleted successfully!`, "Delete");
        },
        onError: (error: Error) => {
            Notify("danger", error.message || "Failed to delete bill", "Error");
        },
    });
}
