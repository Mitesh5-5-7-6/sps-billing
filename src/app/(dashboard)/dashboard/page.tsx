"use client";

import { Button } from "@/components/ui/button/Button";
import { DropDown } from "@/components/ui/fields/DropDown";
import { NumberInput } from "@/components/ui/fields/NumberInput";
import { Input } from "@/components/ui/fields/TextInput";
import { useCreateBill } from "@/hooks/useBill";
import { useProducts } from "@/hooks/useProduct";
import { BillResponse, InvoiceItem, InvoiceValues, Product } from "@/types/product.type";
import { FieldArray, Form, Formik } from "formik";
import * as yup from "yup";
import { useEffect, useState } from "react";

const billValidationSchema = yup.object({
  name: yup.string().required(),
});

// Function to generate automatic invoice number
const generateInvoiceNumber = async (): Promise<string> => {
  try {
    const response = await fetch("/api/bill/next-invoice", { method: "GET" });
    if (response.ok) {
      const data = await response.json();
      return data.invoiceNumber;
    }
  } catch (error) {
    console.error("Error generating invoice number:", error);
  }

  // fallback
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const timestamp = now.getTime().toString().slice(-6);
  return `JSN-${year}/${timestamp}`;
};

export default function InvoiceGenerator() {
  const { data: products, isLoading } = useProducts();
  const createBill = useCreateBill();
  const [initialInvoice, setInitialInvoice] = useState<string>("");

  const now = new Date();

  // maps
  const productOptions =
    products?.data?.map((p: Product) => ({ value: p._id as string, label: p.name })) || [];
  const productPriceMap: Record<string, number> = Object.fromEntries(
    products?.data?.map((p: Product) => [p._id, p.price]) || []
  );
  const productNameMap: Record<string, string> = Object.fromEntries(
    products?.data?.map((p: Product) => [p._id, p.name]) || []
  );

  // Generate invoice number on mount
  useEffect(() => {
    const initInvoiceNumber = async () => {
      const newInvoiceNumber = await generateInvoiceNumber();
      setInitialInvoice(newInvoiceNumber);
    };
    initInvoiceNumber();
  }, []);

  if (!initialInvoice) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Generating invoice number...</div>
      </div>
    );
  }

  return (
    <div>
      <Formik<InvoiceValues>
        initialValues={{
          invoice: initialInvoice,
          date: now.toISOString().split("T")[0],
          name: "",
          address: "",
          items: [
            { p_id: "", product_name: "", price: 0, quantity: 1, total_amount: 0, descripation: "" },
          ],
        }}
        validationSchema={billValidationSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            const itemsWithNames: InvoiceItem[] = values.items.map((item) => ({
              ...item,
              product_name: productNameMap[item.p_id] || "Unknown Product",
            }));

            const invoiceData = { ...values, items: itemsWithNames };
            const savedBill: BillResponse = await createBill.mutateAsync(invoiceData);

            // download PDF via pdfUrl
            if (savedBill?.pdfUrl) {
              const res = await fetch(savedBill.pdfUrl);
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `invoice-${savedBill.invoiceNo}.pdf`;
              link.click();
              window.URL.revokeObjectURL(url);
            }

            // get next invoice number and reset form
            const nextInvoiceNumber = await generateInvoiceNumber();
            resetForm({
              values: {
                invoice: nextInvoiceNumber,
                date: new Date().toISOString().split("T")[0],
                name: "",
                address: "",
                items: [
                  {
                    p_id: "",
                    product_name: "",
                    price: 0,
                    quantity: 1,
                    total_amount: 0,
                    descripation: "",
                  },
                ],
              },
            });
          } catch (err) {
            console.error("Error:", err);
          } finally {
            setSubmitting(false);
          }
        }}
        enableReinitialize
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
                value={values.invoice}
              />
              <Input label="Name" name="name" type="text" placeholder="Enter client name" />
              <Input label="Date" name="date" type="date" placeholder="Date" />
            </div>

            <Input label="Address" name="address" type="text" placeholder="Enter client address" />

            <FieldArray name="items">
              {({ push, remove }) => (
                <>
                  <div className="flex items-center justify-between mt-4">
                    <h2 className="font-medium text-lg md:text-2xl">Invoice Items</h2>
                    <Button
                      type="button"
                      variant="addMonth"
                      onClick={() =>
                        push({
                          p_id: "",
                          product_name: "",
                          price: 0,
                          quantity: 1,
                          total_amount: 0,
                          descripation: "",
                        })
                      }
                    >
                      Add Item
                    </Button>
                  </div>

                  {values.items.map((item, index) => (
                    <div key={index} className="border rounded py-2 px-4 mt-2">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
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
                            if (!productId) {
                              setFieldValue(`items.${index}.p_id`, "");
                              setFieldValue(`items.${index}.product_name`, "");
                              setFieldValue(`items.${index}.price`, "");
                              setFieldValue(`items.${index}.total_amount`, 0);
                              return;
                            }
                            const price = productPriceMap[productId] || 0;
                            const productName = productNameMap[productId] || "";
                            setFieldValue(`items.${index}.p_id`, productId);
                            setFieldValue(`items.${index}.product_name`, productName);
                            setFieldValue(`items.${index}.price`, price);
                            const qty = values.items[index].quantity || 1;
                            setFieldValue(`items.${index}.total_amount`, qty * price);
                          }}
                        />
                        <Input label="Price" name={`items.${index}.price`} placeholder="Price" disabled />
                        <NumberInput
                          label="Quantity"
                          name={`items.${index}.quantity`}
                          placeholder="Quantity"
                          value={item.quantity}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const qty = Number(e.target.value || 0);
                            const price = values.items[index].price || 0;
                            setFieldValue(`items.${index}.quantity`, qty);
                            setFieldValue(`items.${index}.total_amount`, qty * price);
                          }}
                          required
                        />
                        <NumberInput
                          label="Total Amount"
                          name={`items.${index}.total_amount`}
                          placeholder="Amount"
                          disabled
                        />
                        <div className="my-auto">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => remove(index)}
                            className="mt-[9px] hidden md:flex text-red-500 hover:text-red-700 bg-transparent"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Input
                          label="Product Description"
                          type="text"
                          name={`items.${index}.descripation`}
                          placeholder="Enter detailed product description..."
                          className="w-full"
                        />
                      </div>
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
