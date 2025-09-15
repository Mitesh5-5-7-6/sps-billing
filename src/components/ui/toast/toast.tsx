import React from 'react';
import { Notification as NotificationCard } from './Notification'; // ✅ Rename to avoid name conflict

export const toast = {
    push: (content: React.ReactNode, duration: number = 5000) => {
        const event = new CustomEvent('toast', {
            detail: { toast: content, duration }
        });
        window.dispatchEvent(event);
    },

    success: (message: string, title?: string, duration: number = 3000) => {
        toast.push(
            <NotificationCard type="success" title={title}>
                {message}
            </NotificationCard>,
            duration
        );
    },

    warning: (message: string, title?: string, duration: number = 3000) => {
        toast.push(
            <NotificationCard type="warning" title={title}>
                {message}
            </NotificationCard>,
            duration
        );
    },

    error: (message: string, title?: string, duration: number = 3000) => {
        toast.push(
            <NotificationCard type="danger" title={title}>
                {message}
            </NotificationCard>,
            duration
        );
    },

    info: (message: string, title?: string, duration: number = 3000) => {
        toast.push(
            <NotificationCard type="info" title={title}>
                {message}
            </NotificationCard>,
            duration
        );
    },
};