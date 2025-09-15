// components/Dialog.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PopupOptions {
    title?: string;
    description?: string;
    children?: ReactNode;
    width?: string;
    height?: string;
    onClose?: () => void;
    closeButton?: boolean;
    backdropOpacity?: number;
}

interface PopupContextType {
    showPopup: (options: PopupOptions) => void;
    hidePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
    const context = useContext(PopupContext);
    if (!context) {
        throw new Error("usePopup must be used within a PopupProvider");
    }
    return context;
};

export const PopupProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [popupContent, setPopupContent] = useState<PopupOptions | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    const showPopup = (options: PopupOptions) => {
        setPopupContent(options);
        setIsClosing(false);
    };

    const hidePopup = () => {
        if (popupContent?.onClose) popupContent.onClose();
        setIsClosing(true);
        setTimeout(() => {
            setPopupContent(null);
            setIsClosing(false);
        }, 300);
    };

    return (
        <PopupContext.Provider value={{ showPopup, hidePopup }}>
            {children}
            <AnimatePresence>
                {popupContent && !isClosing && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            backgroundColor: `rgba(0, 0, 0, ${
                                popupContent.backdropOpacity ?? 0.8
                            })`,
                        }}
                    >
                        <motion.div
                            className={`bg-[var(--dark-bg)] rounded-lg shadow-lg relative ${
                                popupContent.width ?? "w-[90%] max-w-md"
                            } ${popupContent.height ?? "p-6"}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            {popupContent.children}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PopupContext.Provider>
    );
};
