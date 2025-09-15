"use client";

import { Button } from "@/components/ui/button/Button";
import { DropDown } from "@/components/ui/fields/DropDown";
import { NumberInput } from "@/components/ui/fields/NumberInput";
import { Input } from "@/components/ui/fields/TextInput";
import { useProducts } from "@/hooks/useProduct";
import { InvoiceValues, Product } from "@/types/product.type";
import { FieldArray, Form, Formik } from "formik";
import jsPDF from "jspdf";
import * as yup from "yup";

const billValidationSchema = yup.object({
  name: yup.string().required()
});

interface InvoiceItem {
  p_id: string;
  product_name: string;
  price: number;
  quantity: number;
  total_amount: number;
}

export default function InvoiceGenerator() {
  const { data: products, isLoading } = useProducts();

  // generate invoice number with timestamp
  const now = new Date();
  const invoiceNo = `INV-${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;

  // dropdown options
  const productOptions =
    products?.data?.map((p: Product) => ({
      value: p._id as string,
      label: p.name,
    })) || [];

  // price and name maps for lookup
  const productPriceMap: Record<string, number> = Object.fromEntries(
    products?.data?.map((p: Product) => [p._id, p.price]) || []
  );

  const productNameMap: Record<string, string> = Object.fromEntries(
    products?.data?.map((p: Product) => [p._id, p.name]) || []
  );

  // Number to words conversion
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const convertHundreds = (n: number): string => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result;
      }
      if (n > 0) {
        result += ones[n] + ' ';
      }
      return result;
    };

    if (num < 1000) {
      return convertHundreds(num).trim();
    } else if (num < 100000) {
      return convertHundreds(Math.floor(num / 1000)) + 'Thousand ' + convertHundreds(num % 1000);
    } else if (num < 10000000) {
      return convertHundreds(Math.floor(num / 100000)) + 'Lakh ' + convertHundreds((num % 100000) / 1000) + 'Thousand ' + convertHundreds(num % 1000);
    }
    return num.toString();
  };

  const handleClick = async (
    values: InvoiceValues,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      // Prepare items with product names
      const itemsWithNames: InvoiceItem[] = values.items.map((item) => ({
        ...item,
        product_name: productNameMap[item.p_id] || 'Unknown Product'
      }));

      const invoiceData = {
        ...values,
        items: itemsWithNames
      };

      // 1. Save invoice in DB
      const res = await fetch("/api/bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (!res.ok) throw new Error("Failed to save invoice");

      const { id } = await res.json();

      // 2. Fetch bill JSON
      const billRes = await fetch(`/api/bill/${id}`);
      const { bill } = await billRes.json();

      // 3. Generate Professional PDF
      const doc = new jsPDF();

      // Company Header with border
      doc.setLineWidth(1);
      doc.rect(10, 10, 190, 30);

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("SPS ANALYTICAL LABORATORY", 105, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("503, B.C.-3, RANICCHAL, AHMEDABAD(GUJARAT) 380013", 105, 28, { align: "center" });
      doc.text("GSTIN: 24AABCS1234C1Z5", 105, 34, { align: "center" });

      //  Date convert in proper
      const date = new Date(bill.date);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}-${date.getFullYear()}`;

      // Invoice details section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Invoice No.: ${bill.invoiceNo}`, 14, 55);
      doc.text(`Date: ${formattedDate}`, 140, 55);

      // Client details
      doc.text("M/S. " + bill.clientName.toUpperCase(), 14, 70);
      if (bill.clientAddress && bill.clientAddress !== "—") {
        doc.setFont("helvetica", "normal");
        doc.text(bill.clientAddress, 14, 78);
      }

      // Table header with borders
      const tableStartY = 95;
      const rowHeight = 8;

      // Draw table header
      doc.setFillColor(240, 240, 240);
      doc.rect(14, tableStartY, 182, rowHeight, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Sr.No.", 16, tableStartY + 5);
      doc.text("Particulars", 35, tableStartY + 5);
      doc.text("No. of sample", 120, tableStartY + 5);
      doc.text("Rate", 150, tableStartY + 5);
      doc.text("Amount (in Rs)", 170, tableStartY + 5);

      // Draw table borders
      doc.setLineWidth(0.5);
      doc.line(14, tableStartY, 196, tableStartY); // Top border
      doc.line(14, tableStartY + rowHeight + 4, 196, tableStartY + rowHeight + 4); // Header bottom border

      // Table content
      let currentY = tableStartY + rowHeight + 8;
      let total = 0;

      doc.setFont("helvetica", "normal");
      bill.items.forEach((item: InvoiceItem, i: number) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const amount = Number(item.total_amount) || qty * price;
        total += amount;

        doc.text(String(i + 1), 16, currentY);

        // Product name with description
        const productText = item.product_name || productNameMap[item.p_id] || "Product";
        doc.text(productText.toUpperCase(), 35, currentY);
        doc.text("VIDE OUR CERT. NO. JSN - 25/3036", 35, currentY + 4);

        doc.text(String(qty), 130, currentY);
        doc.text(price.toFixed(0) + "/-", 152, currentY);
        doc.text(amount.toFixed(0) + "/-", 180, currentY);

        currentY += 20; // More space for each item
      });

      // Total section
      const totalY = currentY + 10;
      doc.line(14, totalY - 5, 196, totalY - 5); // Line before total

      doc.setFont("helvetica", "bold");
      doc.text("IN WORD.: " + numberToWords(Math.floor(total)) + " only", 16, totalY);

      doc.text("TOTAL", 130, totalY);
      doc.text(total.toFixed(0) + "/-", 175, totalY);

      // Bottom section
      doc.text("For, SPS ANALYTICAL LABORATORY", 130, totalY + 20);
      doc.text("RECEIVED", 16, totalY + 40);

      // Outer border for the entire bill
      doc.setLineWidth(1);
      doc.rect(10, 45, 190, totalY + 50 - 45);

      // Download
      doc.save(`invoice-${bill.invoiceNo}.pdf`);

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Formik<InvoiceValues>
        initialValues={{
          invoice: invoiceNo,
          date: now.toISOString().split("T")[0],
          name: "",
          address: "",
          items: [{ p_id: "", product_name: "", price: 0, quantity: 1, total_amount: 0 }],
        }}
        validationSchema={billValidationSchema}
        onSubmit={(values, { setSubmitting }) =>
          handleClick(values, setSubmitting)
        }
      >
        {({ isSubmitting, submitForm, values, setFieldValue }) => (
          <Form className="p-4">
            <div className="md:flex gap-4">
              <Input
                label="Invoice No"
                name="invoice"
                type="text"
                placeholder="Invoice No."
                disabled
              />
              <Input
                label="Date"
                name="date"
                type="date"
                placeholder="Date"
              />
            </div>

            <div className="flex gap-4">
              <Input
                label="Name"
                name="name"
                type="text"
                placeholder="Enter client name"
              />
              <Input
                label="Address"
                name="address"
                type="text"
                placeholder="Enter client address"
              />
            </div>

            <FieldArray name="items">
              {({ push, remove }) => (
                <>
                  <div className="flex items-center justify-between mt-4">
                    <h2 className="font-medium text-lg md:text-2xl">
                      Invoice Items
                    </h2>
                    <Button
                      type="button"
                      variant="addMonth"
                      className="w-auto"
                      onClick={() =>
                        push({
                          p_id: "",
                          product_name: "",
                          price: 0,
                          quantity: 1,
                          total_amount: 0,
                        })
                      }
                    >
                      Add Item
                    </Button>
                  </div>

                  {values.items.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded py-2 px-4 mt-2 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end"
                    >
                      <DropDown
                        label="Product"
                        name={`items.${index}.p_id`}
                        dynamicOptions={productOptions}
                        placeholder="Select product"
                        required
                        disabled={isLoading}
                        className="w-full lg:mb-4"
                        onChange={(option) => {
                          const productId = option?.value as string | undefined;

                          if (productId === undefined) {
                            setFieldValue(`items.${index}.p_id`, "");
                            setFieldValue(`items.${index}.product_name`, "");
                            setFieldValue(`items.${index}.price`, 0);
                            setFieldValue(`items.${index}.total_amount`, 0);
                            return;
                          }

                          const price = productPriceMap[productId] || 0;
                          const productName = productNameMap[productId] || "";

                          setFieldValue(`items.${index}.p_id`, productId);
                          setFieldValue(`items.${index}.product_name`, productName);
                          setFieldValue(`items.${index}.price`, price);

                          const qty = values.items[index].quantity || 1;
                          setFieldValue(
                            `items.${index}.total_amount`,
                            qty * price
                          );
                        }}
                      />

                      <Input
                        label="Price"
                        name={`items.${index}.price`}
                        placeholder="Price"
                        disabled
                      />

                      <NumberInput
                        label="Quantity"
                        name={`items.${index}.quantity`}
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const qty = Number(e.target.value || 1);
                          const price = values.items[index].price || 0;

                          setFieldValue(`items.${index}.quantity`, qty);
                          setFieldValue(
                            `items.${index}.total_amount`,
                            qty * price
                          );
                        }}
                        required
                      />

                      <NumberInput
                        label="Total Amount"
                        name={`items.${index}.total_amount`}
                        placeholder="Amount"
                        disabled
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => remove(index)}
                        className="hidden md:flex text-red-500 hover:text-red-700 bg-transparent"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </FieldArray>

            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                variant="eventBtn"
                className="w-full md:w-1/2 lg:w-auto text-center"
                isLoading={isSubmitting}
                onClick={submitForm}
              >
                Generate Bill
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}