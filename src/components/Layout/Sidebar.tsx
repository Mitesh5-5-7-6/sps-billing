'use client';

import React from 'react';
import { LayoutDashboard, Building2, LogOut, LucideProps } from 'lucide-react';
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HiOutlineMenuAlt2, HiOutlineMenuAlt3 } from "react-icons/hi";
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route } from 'next';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    path: Route;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const pathname = usePathname();

    const menuItems: MenuItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'product', label: 'Product', icon: Building2, path: '/product' },
    ];

    return (
        <>
            <motion.div
                initial={{ width: isOpen ? 64 : 256 }}
                animate={{ width: isOpen ? 256 : 64 }}
                transition={{ duration: 0.3, type: 'spring', damping: 20 }}
                className="bg-[var(--dark-bg)] text-[var(--primary-text)] min-h-screen fixed md:relative z-20 overflow-hidden"
            >
                {/* Logo & Toggle */}
                <div className={`px-4 flex items-center ${isOpen ? "justify-between" : "justify-center"}`}>
                    {isOpen && (
                        <motion.img
                            src="/logo.png"
                            alt="Logo"
                            width={80}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        />
                    )}
                    <button
                        onClick={toggleSidebar}
                        className={`p-2 cursor-pointer rounded-md bg-[var(--primary-bg)] hover:bg-[var(--secondary-bg)] transition-colors ${isOpen ? "" : "mt-6"}`}
                    >
                        {isOpen ? <HiOutlineMenuAlt3 size={20} /> : <HiOutlineMenuAlt2 size={20} />}
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="mt-6 px-2">
                    <motion.ul
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: {},
                            show: {
                                transition: {
                                    staggerChildren: 0.05,
                                },
                            },
                        }}
                    >
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <motion.li
                                    key={item.id}
                                    variants={{
                                        hidden: { opacity: 0, x: -20 },
                                        show: { opacity: 1, x: 0 },
                                    }}
                                >
                                    <Link
                                        href={item.path}
                                        className={`flex items-center mb-2 px-4 py-3 rounded-md transition-all 
                    ${isOpen ? "justify-start" : "justify-center"} 
                    ${isActive ? "bg-[var(--primary-bg)] text-white" : "hover:bg-[var(--primary-bg)]"}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {isOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                                    </Link>
                                </motion.li>
                            );
                        })}
                    </motion.ul>
                </nav>

                <motion.div
                    className="absolute bottom-8 w-full px-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className={`w-full cursor-pointer flex items-center px-4 py-3 rounded-md 
            ${isOpen ? "justify-start gap-3" : "justify-center"} 
            bg-red-500 hover:bg-red-600 text-white`}
                    >
                        <LogOut className="w-5 h-5" />
                        {isOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </motion.div>

            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/60 z-10 md:hidden"
                        onClick={toggleSidebar}
                    />
                )}
            </AnimatePresence>
        </>
    );
};