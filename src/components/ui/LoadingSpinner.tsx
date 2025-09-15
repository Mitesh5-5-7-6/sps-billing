// components/ui/LoadingSpinner.tsx
"use client";

import React from "react";

interface LoadingSpinnerProps {
    size?: "small" | "medium" | "large";
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "medium",
    className = ""
}) => {
    const sizeClasses = {
        small: "h-6 w-6",
        medium: "h-12 w-12",
        large: "h-16 w-16"
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <div className={`animate-spin rounded-full border-2 border-transparent border-t-[var(--primary-bg)] ${sizeClasses[size]}`} />
        </div>
    );
};

export default LoadingSpinner;