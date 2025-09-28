// src/app/api/bill/next-invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/checkAuth";
import dbConnect from "@/lib/mongodb";
import billModel from "@/models/bill.model";
import { internalServerError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    try {
        await dbConnect();

        const currentYear = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of year
        const yearPattern = `JSN-${currentYear}/`;

        // Find the highest invoice number for the current year
        const lastInvoice = await billModel
            .findOne({
                invoiceNo: { $regex: `^${yearPattern}` }
            })
            .sort({ invoiceNo: -1 })
            .limit(1);

        let nextNumber = 2022; // Starting number as per your requirement

        if (lastInvoice) {
            const lastInvoiceNumber = lastInvoice.invoiceNo;
            const numberPart = lastInvoiceNumber.split('/')[1];
            if (numberPart && !isNaN(parseInt(numberPart))) {
                nextNumber = parseInt(numberPart) + 1;
            }
        }

        const nextInvoiceNumber = `${yearPattern}${nextNumber}`;

        return NextResponse.json({
            success: true,
            invoiceNumber: nextInvoiceNumber,
            message: "Next invoice number generated successfully"
        });

    } catch (error) {
        return internalServerError(error);
    }
}