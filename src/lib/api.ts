import { getSession } from "next-auth/react";
import { BillRequestBody, BillResponse, Product } from "@/types/product.type";
import { ApiError } from "next/dist/server/api-utils";

const API_BASE_URL = (process.env.NEXT_API_BASE_URL || "").replace(/\/$/, "");

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const session = await getSession();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${session.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || response.statusText || "An error occurred";
        throw new ApiError(response.status, errorMessage);
    }

    return response.json();
}

export const api = {
    auth: {
        login: (credentials: { email: string; password: string }) =>
            apiRequest("/api/auth/signin", {
                method: "POST",
                body: JSON.stringify(credentials),
            }),
    },
    bill: {
        createBill: async (body: BillRequestBody): Promise<BillResponse> => {
            const res = await apiRequest<{ success: boolean; message: string; data: BillResponse }>("/api/bill", {
                method: "POST",
                body: JSON.stringify(body),
            });
            return res.data;
        },
        getBillById: (id: string): Promise<BillResponse> =>
            apiRequest(`/api/bill/${id}`),
        getMonthlyBill: (month: string): Promise<BillResponse[]> =>
            apiRequest(`/api/bill/monthly?month=${month}`),
    },
    product: {
        getAll: (): Promise<{ data: Product[] }> => apiRequest("/api/product"),
        create: (data: Product): Promise<{ message: string; createdProduct: Product }> =>
            apiRequest("/api/product", {
                method: "POST",
                body: JSON.stringify(data),
            }),
        update: (id: string, data: Product): Promise<{ message: string; updatedProduct: Product }> =>
            apiRequest(`/api/product/${id}`, {
                method: "PUT",
                body: JSON.stringify(data),
            }),
        delete: (id: string): Promise<{ message: string }> =>
            apiRequest(`/api/product/${id}`, {
                method: "DELETE",
            }),
    },
};
