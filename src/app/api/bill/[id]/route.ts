// src/app/api/bill/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import billModel from "@/models/bill.model";
import { checkAuth } from "@/lib/checkAuth";
import { internalServerError } from "@/lib/apiResponse";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    try {
        await dbConnect();

        const { id } = params;

        const deletedBill = await billModel.findByIdAndDelete(id);

        if (!deletedBill) {
            return NextResponse.json(
                { success: false, message: "Bill not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Bill deleted successfully",
        });
    } catch (err) {
        return internalServerError(err);
    }
}
