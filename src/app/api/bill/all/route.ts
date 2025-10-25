import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import billModel from "@/models/bill.model";
import { checkAuth } from "@/lib/checkAuth";
import { internalServerError } from "@/lib/apiResponse";
import { FilterQuery } from "mongoose";

interface FilterType {
    invoiceNo?: string;
    date?: string;
}

// Extend it to allow MongoDB operators
type MongoFilter<T> = FilterQuery<T & Document>;

export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);

        const invoiceNo = searchParams.get("invoiceNo");
        const date = searchParams.get("date");
        const month = searchParams.get("month");
        const year = searchParams.get("year");
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        const filter: MongoFilter<FilterType> = {}

        if (invoiceNo) filter.invoiceNo = invoiceNo;
        if (date) filter.date = date;

        // Month-Year range filter
        if (year || month) {
            const start = new Date(
                Number(year || new Date().getFullYear()),
                month ? Number(month) - 1 : 0,
                1
            );
            const end = new Date(
                Number(year || new Date().getFullYear()),
                month ? Number(month) : 12,
                0,
                23,
                59,
                59
            );

            filter.$expr = {
                $and: [
                    { $gte: [{ $toDate: "$date" }, start] },
                    { $lte: [{ $toDate: "$date" }, end] }
                ]
            };
        }

        const skip = (page - 1) * limit;

        const [bills, totalItems, stats, monthlyTrend, topProducts] = await Promise.all([
            billModel.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
            billModel.countDocuments(filter),

            // Statistics
            billModel.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalRevenue: {
                            $sum: { $toDouble: { $ifNull: ["$totalAmount", 0] } }
                        },
                        averageBill: {
                            $avg: { $toDouble: { $ifNull: ["$totalAmount", 0] } }
                        },
                        minBill: {
                            $min: { $toDouble: { $ifNull: ["$totalAmount", 0] } }
                        },
                        maxBill: {
                            $max: { $toDouble: { $ifNull: ["$totalAmount", 0] } }
                        },
                        pendingCount: {
                            $sum: { $cond: [{ $eq: ["$p_status", "PENDING"] }, 1, 0] }
                        },
                        receivedCount: {
                            $sum: { $cond: [{ $eq: ["$p_status", "RECEIVED"] }, 1, 0] }
                        }
                    }
                }
            ]),

            // Monthly Trend
            billModel.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: {
                            year: { $year: { $toDate: "$date" } },
                            month: { $month: { $toDate: "$date" } }
                        },
                        totalRevenue: {
                            $sum: { $toDouble: { $ifNull: ["$totalAmount", 0] } }
                        },
                        billCount: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]),

            // Top Products
            billModel.aggregate([
                { $match: filter },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.name",
                        totalQuantity: {
                            $sum: { $toDouble: { $ifNull: ["$items.quantity", 0] } }
                        },
                        totalRevenue: {
                            $sum: { $toDouble: { $ifNull: ["$items.total", 0] } }
                        }
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 10 }
            ])
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        const formattedTrend = monthlyTrend.map(t => ({
            year: t._id.year,
            month: t._id.month,
            label: `${String(t._id.month).padStart(2, "0")}-${t._id.year}`,
            totalRevenue: t.totalRevenue,
            billCount: t.billCount
        }));

        return NextResponse.json({
            success: true,
            pagination: { page, limit, totalPages, totalItems },
            statistics: stats.length
                ? stats[0]
                : {
                    totalRevenue: 0,
                    averageBill: 0,
                    minBill: 0,
                    maxBill: 0,
                    pendingCount: 0,
                    receivedCount: 0
                },
            monthlyTrend: formattedTrend,
            topProducts: topProducts.map(p => ({
                name: p._id,
                totalQuantity: p.totalQuantity,
                totalRevenue: p.totalRevenue
            })),
            data: bills.map(b => ({
                id: b._id,
                invoiceNo: b.invoiceNo,
                date: b.date,
                clientName: b.clientName,
                clientAddress: b.clientAddress,
                totalAmount: b.totalAmount,
                p_status: b.p_status,
                pdfUrl: `/api/bill/pdf?id=${b._id}`
            }))
        });
    } catch (err) {
        return internalServerError(err);
    }
}