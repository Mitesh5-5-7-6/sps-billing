// src/app/api/bill/all/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import billModel from "@/models/bill.model";
import { checkAuth } from "@/lib/checkAuth";
import { internalServerError } from "@/lib/apiResponse";

interface BillFilter {
    invoiceNo?: string;
    date?: string;
}

export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const invoiceNo = searchParams.get("invoiceNo");
        const date = searchParams.get("date");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        const filter: BillFilter = {};
        if (invoiceNo) filter.invoiceNo = invoiceNo;
        if (date) filter.date = date;

        const skip = (page - 1) * limit;
        const [bills, totalItems] = await Promise.all([
            billModel.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
            billModel.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            success: true,
            pagination: {
                page,
                limit,
                totalPages,
                totalItems,
            },
            data: bills.map((b) => ({
                id: b._id,
                invoiceNo: b.invoiceNo,
                date: b.date,
                clientName: b.clientName,
                clientAddress: b.clientAddress,
                totalAmount: b.totalAmount,
                pdfUrl: `/api/bill/pdf?id=${b._id}`,
            })),
        });
    } catch (err) {
        return internalServerError(err);
    }
}