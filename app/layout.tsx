import "./globals.css";

import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type Metadata, type Viewport } from "next";
import localFont from "next/font/local";

import { ReactQueryProvider } from "./providers";
import { BranchProvider } from "@/context/BranchContext";
import { type ReactNode, Suspense } from "react";

// Self-hosted fonts: build tidak boleh bergantung pada fonts.googleapis.com
// (Docker/CI bisa tanpa jaringan, dan Turbopack gagal saat fetch font).
// Body: DESIGN.md's type system is Inter, exclusively — 400 body, 600 labels,
// 700 display.
const inter = localFont({
  src: "./fonts/inter-variable.woff2",
  weight: "400 700",
  style: "normal",
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
  variable: "--font-inter",
  preload: true,
});

// Data: only inside genuinely technical content (architecture, code).
const plexMono = localFont({
  src: [
    {
      path: "./fonts/ibm-plex-mono-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-mono-500.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-plex-mono",
});

// Arabic script for surah names (`surah_quran.name`, next to `nameLatin`).
const naskh = localFont({
  src: "./fonts/noto-naskh-arabic-400.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-naskh",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_CLIENT_NAME}`,
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
    title: `${process.env.NEXT_PUBLIC_CLIENT_NAME}`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${plexMono.variable} ${naskh.variable}`}
      suppressHydrationWarning
    >
      <body className={inter.className} suppressHydrationWarning>
        <Toaster />
        <ReactQueryProvider>
          <TooltipProvider>
            <Suspense fallback={null}>
              <BranchProvider>
                <ConditionalLayout>{children}</ConditionalLayout>
              </BranchProvider>
            </Suspense>
          </TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
