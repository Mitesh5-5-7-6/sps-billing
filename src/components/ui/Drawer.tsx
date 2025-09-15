'use client';

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from 'lucide-react';

interface DrawerProps {
    width?: string;
    heading: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ width = "max-w-md", heading, isOpen, onClose, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/40 bg-opacity-50 z-30"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <motion.div
                        className={`fixed right-0 top-0 overflow-y-auto custom-scrollbar bottom-0 w-full ${width} bg-[var(--bg-color)] shadow-lg z-40`}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="p-4">
                            <div className="flex justify-between">
                                <h1 className="text-xl lg:text-2xl text-center text-[var(--primary-text)]">
                                    {heading}
                                </h1>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-md bg-[var(--primary-bg)] hover:bg-[var(--secondary-bg)] transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <hr className="my-4 text-[var(--dark-text)]" />
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};