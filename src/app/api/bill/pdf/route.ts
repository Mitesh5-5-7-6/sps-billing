// /app/api/bill/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import billModel from "@/models/bill.model";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const bill = await billModel.findById(id);
        if (!bill || !bill.pdf) {
            return NextResponse.json({ error: "PDF not found" }, { status: 404 });
        }

        return new NextResponse(bill.pdf, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=invoice-${bill.invoiceNo}.pdf`,
            },
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
