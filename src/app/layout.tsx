// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Sora } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";

const sora = Sora({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "SPS Billing Web",
  description: "SPS billing web application for generating customer bills",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sora.className}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
