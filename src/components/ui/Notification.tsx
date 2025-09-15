import React from 'react';
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    Info,
    // X
} from 'lucide-react';

export type NotificationType = 'success' | 'warning' | 'danger' | 'info';

export interface NotificationProps {
    type: NotificationType;
    title?: string;
    duration?: number;
    children: React.ReactNode;
    onClose?: () => void;
}

const getTypeConfig = (type: NotificationType) => {
    switch (type) {
        case 'success':
            return {
                icon: <CheckCircle size={20} />,
                bgColor: 'bg-green-50',
                // borderColor: 'border-[var(--red-toast)]',
                textColor: 'text-[var(--green-toast)]',
                iconColor: 'text-[var(--green-toast)]'
            };
        case 'warning':
            return {
                icon: <AlertTriangle size={20} />,
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-800',
                textColor: 'text-yellow-800',
                iconColor: 'text-yellow-800'
            };
        case 'danger':
            return {
                icon: <XCircle size={20} />,
                bgColor: 'bg-red-50',
                // borderColor: 'border-[var(--red-toast)]',
                textColor: 'text-[var(--red-toast)]',
                iconColor: 'text-[var(--red-toast)]'
            };
        case 'info':
        default:
            return {
                icon: <Info size={20} />,
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-800',
                textColor: 'text-blue-800',
                iconColor: 'text-blue-800'
            };
    }
};

export const Notification: React.FC<NotificationProps> = ({
    type,
    title,
    children,
    // onClose
}) => {
    const { icon, bgColor, borderColor, textColor, iconColor } = getTypeConfig(type);

    return (
        <div className={`flex p-4 mb-4 rounded-lg border ${bgColor} ${borderColor} ${textColor}`}>
            <div className={`flex-shrink-0 ${iconColor}`}>
                {icon}
            </div>
            <div className="ml-3 text-sm font-medium">
                {title && <p className="font-bold mb-1">{title}</p>}
                <div>{children}</div>
            </div>
            {/* {onClose && (
                <button
                    type="button"
                    className={`ml-auto -mx-1.5 -my-1.5 ${bgColor} ${textColor} rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 inline-flex h-8 w-8`}
                    onClick={onClose}
                    aria-label="Close"
                >
                    <span className="sr-only">Close</span>
                    <X size={16} />
                </button>
            )} */}
        </div>
    );
};
