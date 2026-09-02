import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const isProduction = process.env.NODE_ENV === "production";

// ============================================================================
// PWA CONFIGURATION
// ============================================================================
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: !isProduction, // Matikan PWA di mode dev agar tidak error cache
});

// ============================================================================
// NEXT.JS CONFIGURATION
// ============================================================================
const nextConfig: NextConfig = {
  // --- CORE ---
  reactStrictMode: true,

  // Hanya aktifkan standalone/export saat build production
  ...(isProduction && {
    output: "standalone", // Menghasilkan folder 'out' saat di-build
    // images: { unoptimized: true }, // Diperlukan untuk static export
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "lh3.googleusercontent.com",
        },
        {
          protocol: "https",
          hostname: "icons.veryicon.com",
        },
        {
          protocol: "https",
          hostname: "file.pasarjaya.cloud",
        },
        {
          protocol: "https",
          hostname: "file.santosatechid.cloud",
        },
      ],

      formats: ["image/avif", "image/webp"],

      dangerouslyAllowSVG: true,

      minimumCacheTTL: isProduction ? 86400 : 0,

      // Loader configuration untuk bypass private IP check
      loader: "default",

      // Disable image optimization untuk domain yang resolve ke private IP
      // Ini aman karena hanya berlaku untuk external images, bukan Next.js Image component
      unoptimized: process.env.BYPASS_IMAGE_OPTIMIZATION === "true",
    },
  }),

  // --- EXPERIMENTAL & COMPILER ---
  experimental: {
    authInterrupts: true,
    globalNotFound: true,

    // Fitur eksperimental khusus production
    ...(isProduction && {
      optimizePackageImports: ["lucide-react", "date-fns", "recharts", "@tanstack/react-query", "@tanstack/react-table"],
      serverActions: {
        bodySizeLimit: "2mb",
      },
    }),
  },
  // Fitur compiler khusus production
  compiler: {
    ...(isProduction && {
      removeConsole: {
        exclude: ["error", "warn"],
      },
    }),
  },

  // --- IMAGES (Commented Out) ---

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "icons.veryicon.com" },
      { protocol: "https", hostname: "file.pasarjaya.cloud" },
      { protocol: "https", hostname: "file.santosatechid.cloud" },
    ],
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    minimumCacheTTL: isProduction ? 86400 : 0,
    loader: "default",
    unoptimized: process.env.BYPASS_IMAGE_OPTIMIZATION === "true",
  },

  // --- HEADERS ---
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // --- GENERAL ---
  compress: isProduction,
  poweredByHeader: true,
  generateEtags: isProduction,
};

// Export config yang sudah dibungkus PWA
export default withPWA(nextConfig);
