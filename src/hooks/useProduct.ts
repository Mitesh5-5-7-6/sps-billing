import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Notify from "@/utils/notify";
import { Product } from "@/types/product.type";

export const PRODUCT_QUERY_KEYS = {
    product: "product",
    bill: "bill",
    monthlyBill: "monthlyBill",
    productById: (id: string) => ["product", id],
};

export function useProducts() {
    return useQuery({
        queryKey: [PRODUCT_QUERY_KEYS.product],
        queryFn: api.product.getAll,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.product.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.product] });
            Notify("success", "Product Created successfully!", "Create");
        },
        onError: (error: Error) => {
            Notify("danger", error.message || "Failed to create Product", "Error");
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Product }) => api.product.update(id, data),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.product] });
            queryClient.invalidateQueries({
                queryKey: PRODUCT_QUERY_KEYS.productById(variables.id),
            });
            Notify("success", "Product Updated successfully!", "Update");
        },
        onError: (error: Error) => {
            Notify("danger", error.message || "Failed to update Product", "Error");
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: api.product.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PRODUCT_QUERY_KEYS.product] });
            Notify("success", "Product deleted successfully!", "Delete");
        },
        onError: (error: Error) => {
            Notify("danger", error.message || "Failed to delete", "Error");
        },
    });
}
