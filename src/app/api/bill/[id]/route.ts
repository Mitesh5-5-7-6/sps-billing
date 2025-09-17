// app/api/bill/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BillModel from "@/models/bill.model";
import { notFound, internalServerError } from "@/lib/apiResponse";
import { checkAuth } from "@/lib/checkAuth";

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await checkAuth();
  if (session instanceof Response) return session;

  const { id } = params;
  if (!id) return notFound("Bill ID is required");

  try {
    await dbConnect();
    const bill = await BillModel.findById(id);

    if (!bill) {
      return notFound("Bill not found");
    }

    return NextResponse.json({
      success: true,
      message: "Bill fetched successfully",
      bill,
    });
  } catch (error) {
    console.error("Error fetching bill:", error);
    return internalServerError("Failed to fetch bill");
  }
}