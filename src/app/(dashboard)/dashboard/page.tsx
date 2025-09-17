// app/(dashboard)/dashboard/page.tsx
"use client";

import { Button } from "@/components/ui/button/Button";
import { DropDown } from "@/components/ui/fields/DropDown";
import { NumberInput } from "@/components/ui/fields/NumberInput";
import { Input } from "@/components/ui/fields/TextInput";
import { useCreateBill } from "@/hooks/useBill";
import { useProducts } from "@/hooks/useProduct";
import { BillResponse, InvoiceItem, InvoiceValues, Product } from "@/types/product.type";
import { invoiceNo } from "@/utils/invoiceNumber";
import { FieldArray, Form, Formik } from "formik";
import * as yup from "yup";

const billValidationSchema = yup.object({
  name: yup.string().required()
});

const now = new Date();

export default function InvoiceGenerator() {
  const { data: products, isLoading } = useProducts();
  const createBill = useCreateBill();

  const productOptions =
    products?.data?.map((p: Product) => ({
      value: p._id as string,
      label: p.name,
    })) || [];

  const productPriceMap: Record<string, number> = Object.fromEntries(
    products?.data?.map((p: Product) => [p._id, p.price]) || []
  );

  const productNameMap: Record<string, string> = Object.fromEntries(
    products?.data?.map((p: Product) => [p._id, p.name]) || []
  );

  // const handleClick = async (
  //   values: InvoiceValues,
  //   setSubmitting: (isSubmitting: boolean) => void
  // ) => {
  //   try {
  //     const itemsWithNames: InvoiceItem[] = values.items.map((item) => ({
  //       ...item,
  //       product_name: productNameMap[item.p_id] || "Unknown Product",
  //     }));

  //     const invoiceData = {
  //       ...values,
  //       items: itemsWithNames,
  //     };


  //     const savedBill: BillResponse = await createBill.mutateAsync(invoiceData);
  //     const bill = savedBill.data;

  //     console.log(savedBill.data, bill, bill.invoiceNo)

  //     const downloadServerPDF = (
  //       pdfBuffer: { type: string; data: number[] } | undefined,
  //       fileName: string
  //     ) => {
  //       if (!pdfBuffer) {
  //         console.error("No PDF buffer returned from server");
  //         return;
  //       }
  //       const uint8Array = new Uint8Array(pdfBuffer.data);
  //       const blob = new Blob([uint8Array], { type: "application/pdf" });
  //       const url = window.URL.createObjectURL(blob);

  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.download = fileName || "invoice.pdf";
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);

  //       window.URL.revokeObjectURL(url);
  //     };

  //     downloadServerPDF(bill?.pdf, `invoice-${bill.invoice}.pdf`);

  //     return;

  //   } catch (err) {
  //     console.error("Error:", err);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleClick = async (
    values: InvoiceValues,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      const itemsWithNames: InvoiceItem[] = values.items.map((item) => ({
        ...item,
        product_name: productNameMap[item.p_id] || "Unknown Product",
      }));

      const invoiceData = {
        ...values,
        items: itemsWithNames,
      };
      console.log("Invoice Data to be sent:", invoiceData);
      const savedBill: BillResponse = await createBill.mutateAsync(invoiceData);

      console.log("Saved bill:", savedBill, "Invoice No:", savedBill.invoiceNo);

      const downloadServerPDF = (
        pdfBuffer: { type: string; data: number[] } | undefined,
        fileName: string
      ) => {
        if (!pdfBuffer) {
          console.error("No PDF buffer returned from server");
          return;
        }
        const uint8Array = new Uint8Array(pdfBuffer.data);
        const blob = new Blob([uint8Array], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "invoice.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
      };

      // Access properties directly from savedBill (no .data nesting)
      downloadServerPDF(savedBill?.pdf, `invoice-${savedBill.invoiceNo}.pdf`);

      return;

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
              <Input label="Invoice No" name="invoice" type="text" placeholder="Invoice No." disabled />
              <Input label="Date" name="date" type="date" placeholder="Date" />
            </div>

            <div className="flex gap-4">
              <Input label="Name" name="name" type="text" placeholder="Enter client name" />
              <Input label="Address" name="address" type="text" placeholder="Enter client address" />
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
                          p_id: "", product_name: "", price: 0, quantity: "", total_amount: 0,
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
                          setFieldValue(
                            `items.${index}.total_amount`,
                            qty * price
                          );
                        }}
                      />

                      <Input label="Price" name={`items.${index}.price`} placeholder="Price" disabled />

                      <NumberInput
                        label="Quantity"
                        name={`items.${index}.quantity`}
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const qty = Number(e.target.value || NaN);
                          const price = values.items[index].price || NaN;

                          setFieldValue(`items.${index}.quantity`, qty);
                          setFieldValue(
                            `items.${index}.total_amount`,
                            qty * price
                          );
                        }}
                        required
                      />

                      <NumberInput label="Total Amount" name={`items.${index}.total_amount`} placeholder="Amount" disabled />

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