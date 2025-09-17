// app/api/product/[id]/route.ts
import { NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import productModel from '@/models/product.model';
import { checkAuth } from '@/lib/checkAuth';
import { apiResponse, badRequest, notFound, internalServerError } from '@/lib/apiResponse';
import { productSchema } from '@/lib/validation/product.schema';
import mongoose from 'mongoose';

// ✅ Fixed: params must be awaited
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    try {
        await dbConnect();
        const { id } = await context.params; // await params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return badRequest("Invalid product ID");
        }

        const product = await productModel.findById(id);
        if (!product) return notFound("Product not found");

        return apiResponse(product, 'Product fetched successfully', 200);
    } catch (error) {
        return internalServerError(error);
    }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    try {
        await dbConnect();
        const { id } = await context.params; // await params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return badRequest("Invalid product ID");
        }

        const body = await req.json();
        const parse = productSchema.safeParse(body);
        if (!parse.success) return badRequest(parse.error.message);

        const updated = await productModel.findByIdAndUpdate(
            id,
            { $set: parse.data },
            { new: true }
        );

        if (!updated) return notFound("Product not found");

        return apiResponse(updated, 'Product updated successfully', 200);
    } catch (error) {
        return internalServerError(error);
    }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    try {
        await dbConnect();
        const { id } = await context.params; // await params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return badRequest("Invalid product ID");
        }

        const deleted = await productModel.findByIdAndDelete(id);
        if (!deleted) return notFound("Product not found");

        return apiResponse(null, 'Product deleted successfully', 200);
    } catch (error) {
        return internalServerError(error);
    }
}
