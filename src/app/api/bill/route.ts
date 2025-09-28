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
    const { invoice, date, name, address, items } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Items are required" }, { status: 400 });
    }

    const doc = new PDFDocument({ size: "A4", margin: 30 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    const endPromise = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));

    // Geometry
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const left = 30;
    const right = pageWidth - 30;
    const tableWidth = right - left;
    const headerBlockTop = 20;
    const headerBlockHeight = 50;
    const headerBottomY = headerBlockTop + headerBlockHeight + 70;
    const footerBlockHeight = 130;
    const baseRowHeight = 22;

    // Assets
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const signaturePath = path.join(process.cwd(), "public", "SPS_sign.png");

    const logoBuffer = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : undefined;
    const signatureBuffer = fs.existsSync(signaturePath) ? fs.readFileSync(signaturePath) : undefined;

    // Utilities
    const formattedDate = date.split("-").reverse().join("-");
    const colWidths = { sr: 42, name: 240, qty: 80, rate: 80, amt: 100 };
    const colX = {
      sr: left,
      name: left + 42,
      qty: left + 282,
      rate: left + 362,
      amt: left + 442,
    };

    const drawHeader = () => {
      // outer block
      doc.rect(left - 10, headerBlockTop, tableWidth + 20, headerBlockHeight + 10).stroke();

      // logo box left
      const logoBoxX = left - 5;
      const logoBoxY = headerBlockTop + 3;
      const logoBoxW = 60;
      const logoBoxH = headerBlockHeight;

      let logoUsedW = 0;
      if (logoBuffer) {
        // keep aspect with fit
        doc.image(logoBuffer, logoBoxX, logoBoxY, { fit: [logoBoxW, logoBoxH], align: "center", valign: "top" });
        // approximate used width to reserve horizontal offset
        logoUsedW = logoBoxW;
      }

      // title block centered relative to full width, but account for left logo
      const titleLeft = left + (logoUsedW ? 70 : 0);
      const titleWidth = tableWidth - (logoUsedW ? 120 : 0);

      const broadwayPath = path.join(process.cwd(), "public", "fonts", "Broadway.ttf");
      if (fs.existsSync(broadwayPath)) {
        doc.registerFont("Broadway", broadwayPath);
        doc.font("Broadway");
      } else {
        doc.font("Helvetica-Bold");
      }

      doc.fillColor("#00B6D9").font("Broadway").fontSize(20)
        .text("SPS ANALYTICAL LABORATORY", titleLeft, headerBlockTop + 10, { align: "center", width: titleWidth });

      doc.fillColor("#000000").font("Broadway").fontSize(14)
        .text("825, D.C.-5, PANJOGHAR, ADIPUR(KUTCH) 370205", titleLeft, headerBlockTop + 35, { align: "center", width: titleWidth })

      // party block
      const partyTop = headerBlockTop + 60;
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(11);
      doc.text(`Invoice No.: ${invoice}`, left - 10, partyTop + 10);
      doc.text(`Date: ${formattedDate}`, right - 140, partyTop + 10, { width: 150, align: "right" });
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(11).text(`M/S. ${String(name || "").toUpperCase()}`, left - 10, partyTop + 25, { width: tableWidth });
      if (address) {
        doc.fillColor("#000000").font("Helvetica").fontSize(10).text(address, left - 10, partyTop + 40, { width: tableWidth });
      }
    };

    const drawTableHeader = (y: number) => {
      doc.save();
      doc.rect(left, y, tableWidth, baseRowHeight).fillAndStroke("#f0f0f0", "#000");
      doc.fillColor("#000").font("Helvetica-Bold").fontSize(9);
      doc.text("Sr.No.", colX.sr, y + 6, { width: colWidths.sr, align: "center" });
      doc.text("Particulars", colX.name, y + 6, { width: colWidths.name, align: "left" });
      doc.text("Qty", colX.qty, y + 6, { width: colWidths.qty, align: "center" });
      doc.text("Rate", colX.rate, y + 6, { width: colWidths.rate, align: "center" });
      doc.text("Amount (Rs)", colX.amt, y + 6, { width: colWidths.amt, align: "center" });
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
      const footerTop = yStart + 20; // push just below table
      doc.moveTo(left, footerTop).lineTo(right, footerTop).stroke("#ccc");

      const colW = (tableWidth / 2) - 10;
      const rightColX = left + colW + 20;

      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10).text("PENDING", left, footerTop + 10);
      doc.fillColor("#000000").font("Helvetica").fontSize(10).text("For, SPS ANALYTICAL LABORATORY", right - 180, footerTop + 10, { width: 200 });

      if (signatureBuffer) {
        doc.image(signatureBuffer, rightColX + colW - 150, footerTop - 40, { fit: [250, 45], width: 120 });
      }
    };

    drawHeader();

    // Render header and table header on first page
    let y = headerBottomY;
    drawTableHeader(y);
    y += baseRowHeight;

    // Rows
    let grandTotal = 0;
    doc.fillColor("#000000").font("Helvetica").fontSize(9);

    for (let i = 0; i < items.length; i += 1) {
      const it = items[i] || {};
      const nameText = String(it.product_name || "UNKNOWN PRODUCT").toUpperCase();
      const descText = String(it.descripation || "").toUpperCase();
      const qty = Number(it.quantity || 0);
      const rate = Number(it.price || 0);
      const total = Number(it.total_amount ?? rate * qty);
      grandTotal += total;

      const particularsText = descText
        ? `${nameText}\n${descText}`
        : nameText;

      // compute row height from product+desc text
      const particularsHeight = Math.max(
        12,
        doc.heightOfString(particularsText, { width: colWidths.name })
      );
      const rowHeight = Math.max(baseRowHeight, Math.ceil(particularsHeight / 12) * 14 + 6);

      y = ensureSpace(rowHeight + baseRowHeight + 10, y);

      // draw row
      doc.rect(left, y, tableWidth, rowHeight).stroke("#000");
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(9)
        .text(String(i + 1), colX.sr, y + 6, { width: colWidths.sr, align: "center" });

      // product name bold, description normal
      doc.fillColor("#000000").font("Helvetica-Bold").fontSize(9)
        .text(nameText, colX.name, y + 4, { width: colWidths.name, align: "left" });
      if (descText) {
        doc.fillColor("#000000").font("Helvetica").fontSize(9)
          .text(descText, colX.name, y + 18, { width: colWidths.name, align: "left" });
      }

      doc.fillColor("#000000").font("Helvetica").fontSize(9);
      doc.text(qty.toString(), colX.qty, y + 6, { width: colWidths.qty, align: "center" });
      doc.text(`${rate.toFixed(2)}`, colX.rate, y + 6, { width: colWidths.rate, align: "center" });
      doc.text(`${total.toFixed(2)}`, colX.amt, y + 6, { width: colWidths.amt, align: "center" });

      y += rowHeight;
    }

    // Total row
    y = ensureSpace(baseRowHeight + 10, y);
    const words = `${numberToWords(Math.floor(grandTotal))} only`;
    doc.save();
    doc.rect(left, y, tableWidth, baseRowHeight).fillAndStroke("#f0f0f0", "#000");
    doc.fillColor("#000").font("Helvetica-Bold").fontSize(10);
    doc.text(`In words: ${words}`, left + 10, y + 6, { width: tableWidth - 180 });
    doc.text("TOTAL", colX.rate, y + 6, { width: colWidths.rate, align: "right" });
    doc.text(`${grandTotal.toFixed(2)}`, colX.amt, y + 6, { width: colWidths.amt, align: "center" });
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
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
