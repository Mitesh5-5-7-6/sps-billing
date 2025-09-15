import React from "react";
import { Button } from "./button/Button";
import { motion } from "framer-motion";

interface DeleteProps {
    title: string;
    subTitle: string;
    isSubmitting: boolean;
    closePopup: () => void;
    handleDelete: () => void;
}

export const DeleteDialog: React.FC<DeleteProps> = ({
    title,
    subTitle,
    isSubmitting,
    handleDelete,
    closePopup,
}) => {
    return (
        <motion.div
            className="my-4 flex flex-col bg-[var(--dark-bg)] items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <h1 className="text-xl md:text-3xl text-center my-4 max-md:max-w-full">
                Delete {title}
            </h1>
            <p className="mb-2 md:mb-8 text-center text-[var(--secondary-text)] text-md md:text-lg">
                Are you sure you want to delete this {title.toLowerCase()}{" "}
                <span className="text-[var(--orange-bg)]">{subTitle}</span>?
            </p>
            <div className="flex gap-x-4 justify-between">
                <Button
                    type="button"
                    variant="primary"
                    className="flex justify-center items-center"
                    onClick={closePopup}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="eventBtn"
                    className="flex justify-center items-center"
                    isLoading={isSubmitting}
                    onClick={handleDelete}
                >
                    Delete
                </Button>
            </div>
        </motion.div>
    );
};
