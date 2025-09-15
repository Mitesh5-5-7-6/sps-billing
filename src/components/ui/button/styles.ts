// src/components/ui/button/styles.ts
export const btnBase = `
  inline-flex font-bold transition-colors rounded-md transition-colors
`;

export const btnSizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
};

export const btnVariants = {
    primary: "bg-[var(--white-text)] w-auto px-8 py-3 text-[var(--black-text)] hover:bg-opacity-90",
    secondary: "bg-[var(--orange-bg)] text-[var(--white-text)] hover:bg-[var(--hover-orange)]",
    // ghost: "bg-transparent flex w-fit justify-end text-[var(--white-text)] hover:bg-white/10",
    ghost: "p-2 rounded-md flex w-fit justify-center bg-[var(--primary-bg)] hover:bg-[var(--secondary-bg)] transition-colors",

    eventBtn: "text-[var(--black-text)] w-auto px-2 md:px-4 py-3 bg-[var(--orange-bg)] hover:bg-[var(--hover-orange)]",
    addSeva: "bg-green-600 text-white w-auto hover:bg-green-700 px-8 py-2",
    addMonth: "bg-blue-600 text-white w-auto hover:bg-blue-700 px-4 py-2",
    removeMonth: "bg-red-600 text-white w-auto hover:bg-red-700 px-4 py-2",
};
