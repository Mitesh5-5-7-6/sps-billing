// src/app/api/bill/route.ts
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import billModel from "@/models/bill.model";
import dbConnect from "@/lib/mongodb";
import { numberToWords } from "@/utils/numberToWords";
import { checkAuth } from "@/lib/checkAuth";
import { internalServerError } from "@/lib/apiResponse";

export async function GET() {
  const session = await checkAuth();
  if (session instanceof Response) return session;

  try {
    await dbConnect();
    const bills = await billModel.find().sort({ date: -1 });
    return NextResponse.json({
      success: true,
      data: bills.map(b => ({
        id: b._id,
        invoiceNo: b.invoiceNo,
        date: b.date,
        clientName: b.clientName,
        clientAddress: b.clientAddress,
        totalAmount: b.totalAmount,
        pdfUrl: `/api/bill/pdf?id=${b._id}`,
      }))
    })
  } catch (error) {
    return internalServerError(error);
  }
}

export async function POST(req: NextRequest) {
  const session = await checkAuth();
  if (session instanceof Response) return session;

  try {
    await dbConnect();
    const { invoice, date, name, address, p_status, items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Items are required" },
        { status: 400 }
      );
    }

    const paymentStatus = (p_status || "PENDING").toUpperCase() === "RECEIVED"
      ? "RECEIVED"
      : "PENDING";

    const doc = new PDFDocument({ size: "A4", margin: 20 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    const endPromise = new Promise<Buffer>((resolve) =>
      doc.on("end", () => resolve(Buffer.concat(chunks)))
    );

    // Geometry - ENHANCED SPACING
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const left = 20;
    const right = pageWidth - 20;
    const tableWidth = right - left;
    const headerBlockTop = 20;
    const headerBlockHeight = 50;
    const headerBottomY = headerBlockTop + headerBlockHeight + 70;
    const footerBlockHeight = 130;
    const baseRowHeight = 35; // Increased from 30

    // Assets
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const signaturePath = path.join(process.cwd(), "public", "SPS_sign.png");
    const logoBuffer = fs.existsSync(logoPath)
      ? fs.readFileSync(logoPath)
      : undefined;
    const signatureBuffer = fs.existsSync(signaturePath)
      ? fs.readFileSync(signaturePath)
      : undefined;

    // Utilities
    const formattedDate = date.split("-").reverse().join("-");

    // ENHANCED COLUMN WIDTHS - More space for product name/description
    const colWidths = {
      sr: 40,      // Reduced from 50
      name: 340,   // Increased from 300
      qty: 50,     // Reduced from 60
      rate: 50,    // Reduced from 70
      amt: 70      // Reduced from 80
    };

    const colX = {
      sr: left,
      name: left + colWidths.sr,
      qty: left + colWidths.sr + colWidths.name,
      rate: left + colWidths.sr + colWidths.name + colWidths.qty,
      amt: left + colWidths.sr + colWidths.name + colWidths.qty + colWidths.rate,
    };

    const drawHeader = () => {
      doc.rect(left, headerBlockTop, tableWidth, headerBlockHeight + 10).stroke();

      let logoUsedW = 0;
      if (logoBuffer) {
        doc.image(logoBuffer, left + 5, headerBlockTop + 5, {
          fit: [60, headerBlockHeight],
          align: "center",
          valign: "center",
        });
        logoUsedW = 60;
      }

      const titleLeft = left + (logoUsedW ? 75 : 5);
      const titleWidth = tableWidth - (logoUsedW ? 85 : 10);

      const broadwayPath = path.join(process.cwd(), "public", "fonts", "Broadway.ttf");
      if (fs.existsSync(broadwayPath)) {
        doc.registerFont("Broadway", broadwayPath);
        doc.font("Broadway");
      } else {
        doc.font("Helvetica-Bold");
      }

      doc.fillColor("#00B6D9").fontSize(20).text(
        "SPS ANALYTICAL LABORATORY",
        titleLeft,
        headerBlockTop + 10,
        { align: "center", width: titleWidth }
      );

      doc.fillColor("#000000").fontSize(14).text(
        "825, D.C.-5, PANJOGHAR, ADIPUR(KUTCH) 370205",
        titleLeft,
        headerBlockTop + 35,
        { align: "center", width: titleWidth }
      );

      const partyTop = headerBlockTop + 60;
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(11);
      doc.text(`Invoice No.: ${invoice}`, left + 5, partyTop + 10);
      doc.text(`Date: ${formattedDate}`, right - 130, partyTop + 10, { width: 130, align: "right" });
      doc.text(`M/S. ${String(name || "").toUpperCase()}`, left + 5, partyTop + 25, { width: tableWidth - 10 });
      if (address) {
        doc.font("Helvetica").fontSize(10).text(address, left + 5, partyTop + 40, { width: tableWidth - 10 });
      }
    };

    const drawTableHeader = (y: number) => {
      doc.save();
      doc.rect(left, y, tableWidth, baseRowHeight).fillAndStroke("#f0f0f0", "#000");
      doc.fillColor("#000").font("Helvetica-Bold").fontSize(10);
      doc.text("Sr.No.", colX.sr, y + 12, { width: colWidths.sr, align: "center" });
      doc.text("Particulars", colX.name + 5, y + 12, { width: colWidths.name, align: "left" });
      doc.text("Qty", colX.qty, y + 12, { width: colWidths.qty, align: "center" });
      doc.text("Rate", colX.rate, y + 12, { width: colWidths.rate, align: "center" });
      doc.text("Amount (Rs)", colX.amt, y + 12, { width: colWidths.amt, align: "center" });
      doc.restore();
    };

    const ensureSpace = (needed: number, currentY: number) => {
      if (currentY + needed > pageHeight - footerBlockHeight) {
        doc.addPage();
        drawHeader();
        drawTableHeader(headerBottomY);
        return headerBottomY + baseRowHeight;
      }
      return currentY;
    };

    const drawFooter = (yStart: number) => {
      const footerTop = yStart + 40;
      doc.moveTo(left, footerTop).lineTo(right, footerTop).stroke("#ccc");

      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10)
        .text(paymentStatus, left + 5, footerTop + 10);

      doc.fillColor("#000000").font("Helvetica").fontSize(10).text(
        "For, SPS ANALYTICAL LABORATORY",
        right - 200,
        footerTop + 10,
        { width: 200, align: "left" }
      );

      if (signatureBuffer) {
        doc.image(signatureBuffer, right - 150, footerTop - 40, { fit: [250, 45], width: 120 });
      }
    };

    drawHeader();

    let y = headerBottomY;
    drawTableHeader(y);
    y += baseRowHeight;

    // Rows - ENHANCED TEXT RENDERING
    let grandTotal = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i] || {};
      const nameText = String(it.product_name || "UNKNOWN PRODUCT").toUpperCase();
      const descText = String(it.descripation || "").toUpperCase();
      const qty = Number(it.quantity || 0);
      const rate = Number(it.price || 0);
      const total = Number(it.total_amount ?? rate * qty);
      grandTotal += total;

      // Calculate heights with better spacing
      const nameHeight = doc.heightOfString(nameText, {
        width: colWidths.name - 10,
        lineGap: 2
      });
      const descHeight = descText ? doc.heightOfString(descText, {
        width: colWidths.name - 10,
        lineGap: 2
      }) : 0;

      // Add more padding between name and description
      const particularsHeight = nameHeight + (descText ? descHeight + 15 : 0);
      const rowHeight = Math.max(baseRowHeight, particularsHeight + 25); // Increased padding

      y = ensureSpace(rowHeight + 10, y);

      doc.rect(left, y, tableWidth, rowHeight).stroke("#000");

      // Serial number
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(9)
        .text(String(i + 1), colX.sr, y + 12, { width: colWidths.sr, align: "center" });

      // Product name and description with better spacing
      let textY = y + 12;

      // Product Name - Bold and slightly larger
      doc.font("Helvetica-Bold").fontSize(10).text(nameText, colX.name + 5, textY, {
        width: colWidths.name - 10,
        align: "left",
        lineGap: 2
      });
      textY += nameHeight + 8; // Extra space after product name

      if (descText) {
        doc.font("Helvetica").fontSize(9).fillColor("#333333").text(descText, colX.name + 5, textY - 8, {
          width: colWidths.name - 10,
          align: "left",
          lineGap: 2
        });
      }

      // Other columns - vertically centered
      // const centerY = y + (rowHeight / 2) - 5;
      const centerY = y + (rowHeight / 2) - 8; // Adjusted for better vertical centering
      doc.fillColor("#000000").font("Helvetica").fontSize(9);
      doc.text(qty.toString(), colX.qty, centerY, { width: colWidths.qty, align: "center" });
      doc.text(rate.toFixed(2), colX.rate, centerY, { width: colWidths.rate, align: "center" });
      doc.text(total.toFixed(2), colX.amt, centerY, { width: colWidths.amt, align: "center" });

      y += rowHeight;
    }

    // Total row
    y = ensureSpace(baseRowHeight + 10, y);
    const words = `${numberToWords(Math.floor(grandTotal))} only`;
    doc.save();
    doc.rect(left, y, tableWidth, baseRowHeight).fillAndStroke("#f0f0f0", "#000");
    doc.fillColor("#000").font("Helvetica-Bold").fontSize(10);
    doc.text(`In words: ${words}`, left + 10, y + 12, { width: tableWidth - 220 });
    doc.text("TOTAL", colX.rate + 5, y + 12, { width: colWidths.rate - 10, align: "right" });
    doc.text(grandTotal.toFixed(2), colX.amt + 5, y + 12, { width: colWidths.amt - 10, align: "center" });
    doc.restore();
    y += baseRowHeight + 8;

    drawFooter(y);

    doc.end();
    const pdfBuffer = await endPromise;

    const newBill = await billModel.create({
      invoiceNo: invoice,
      date,
      clientName: name,
      clientAddress: address,
      payment_status: paymentStatus,
      items,
      totalAmount: grandTotal,
      pdf: pdfBuffer,
    });

    return NextResponse.json({
      success: true,
      message: "Bill Generated Successfully",
      invoiceNo: newBill.invoiceNo,
      pdfUrl: `/api/bill/pdf?id=${newBill._id}`,
    });
  } catch (err) {
    console.error("Error generating bill:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}