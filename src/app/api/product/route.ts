// app/api/product/route.ts
import { NextRequest } from 'next/server';
import productModel from '@/models/product.model';
import dbConnect from '@/lib/mongodb';
import { checkAuth } from '@/lib/checkAuth';
import { apiResponse, badRequest, conflict, internalServerError } from '@/lib/apiResponse';
import { productSchema } from '@/lib/validation/product.schema';

export async function GET() {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    try {
        await dbConnect();
        const products = await productModel.find().sort({ createdAt: -1 });
        return apiResponse(products, 'Products fetched successfully', 200);
    } catch (error) {
        return internalServerError(error);
    }
}

export async function POST(req: NextRequest) {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    try {
        await dbConnect();
        const body = await req.json();
        const parse = productSchema.safeParse(body);
        if (!parse.success) return badRequest(parse.error.message);

        const { name, price } = parse.data;

        const existing = await productModel.findOne({ name });
        if (existing) return conflict('Product already exists');

        const newProduct = await productModel.create({ name, price });
        return apiResponse(newProduct, 'Product created successfully', 201);
    } catch (error) {
        return internalServerError(error);
    }
}
