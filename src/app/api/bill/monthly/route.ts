// app/api/bill/monthly/route.ts
import dbConnect from "@/lib/mongodb";
import { checkAuth } from "@/lib/checkAuth";
import { apiResponse, internalServerError, badRequest } from "@/lib/apiResponse";
import billModel from "@/models/bill.model";

export async function GET(req: Request) {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month");
        if (!month) return badRequest("Month is required in YYYY-MM format");

        const [year, monthNum] = month.split("-").map(Number);
        if (!year || !monthNum) return badRequest("Invalid month format");

        // Start of month → Start of next month
        const start = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
        const end = new Date(year, monthNum, 1, 0, 0, 0, 0);

        // Group bills by client
        const groupedBills = await billModel.aggregate([
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $group: {
                    _id: "$clientName",
                    totalAmount: { $sum: "$totalAmount" },
                    bills: { $push: "$$ROOT" },
                },
            },
        ]);

        // Overall summary
        const summary = await billModel.aggregate([
            { $match: { createdAt: { $gte: start, $lt: end } } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalAmount" },
                    totalBills: { $sum: 1 },
                    clients: { $addToSet: "$clientName" },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalSales: 1,
                    totalBills: 1,
                    totalClients: { $size: "$clients" },
                },
            },
        ]);

        return apiResponse(
            {
                summary: summary[0] || { totalSales: 0, totalBills: 0, totalClients: 0 },
                groupedBills,
            },
            "Monthly bills summary fetched successfully",
            200
        );
    } catch (error) {
        return internalServerError(error);
    }
}
