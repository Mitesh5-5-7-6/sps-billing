// src/components/ui/toast/ToastContainer.tsx
"use client";
import React, { useEffect, useState } from 'react';

export const ToastContainer = () => {
    const [toasts, setToasts] = useState<{ id: number; content: React.ReactNode }[]>([]);

    useEffect(() => {
        const listener = (e: Event) => {
            const { toast, duration } = (e as CustomEvent).detail;
            const id = Date.now();
            setToasts((prev) => [...prev, { id, content: toast }]);

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        };

        window.addEventListener('toast', listener);
        return () => window.removeEventListener('toast', listener);
    }, []);

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((t) => (
                <div key={t.id}>{t.content}</div>
            ))}
        </div>
    );
};