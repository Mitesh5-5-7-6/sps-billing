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

// const BillSchema = new Schema<IBill>({
//   invoiceNo: { type: String, required: true },
//   date: { type: String, required: true },
//   clientName: { type: String, required: true },
//   clientAddress: { type: String },
//   items: [
//     {
//       p_id: String,
//       p_name: String,
//       price: Number,
//       quantity: Number,
//       total_amount: Number,
//     },
//   ],
//   pdf: { type: Buffer },
// });
const BillSchema = new Schema<IBill>({
  invoiceNo: { type: String, required: true },
  date: { type: String, required: true },
  clientName: { type: String, required: true },
  clientAddress: { type: String },
  items: [
    {
      p_id: String,
      product_name: String,  // Make sure this matches your interface
      price: Number,
      quantity: Number,
      total_amount: Number,  // Make sure this matches your interface
    },
  ],
  pdf: { type: Buffer },
}, {
  // Add this to ensure proper JSON serialization
  // toJSON: {
  //   transform: function (doc, ret) {
  //     if (ret.pdf && ret.pdf.type === 'Buffer') {
  //       ret.pdf = { type: 'Buffer', data: Array.from(ret.pdf.data || ret.pdf) };
  //     }
  //     return ret;
  //   }
  // }
});

export default mongoose.models.Bill ||
  mongoose.model<IBill>("Bill", BillSchema);
