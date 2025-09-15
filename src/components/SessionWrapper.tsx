// components/SessionWrapper.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";
import { PopupProvider } from "./ui/DialogProvider";
import { ToastContainer } from "./ui";

interface SessionWrapperProps {
    children: ReactNode;
}

export default function SessionWrapper({ children }: SessionWrapperProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 5 * 60 * 1000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <PopupProvider>
                    <SessionProvider>{children}</SessionProvider>
                </PopupProvider>
            </QueryClientProvider>
            <ToastContainer />
        </>
    );
}
