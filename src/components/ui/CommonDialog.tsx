"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface CommonDialogProps {
    title?: string;
    children: ReactNode;
    onClose?: () => void;
}

export const CommonDialog: React.FC<CommonDialogProps> = ({
    title,
    children,
}) => {
    return (
        <motion.div
            className="p-6 max-w-lg w-full mx-auto bg-[var(--dark-bg)] rounded-xl shadow-lg flex flex-col gap-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
        >
            {title && (
                <h2 className="text-xl font-semibold text-center border-b pb-2">
                    {title}
                </h2>
            )}
            <div>{children}</div>
        </motion.div>
    );
};
