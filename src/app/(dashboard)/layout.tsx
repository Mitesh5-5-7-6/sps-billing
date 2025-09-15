// app/(dashboard)/layout.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Navbar } from '@/components/Layout/Navbar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { status } = useSession();
    const router = useRouter();

    // Initialize sidebar state based on screen size
    useEffect(() => {
        const initializeSidebar = () => {
            setSidebarOpen(window.innerWidth >= 768);
        };

        initializeSidebar();
    }, []);

    // Handle authentication
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768 && sidebarOpen) {
                setSidebarOpen(false);
            } else if (window.innerWidth >= 768 && !sidebarOpen) {
                setSidebarOpen(true);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [sidebarOpen]);

    // Show loading while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--dark-bg)]">
                <div className="text-xl text-[var(--primary-text)]">Loading...</div>
            </div>
        );
    }

    //* Don't render if not authenticated
    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-[var(--bg-color)]">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="flex flex-col flex-1 transition-all duration-300">
                <Navbar />

                <main className="flex-1 -mt-16 ml-16 md:ml-0 md:w-auto p-4 overflow-hidden">
                    <div className="rounded-lg w-full bg-[var(--dark-bg)] shadow-[0_5px_15px_var(--primary-bg)] overflow-hidden">
                        <div className="overflow-y-auto custom-scrollbar">
                            {children}
                        </div>
                    </div>
                </main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-5 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}