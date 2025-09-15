import React, { forwardRef } from "react";
import { Field, ErrorMessage, useField } from "formik";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    name: string;
    required?: boolean;
    className?: string;
    disabled?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    name,
    required = false,
    className = "",
    disabled = false,
    ...props
}, ref) => {
    const [field, meta] = useField(name);
    const hasError = meta.touched && meta.error;

    return (
        <div className="w-full mb-4 text-[var(--secondary-text)]">
            {label && (
                <label
                    htmlFor={name}
                    className="text-sm mb-1 block font-medium text-[var(--primary-text)]"
                >
                    {label}
                    {required && <span className="text-[var(--danger-text)] ml-1">*</span>}
                </label>
            )}

            <Field
                id={name}
                {...field}
                {...props}
                innerRef={ref}
                disabled={disabled}
                className={`w-full px-4 py-2 border rounded-md transition focus:outline-none focus:ring-2 
                    ${disabled ? 'bg-[var(--primary-bg)]' : ''}
                    ${hasError ? "text-[var(--danger-text)] focus:ring-[var(--danger-text)]" : "border-[var(--gray-text)] focus:ring-[var(--focus-color)]"} 
                    ${className}`}
                required={required}
            />

            <ErrorMessage
                name={name}
                component="div"
                className="mt-1 text-sm text-[var(--danger-text)]"
            />
        </div>
    );
});

Input.displayName = "Input";