import React from "react";
import { btnBase, btnSizes, btnVariants } from "./styles";
import { Loader } from "../Loader";
import cn from "classnames";

export interface ButtonProps {
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    variant?: keyof typeof btnVariants;
    size?: keyof typeof btnSizes;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    ariaLabel?: string;
    children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    type = "button",
    disabled = false,
    isLoading = false,
    loadingText,
    variant = "primary",
    size = "md",
    fullWidth = false,
    icon,
    onClick,
    className,
    ariaLabel,
    children,
}) => {
    const classes = cn(
        btnBase,
        btnSizes[size],
        btnVariants[variant],
        {
            "w-full": fullWidth,
        },
        className
    );

    return (
        <button
            type={type}
            className={`${classes} ${disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
                }`}
            onClick={onClick}
            disabled={isLoading || disabled}
            aria-label={ariaLabel}
        >
            {isLoading ? (
                <div className="flex items-center justify-center mx-auto">
                    <Loader />{" "}
                    <span className="ml-2">{loadingText ?? "Loading…"}</span>
                </div>
            ) : (
                <div className="flex w-full text-center text-sm md:text-md items-center justify-center">
                    {icon && <span className="px-1">{icon}</span>}
                    {children}
                </div>
            )}
        </button>
    );
};
