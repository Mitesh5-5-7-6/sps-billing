import { IProduct } from '@/types/product.type';
import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        trim: true,
    }
}, { timestamps: true });

ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);