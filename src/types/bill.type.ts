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

export interface BillApiResponse {
    success: boolean;
    pagination: BillPagination;
    data: Bill[];
}
