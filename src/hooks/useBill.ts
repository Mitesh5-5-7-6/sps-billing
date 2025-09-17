// hooks/useBill.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BillRequestBody, BillResponse } from "@/types/product.type";
import Notify from "@/utils/notify";

export const BILL_QUERY_KEYS = {
    bill: "bill",
};

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BILL_QUERY_KEYS.bill] });
            Notify("success", "Bill Created successfully!", "Create");
        },
        onError: (error) => {
            Notify("danger", error.message || "Failed to create Bill", "Error");
        },
    });
}
