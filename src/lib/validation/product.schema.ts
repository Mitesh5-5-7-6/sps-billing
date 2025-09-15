// lib/validation/product.schema.ts
import { z } from 'zod';

export const productSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    price: z.number().positive("Price must be greater than 0"),
});

export type ProductInput = z.infer<typeof productSchema>;
