"use client"

import React, { FunctionComponent, useState } from 'react'
import { Button } from '@/components/ui/button/Button'
import DataTable, { Column } from '@/components/ui/DataTable'
import { usePopup } from '@/components/ui/DialogProvider'
import { Drawer } from '@/components/ui/Drawer'
import { Product } from '@/types/product.type'
import { Form, Formik } from "formik";
import { NumberInput } from '@/components/ui/fields/NumberInput'
import { Input } from '@/components/ui/fields/TextInput'
import { DeleteDialog } from '@/components/ui/DeleteDialog'
import Notify from '@/utils/notify'
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from '@/hooks/useProduct'
import * as yup from "yup";

const productValidationSchema = yup.object({
    name: yup.string().required(),
    price: yup.string().required()
})

export const ProductPage: FunctionComponent = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { showPopup, hidePopup } = usePopup();

    const { data: products, isLoading, error } = useProducts();
    // const { data: bill } = useBill();
    // const { data: mBill } = useMonthlyBill('2025-08');

    // useEffect(() => {
    //     console.log(bill)
    //     console.log("Monthly Bill:", mBill);
    // }, [mBill, bill]);

    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    const handleProduct = async (
        values: { name: string, price: number | null },
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        try {
            setSubmitting(true);
            if (editingProduct) {
                await updateProduct.mutateAsync({
                    id: editingProduct._id!,
                    data: values,
                });
            } else {
                await createProduct.mutateAsync(values);
            }
        } catch {
            Notify("danger", "Something went wrong", "Error");
        } finally {
            setDrawerOpen(false);
            setEditingProduct(null);
        }
    };

    const handleEdit = (row: Product) => {
        setEditingProduct(row);
        setDrawerOpen(true);
    };

    const handleDelete = (row: Product) => {
        showPopup({
            children: (
                <DeleteDialog
                    title="Product"
                    subTitle={row.name}
                    isSubmitting={false}
                    closePopup={hidePopup}
                    handleDelete={async () => {
                        try {
                            await deleteProduct.mutateAsync(row._id ?? "");
                        } catch {
                            Notify("danger", "Delete failed", "Error");
                        }
                        hidePopup();
                    }}
                />
            ),
            width: "w-full max-w-md",
            backdropOpacity: 0.4,
        });
    };

    const columns: Column<Product>[] = [
        { header: "Name", accessor: "name" },
        { header: "Price", accessor: "price" },
        {
            header: "",
            accessor: "name",
            className: "text-right",
            render: (_: Product[keyof Product], row: Product) => (
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-500 hover:underline"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="text-red-500 hover:underline"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="flex md:p-4 justify-between items-center">
                <h1 className="p-4 text-sm md:text-xl font-semibold text-center">Product Datatable</h1>
                <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                        setEditingProduct(null);
                        setDrawerOpen(true);
                    }}
                >
                    Add Product
                </Button>
            </div>

            <DataTable<Product>
                data={products?.data ?? []}
                columns={columns}
                loading={isLoading}
                noDataMessage="No Products found"
                error={!!error}
            />

            <Drawer
                heading={editingProduct ? "Edit Product" : "Add Product"}
                isOpen={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setEditingProduct(null);
                }}
            >
                <div className="text-[var(--dark-text)]">
                    <Formik
                        initialValues={{ name: editingProduct?.name || "", price: editingProduct?.price || null }}
                        validationSchema={productValidationSchema}
                        enableReinitialize
                        onSubmit={(values, { setSubmitting }) =>
                            handleProduct(values, setSubmitting)
                        }
                    >
                        {({ isSubmitting, submitForm }) => (
                            <Form>
                                <Input
                                    label="Name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter product name"
                                />
                                <NumberInput
                                    label="Price"
                                    name="price"
                                    placeholder="Enter product price"
                                />
                                <div className="flex justify-end mt-4">
                                    <Button
                                        type="submit"
                                        variant="eventBtn"
                                        className="w-full md:w-auto"
                                        isLoading={isSubmitting}
                                        onClick={submitForm}
                                    >
                                        {editingProduct ? "Update" : "Create"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Drawer>
        </>
    )
}