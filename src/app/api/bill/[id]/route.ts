// src/app/api/bill/[id]/route.ts
import mongoose from 'mongoose';
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import billModel from "@/models/bill.model";
import { checkAuth } from "@/lib/checkAuth";
import { apiResponse, badRequest, internalServerError, notFound } from "@/lib/apiResponse";

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    try {
        await dbConnect();
        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return badRequest("Invalid product ID");
        }
        const deletedBill = await billModel.findByIdAndDelete(id);
        if (!deletedBill) return notFound("Product not found");

        return apiResponse(deletedBill, 'Bill deleted successfully', 200);
    } catch (err) {
        return internalServerError(err);
    }
}
