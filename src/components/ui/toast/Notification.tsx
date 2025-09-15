// src/components/ui/toast/Notification.tsx
"use client"
import React, { FC, ReactNode } from 'react';
import clsx from 'clsx';

type NotificationProps = {
    type: 'success' | 'warning' | 'danger' | 'info';
    title?: string;
    children: ReactNode;
};

export const Notification: FC<NotificationProps> = ({ type, title, children }) => {
    const colorMap = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
    };

    return (
        <div className={clsx('p-4 rounded shadow-md', colorMap[type])}>
            {title && <strong className="block mb-1">{title}</strong>}
            <span>{children}</span>
        </div>
    );
};