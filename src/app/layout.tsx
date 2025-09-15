// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Anek_Gujarati, Sora } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";

const sora = Sora({
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SPS Billing Web",
  description: "SPS billing web application for generating customer bills",
  icons: {
    icon: "/Baps_logo.svg.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} font-sans`}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
