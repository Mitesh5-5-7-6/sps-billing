// src/app/api/bill/route.ts
import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/checkAuth";
import dbConnect from "@/lib/mongodb";
import billModel from "@/models/bill.model";
import PDFDocument from "pdfkit";
import { BillRequestBody } from "@/types/product.type";
import { internalServerError } from "@/lib/apiResponse";
import { numberToWords } from "@/utils/numberToWords";
import fs from "node:fs";
import path from "node:path";

export async function POST(req: NextRequest) {
  const session = await checkAuth();
  if (session instanceof Response) return session;

  try {
    await dbConnect();
    const body: BillRequestBody = await req.json();
    const { invoice, date, name, address, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Items array is required and cannot be empty" }, { status: 400 });
    }

    // PDF init
    const doc = new PDFDocument({ size: "A4", margin: 30 }); // smaller margin to gain room
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    const endPromise = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

    // Layout constants
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const left = 30;
    const right = pageWidth - 30;
    const tableWidth = right - left;
    const baseRowHeight = 22; // minimum row height
    const footerBlockHeight = 0; // total row + in words + signature block
    const headerBlockBottom = 165; // where table starts on each page

    const colWidths = {
      sr: 42,
      name: 260,
      qty: 70,
      rate: 70,
      amt: 88,
    };
    const colX = {
      sr: left,
      name: left + 50,
      qty: left + 50 + 260,
      rate: left + 50 + 260 + 70,
      amt: left + 50 + 260 + 70 + 70,
    };

    const formattedDate = date.split("-").reverse().join("-");

    // Drawing helpers
    const logoPath = path.join(process.cwd(), "public", "logo.png"); // or .jpg
    const logoBuffer = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : undefined;

    const drawHeader = () => {
      doc.rect(left - 10, 20, tableWidth + 20, 70).stroke();

      // Logo at left (max height 50)
      if (logoBuffer) {
        const logoMaxH = 50;
        const logoMaxW = 90;
        // Place with preserved aspect ratio
        doc.image(logoBuffer, left - 5, 25, { fit: [logoMaxW, logoMaxH] });
      }

      // Title centered; leave room by shrinking width if logo present
      const titleLeft = logoBuffer ? left + 70 : left;
      const titleWidth = logoBuffer ? tableWidth - 120 : tableWidth;

      doc.font("Helvetica-Bold").fontSize(18)
        .text("SPS ANALYTICAL LABORATORY", titleLeft, 28, { align: "center", width: titleWidth });

      doc.font("Helvetica").fontSize(10)
        .text("503, B.C.-3, RANICCHAL, AHMEDABAD(GUJARAT) 380013", titleLeft, 50, { align: "center", width: titleWidth })
        .text("GSTIN: 24AABCS1234C1Z5", titleLeft, 63, { align: "center", width: titleWidth });

      // Bill info + party
      doc.font("Helvetica-Bold").fontSize(11);
      doc.text(`Invoice No.: ${invoice}`, left, 98);
      doc.text(`Date: ${formattedDate}`, right - 160, 98, { width: 150, align: "right" });

      doc.font("Helvetica-Bold").fontSize(11).text(`M/S. ${String(name || "").toUpperCase()}`, left, 120, { width: tableWidth });
      if (address && address !== "—") {
        doc.font("Helvetica").fontSize(10).text(address, left, 136, { width: tableWidth });
      }
    };


    const drawTableHeader = (y: number) => {
      doc.save();
      doc.rect(left, y, tableWidth, baseRowHeight).fillAndStroke("#f0f0f0", "#000");
      doc.fillColor("#000").font("Helvetica-Bold").fontSize(10);
      doc.text("Sr.No.", colX.sr, y + 6, { width: colWidths.sr, align: "center" });
      doc.text("Particulars", colX.name, y + 6, { width: colWidths.name, align: "left" });
      doc.text("No. of sample", colX.qty, y + 6, { width: colWidths.qty, align: "center" });
      doc.text("Rate", colX.rate, y + 6, { width: colWidths.rate, align: "center" });
      doc.text("Amount (Rs)", colX.amt, y + 6, { width: colWidths.amt, align: "center" });
      doc.restore();
    };

    const ensureSpace = (needed: number, currentY: number) => {
      if (currentY + needed > pageHeight - 30) {
        doc.addPage();
        drawHeader();
        drawTableHeader(headerBlockBottom);
        return headerBlockBottom + baseRowHeight;
      }
      return currentY;
    };

    // Start page
    drawHeader();
    let y = headerBlockBottom;
    drawTableHeader(y);
    y += baseRowHeight;

    // Rows
    let grandTotal = 0;
    doc.font("Helvetica").fontSize(10);

    for (let i = 0; i < items.length; i += 1) {
      const it = items[i] || {};
      const nameText = String(it.product_name || "UNKNOWN PRODUCT").toUpperCase();
      const qty = Number(it.quantity || 0);
      const rate = Number(it.price || 0);
      const total = Number(it.total_amount ?? rate * qty);
      grandTotal += total;

      // Wrap product name to available width and compute row height
      const nameLines = doc.heightOfString(nameText, { width: colWidths.name });
      const rowHeight = Math.max(baseRowHeight, Math.ceil(nameLines / 12) * 14 + 10); // approximate line height

      // Keep footer block visible: if adding this row + footer would overflow, new page
      y = ensureSpace(rowHeight + footerBlockHeight, y);

      // Row rectangle
      doc.rect(left, y, tableWidth, rowHeight).stroke("#000");

      // Cells
      doc.text(String(i + 1), colX.sr, y + 6, { width: colWidths.sr, align: "center" });
      doc.text(nameText, colX.name, y + 6, { width: colWidths.name, align: "left" });
      doc.text(qty.toString(), colX.qty, y + 6, { width: colWidths.qty, align: "center" });
      doc.text(`${rate.toFixed(0)}/-`, colX.rate, y + 6, { width: colWidths.rate, align: "center" });
      doc.text(`${total.toFixed(0)}/-`, colX.amt, y + 6, { width: colWidths.amt, align: "center" });

      y += rowHeight;
    }

    y = ensureSpace(footerBlockHeight, y);

    const words = `${numberToWords(Math.floor(grandTotal))} only`;
    // Total row
    doc.save();
    doc.rect(left, y, tableWidth, baseRowHeight).fillAndStroke("#f0f0f0", "#000");
    doc.fillColor("#000").font("Helvetica-Bold").fontSize(11);
    doc.text(`In words: ${words}`, left + 10, y + 6, { width: tableWidth });
    doc.text("TOTAL", colX.rate, y + 6, { width: colWidths.rate, align: "right" });
    doc.text(`${grandTotal.toFixed(0)}/-`, colX.amt, y + 6, { width: colWidths.amt, align: "center" });
    doc.restore();
    y += baseRowHeight + 6;

    // In words
    y += 28;

    // Signature / footer
    doc.moveTo(left, y).lineTo(right, y).stroke("#ccc");
    y += 10;
    doc.font("Helvetica").fontSize(10).text("RECEIVED", left, y);
    doc.font("Helvetica").fontSize(10).text("For, SPS ANALYTICAL LABORATORY", right - 240, y, { width: 240, align: "right" });

    doc.end();
    const pdfBuffer = await endPromise;

    // Persist
    const newBill = await billModel.create({
      invoiceNo: invoice,
      date,
      clientName: name,
      clientAddress: address,
      items,
      pdf: pdfBuffer,
    });

    return NextResponse.json({ success: true, message: "Bill Added", data: newBill });
  } catch (error) {
    return internalServerError(error);
  }
}
