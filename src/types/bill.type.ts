export interface Bill {
    id: string;
    invoiceNo: string;
    date: string;
    clientName: string;
    clientAddress: string;
    pdfUrl: string;
}

export interface BillPagination {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
}

export interface BillStatistics {
    totalRevenue: number;
    averageBill: number;
    minBill: number;
    maxBill: number;
    pendingCount: number;
    receivedCount: number;
}

export interface MonthlyTrend {
    year: number;
    month: number;
    label: string;
    totalRevenue: number;
    billCount: number;
}

export interface TopProduct {
    name: string;
    totalQuantity: number;
    totalRevenue: number;
}

export interface BillApiResponse {
    success: boolean;
    statistics: BillStatistics;
    monthlyTrend: MonthlyTrend[];
    topProducts: TopProduct[];
    data: Bill[];
    pagination: BillPagination;
}