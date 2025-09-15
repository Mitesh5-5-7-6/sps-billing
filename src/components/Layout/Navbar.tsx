import React from "react";

export const Navbar: React.FC = () => {

    return (
        <header className="bg-[var(--white-bg)] h-28 flex rounded-bl-4xl rounded-br-4xl justify-between">
            <div className="flex items-center"></div>
            <div className="flex items-start my-4 mx-4">
                <h2 className="text-2xl text-[var(--gray-text)] font-semibold">
                    Admin
                </h2>
            </div>
        </header>
    );
};