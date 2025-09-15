import Select, { SingleValue } from "react-select";
import { ErrorMessage, useField } from "formik";

export interface OptionType {
    value: string | number;
    label: string;
}

interface DropdownProps<T extends Record<string, string | number>> { label: string; name: string; enumObj?: T; dynamicOptions?: { label: string; value: string | number }[]; placeholder?: string; className?: string; options?: { labelTransform?: (key: string) => string; valueTransform?: (key: string) => string | number; }; required?: boolean; disabled?: boolean; onChange?: (option: SingleValue<OptionType>) => void }

export function enumToOptions<T extends Record<string, string | number>>(enumObj?: T, options?: { labelTransform?: (key: string) => string; valueTransform?: (key: string) => string | number; }): { value: string | number; label: string }[] { const defaultLabelTransform = (key: string) => key.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" "); const defaultValueTransform = (key: string) => key; const labelTransform = options?.labelTransform || defaultLabelTransform; const valueTransform = options?.valueTransform || defaultValueTransform; return Object.keys(enumObj ?? '').filter((key) => isNaN(Number(key))).map((key) => ({ value: valueTransform(key), label: labelTransform(key), })); }

export function DropDown<T extends Record<string, string | number>>({
    label,
    name,
    enumObj,
    dynamicOptions,
    placeholder,
    className,
    options,
    required = false,
    disabled = false,
    onChange
}: DropdownProps<T>) {
    const [field, meta, helpers] = useField(name);
    const hasError = meta.touched && meta.error;

    const dropdownOptions = dynamicOptions ?? enumToOptions(enumObj, options);

    const handleChange = (selected: SingleValue<OptionType>) => {
        helpers.setValue(selected?.value || "");
        if (onChange) onChange(selected); // forward event
    }

    const selectedValue = dropdownOptions.find(
        (opt) => opt.value === field.value
    );

    return (
        <div className={`flex flex-col ${className}`}>
            <label
                htmlFor={name}
                className="text-sm block mb-1 font-light md:font-medium text-[var(--primary-text)]"
            >
                {label}
                {required && (
                    <span className="text-[var(--danger-text)] ml-1">*</span>
                )}
            </label>
            <Select
                inputId={name}
                options={dropdownOptions}
                placeholder={placeholder || "Select product"}
                value={selectedValue || null}
                onChange={handleChange}
                isDisabled={disabled}
                classNamePrefix="react-select"
                styles={{
                    control: (base, state) => ({
                        ...base,
                        backgroundColor: "var(--dark-bg, #1b2230)",
                        borderColor: hasError
                            ? "var(--gray-text, #ff4d4f)"
                            : state.isFocused
                                ? "var(--bg-color, #2563eb)"
                                : "var(--gray-text, #444)",
                        boxShadow: "none",
                        borderRadius: "6px",
                        padding: "2px 4px",
                        minHeight: "42px",
                        color: "var(--primary-text, #fff)",
                        "&:hover": {
                            borderColor: state.isFocused
                                ? "var(--primary-text, #2563eb)"
                                : "var(--gray-text, #666)",
                        },
                    }),
                    menu: (base) => ({
                        ...base,
                        backgroundColor: "var(--bg-color, #1b2230)",
                        borderRadius: "6px",
                        marginTop: 2,
                        zIndex: 50,
                        maxHeight: 1000,
                        overflowY: "auto",
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                            ? "var(--primary-bg, #2563eb)"
                            : state.isFocused
                                ? "var(--dark-bg, #333)"
                                : "transparent",
                        color: state.isSelected
                            ? "var(--orange-text, #fff)"
                            : "var(--primary-text, #ddd)",
                        cursor: "pointer",
                        padding: "10px 12px",
                        fontSize: "14px",
                    }),
                    singleValue: (base) => ({
                        ...base,
                        color: "var(--secondary-text, #fff)",
                    }),
                    placeholder: (base) => ({
                        ...base,
                        color: "var(--gray-text, #888)",
                    }),
                    dropdownIndicator: (base) => ({
                        ...base,
                        color: "var(--gray-text, #aaa)",
                        "&:hover": { color: "var(--dark-text, #2563eb)" },
                    }),
                    indicatorSeparator: () => ({ display: "none" }),
                }}
                // menuPlacement="auto" // auto decide open direction
                menuPosition="fixed" // prevent container clipping
            />


            <ErrorMessage
                name={name}
                component="div"
                className="mt-1 text-sm text-[var(--danger-text)]"
            />
        </div>
    );
}
