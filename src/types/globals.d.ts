import type { FC, ReactNode } from 'react';

declare global {
    interface Window {
        Notification?: FC<{
            type: 'success' | 'warning' | 'danger' | 'info';
            title?: string;
            children: ReactNode;
        }>;
    }
}