import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/checkAuth";
import dbConnect from "@/lib/mongodb";
import billModel from "@/models/bill.model";
import PDFDocument from "pdfkit";
import { BillItem, BillRequestBody } from "@/types/product.type";
import { internalServerError } from "@/lib/apiResponse";

export async function POST(req: NextRequest) {
  const session = await checkAuth();
  if (session instanceof Response) return session;

  try {
    await dbConnect();

    const body: BillRequestBody = await req.json();
    const { invoice, date, name, address, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Items array is required and cannot be empty",
        },
        { status: 400 }
      );
    }

    // Number to words conversion function
    const numberToWords = (num: number): string => {
      const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
      ];
      const teens = [
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen",
      ];
      const tens = [
        "",
        "",
        "Twenty",
        "Thirty",
        "Forty",
        "Fifty",
        "Sixty",
        "Seventy",
        "Eighty",
        "Ninety",
      ];

      if (num === 0) return "Zero";

      const convertHundreds = (n: number): string => {
        let result = "";
        if (n >= 100) {
          result += ones[Math.floor(n / 100)] + " Hundred ";
          n %= 100;
        }
        if (n >= 20) {
          result += tens[Math.floor(n / 10)] + " ";
          n %= 10;
        } else if (n >= 10) {
          result += teens[n - 10] + " ";
          return result;
        }
        if (n > 0) {
          result += ones[n] + " ";
        }
        return result;
      };

      if (num < 1000) {
        return convertHundreds(num).trim();
      } else if (num < 100000) {
        return (
          convertHundreds(Math.floor(num / 1000)) +
          "Thousand " +
          convertHundreds(num % 1000)
        );
      } else if (num < 10000000) {
        return (
          convertHundreds(Math.floor(num / 100000)) +
          "Lakh " +
          convertHundreds((num % 100000) / 1000) +
          "Thousand " +
          convertHundreds(num % 1000)
        );
      }
      return num.toString();
    };

    // ✅ Create Professional PDF
    const doc = new PDFDocument({
      margin: 50,
      font: "Helvetica",
      size: "A4",
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const endPromise = new Promise<Buffer>((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });

    // PDF Header with professional styling
    doc.rect(20, 20, 550, 60).stroke();

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("SPS ANALYTICAL LABORATORY", 20, 35, {
        width: 550,
        align: "center",
      });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("503, B.C.-3, RANICCHAL, AHMEDABAD(GUJARAT) 380013", 20, 55, {
        width: 550,
        align: "center",
      })
      .text("GSTIN: 24AABCS1234C1Z5", 20, 68, {
        width: 550,
        align: "center",
      });

    // Invoice details
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Invoice No.: ${invoice}`, 30, 100)
      .text(`Date: ${date}`, 400, 100);

    // Client details
    doc.fontSize(11).text(`M/S. ${name.toUpperCase()}`, 30, 120);

    if (address && address !== "—") {
      doc.font("Helvetica").text(address, 30, 135);
    }

    // Table setup
    const tableTop = 160;
    const tableLeft = 30;
    const tableWidth = 540;

    // Table header
    doc
      .rect(tableLeft, tableTop, tableWidth, 25)
      .fillAndStroke("#f0f0f0", "#000");

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text("Sr.No.", tableLeft + 5, tableTop + 8)
      .text("Particulars", tableLeft + 50, tableTop + 8)
      .text("No. of", tableLeft + 320, tableTop + 5)
      .text("sample", tableLeft + 320, tableTop + 12)
      .text("Rate", tableLeft + 380, tableTop + 8)
      .text("Amount", tableLeft + 450, tableTop + 5)
      .text("(in Rs)", tableLeft + 450, tableTop + 12);

    // Table content
    let currentY = tableTop + 35;
    let totalAmount = 0;

    doc.font("Helvetica");

    items.forEach((item: BillItem, index: number) => {
      const productName = item.product_name || "Unknown Product";
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      const total = Number(item.total_amount) || price * qty;
      totalAmount += total;

      // Row background (alternating colors)
      if (index % 2 === 0) {
        doc
          .rect(tableLeft, currentY - 5, tableWidth, 40)
          .fillAndStroke("#f9f9f9", "#ccc");
      } else {
        doc.rect(tableLeft, currentY - 5, tableWidth, 40).stroke("#ccc");
      }

      doc
        .fillColor("#000")
        .text(String(index + 1), tableLeft + 5, currentY)
        .text(productName.toUpperCase(), tableLeft + 50, currentY)
        .text(
          "VIDE OUR CERT. NO. JSN - 25/3036",
          tableLeft + 50,
          currentY + 12,
          {
            // fontSize: 8,
            ellipsis: true,
            width: 250,
          }
        )
        .text(String(qty), tableLeft + 330, currentY)
        .text(`${price.toFixed(0)}/-`, tableLeft + 380, currentY)
        .text(`${total.toFixed(0)}/-`, tableLeft + 450, currentY);

      currentY += 45;
    });

    // Total section
    const totalSectionY = currentY + 10;
    doc
      .rect(tableLeft, totalSectionY, tableWidth, 25)
      .fillAndStroke("#f0f0f0", "#000");

    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(
        `IN WORD.: ${numberToWords(Math.floor(totalAmount))} only`,
        tableLeft + 5,
        totalSectionY + 8
      )
      .text("TOTAL", tableLeft + 320, totalSectionY + 8)
      .text(`${totalAmount.toFixed(0)}/-`, tableLeft + 450, totalSectionY + 8);

    // Footer section
    const footerY = totalSectionY + 50;
    doc
      .fontSize(10)
      .text("For, SPS ANALYTICAL LABORATORY", tableLeft + 350, footerY)
      .text("RECEIVED", tableLeft + 5, footerY + 30);

    // Outer border
    doc.rect(20, 90, 550, footerY + 50 - 90).stroke();

    doc.end();
    const pdfBuffer = await endPromise;

    // ✅ Save in DB
    const newBill = await billModel.create({
      invoiceNo: invoice,
      date,
      clientName: name,
      clientAddress: address,
      items,
      pdf: pdfBuffer,
    });

    return NextResponse.json({ success: true, id: newBill._id });
  } catch (error) {
    return internalServerError(error);
  }
}
