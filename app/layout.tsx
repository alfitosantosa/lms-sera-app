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

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_CLIENT_NAME} App`,
  description: `Aplikasi portal utama ${process.env.NEXT_PUBLIC_CLIENT_NAME}`,
  manifest: "/manifest.json",
  icons: {
    // Memanggil favicon dari .env dengan fallback ke default
    icon: process.env.CLIENT_FAVICON || "/favicon.ico",
    apple: process.env.CLIENT_APPLE_ICON || "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: `${process.env.NEXT_PUBLIC_CLIENT_NAME} App`,
  },
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
