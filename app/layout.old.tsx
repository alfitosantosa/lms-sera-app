import "./globals.css";

import ConditionalLayout from "@/components/ConditionalLayout";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type Metadata, type Viewport } from "next";
import { Inter } from "next/font/google";

import { ReactQueryProvider } from "./client/providers";

// Optimized font loading with next/font
const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
  variable: "--font-inter",
  preload: true,
});

export const metadata: Metadata = {
  title: `Yayasan ${process.env.NEXT_PUBLIC_CLIENT_NAME}`,
  description: "Sistem Informasi Sekolah",
};

// Viewport must be a separate export in Next.js 14+
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Toaster />
        <ReactQueryProvider>
          <TooltipProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
