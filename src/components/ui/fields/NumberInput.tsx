import React from 'react';
import { Field, ErrorMessage, useField } from 'formik';

interface NumberInputProps {
    label: string;
    name: string;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
    value?: number | string;
    ref?: React.Ref<HTMLInputElement>;
    required?: boolean;
    disabled?: boolean
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, name, placeholder, ref,
    className = "",
    readOnly = false, required = false, disabled = false, ...props }) => {
    const [field, meta] = useField(name);
    const hasError = meta.touched && meta.error;

    return (
        <div className='mb-4 text-[var(--secondary-text)]'>
            <label
                htmlFor={name}
                className="text-sm mb-1 block font-medium text-[var(--primary-text)]"
            >
                {label}
                {required && <span className="text-[var(--danger-text)] ml-1">*</span>}
            </label>
            <Field
                id={name}
                ref={ref}
                disabled={disabled}
                type='number'
                onWheel={(e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur()}
                placeholder={placeholder}
                className={`w-full px-4 py-2 ${disabled ? 'bg-[var(--primary-bg)]' : ''} border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--focus-color)]
        ${hasError ? 'text-[var(--danger-text)] focus:ring-[var(--danger-text)]' : 'border-[var(--gray-text)] focus:ring-[var(--focus-color)]'}
        [&::-webkit-outer-spin-button]:appearance-none
        [&::-webkit-inner-spin-button]:appearance-none
        [&::-webkit-outer-spin-button]:m-0
        [&::-webkit-inner-spin-button]:m-0
        [appearance:textfield]` + className}
                {...field}
                readOnly={readOnly}
                required={required}
                {...props}
            />
            <ErrorMessage
                name={name}
                component="div"
                className="mt-1 text-sm text-[var(--danger-text)]"
            />
        </div>
    );
};