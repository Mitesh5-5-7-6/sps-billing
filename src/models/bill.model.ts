import mongoose, { Schema, Document } from "mongoose";

export interface IBill extends Document {
  invoiceNo: string;
  date: string;
  clientName: string;
  clientAddress: string;
  items: {
    product: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  pdf: Buffer;
}

const BillSchema = new Schema<IBill>({
  invoiceNo: { type: String, required: true },
  date: { type: String, required: true },
  clientName: { type: String, required: true },
  clientAddress: { type: String },
  items: [
    {
      p_id: String,
      p_name: String,
      price: Number,
      quantity: Number,
      total_amount: Number,
    },
  ],
  pdf: { type: Buffer },
});

export default mongoose.models.Bill ||
  mongoose.model<IBill>("Bill", BillSchema);
