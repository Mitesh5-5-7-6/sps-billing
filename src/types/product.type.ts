import { Document } from "mongoose";

interface ProductBase {
    name: string;
    price: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IProduct extends ProductBase, Document { }
export interface Product extends ProductBase {
    _id?: string;
}

export interface InvoiceItem {
    p_id: string;
    product_name: string;
    price: number;
    quantity: number;
    total_amount: number;
    descripation: string;
}

export interface InvoiceValues {
    invoice: string;
    date: string;
    name: string;
    address: string;
    p_status: string,
    items: InvoiceItem[];
}

export interface BillItem {
    p_id: string;
    product_name: string;
    price: number;
    quantity: number;
    total_amount: number;
    descripation: string;
}

export interface BillRequestBody {
    invoice: string;
    date: string;
    name: string;
    address?: string;
    items: BillItem[];
    pdf?: { type: string; data: number[] };
}

export interface BillResponse extends BillRequestBody {
    _id: string;
    data: BillRequestBody;
    invoiceNo: string;
    createdAt: string;
    updatedAt: string;
    pdfUrl?: string;
}
