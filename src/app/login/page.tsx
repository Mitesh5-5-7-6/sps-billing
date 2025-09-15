// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Notify from "@/utils/notify";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const { status } = useSession();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    const loginMutation = useMutation({
        mutationFn: async (credentials: {
            email: string;
            password: string;
        }) => {
            const result = await signIn("credentials", {
                email: credentials.email,
                password: credentials.password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error("Invalid credentials");
            }

            return result;
        },
        onSuccess: () => {
            router.push("/dashboard");
            Notify("success", "Login successfully!", "Success");
        },
        onError: (error: Error) => {
            Notify("danger", error.message || "Login failed!", "Error");
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--orange-bg)]"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--dark-bg)] px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md rounded-2xl p-8 shadow-2xl bg-[var(--bg-color)]"
            >
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-[var(--white-text)]">
                        Welcome Back
                    </h2>
                    <p className="text-sm text-[var(--primary-text)] mt-1">
                        Sign in to your account
                    </p>
                </div>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[var(--primary-text)]"
                        >
                            Email
                            <span className="text-[var(--danger-text)] font-bold text-lg">
                                *
                            </span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full px-4 py-3 bg-[var(--primary-bg)] text-[var(--white-text)] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder:text-[var(--secondary-text)]"
                            placeholder="example@domain.com"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-[var(--primary-text)]"
                        >
                            Password
                            <span className="text-[var(--danger-text)] font-bold text-lg">
                                *
                            </span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full px-4 py-3 bg-[var(--primary-bg)] text-[var(--white-text)] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-white placeholder:text-[var(--secondary-text)]"
                            placeholder="Enter your password"
                        />
                    </div>
                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        disabled={loginMutation.isPending}
                        className="w-full mt-3 bg-[var(--white-text)] text-[var(--black-text)] hover:bg-gray-200 transition-colors font-medium py-3 rounded-lg disabled:opacity-50"
                    >
                        {loginMutation.isPending ? "Signing in..." : "Sign in"}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}
