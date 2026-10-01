import "./globals.css";

import ConditionalLayout from "@/components/ConditionalLayout";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { type Metadata, type Viewport } from "next";
import {
  IBM_Plex_Mono,
  Inter,
  Noto_Naskh_Arabic,
} from "next/font/google";

import { ReactQueryProvider } from "./client/providers";
import { BranchProvider } from "./(context)/BranchContext";
import { ReactNode, Suspense } from "react";

// Optimized font loading with next/font.
// Body: DESIGN.md's type system is Inter, exclusively — 400 body, 600 labels,
// 700 display.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
  variable: "--font-inter",
  preload: true,
});

// Data: only inside genuinely technical content (architecture, code).
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

// Arabic script for surah names (`surah_quran.name`, next to `nameLatin`).
const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400"],
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
