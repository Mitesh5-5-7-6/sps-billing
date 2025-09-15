import { getSession } from "next-auth/react";
import { BillRequestBody, Product } from "@/types/product.type";

const API_BASE_URL = process.env.NEXT_API_BASE_URL || "";

class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const session = await getSession();

    const config: RequestInit = {
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    };

    if (session?.user?.email) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${session.accessToken || ""}`,
        };
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(errorData.message || `HTTP ${response.status}: ${response.statusText}`, response.status);
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
    product: {
        getAll: (): Promise<{ data: Product[] }> => apiRequest("/api/product"),
        getBill: (): Promise<{ data: BillRequestBody[] }> => apiRequest("/api/bill"),
        getMonthlyBill: (month: string): Promise<{ data: BillRequestBody[] }> => apiRequest(`/api/bill/monthly?month=${month}`),
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
