"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  ArrowRight,
  Sparkles,
  Building2,
  Shield,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const NAV_LINKS = [
  { label: "Fitur", href: "#fitur" },
  { label: "Arsitektur", href: "#arsitektur" },
  { label: "Keuangan", href: "#keuangan" },
  { label: "Harga", href: "#harga" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavigateSignIn = () => {
    setMobileOpen(false);
    router.push("/auth/sign-in");
  };

  const handleNavigateRegisterFoundation = () => {
    setMobileOpen(false);
    router.push("/auth/sign-in");
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border bg-background/90 shadow-[0_4px_20px_rgba(13,37,61,0.03)] backdrop-blur-md"
          : "border-b border-transparent bg-background/60 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
          <span className="text-[20px] font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            Sera
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            LMS Yayasan
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-secondary-foreground transition-colors duration-200 hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Button
            variant="ghost"
            onClick={handleNavigateSignIn}
            className="text-[14px] font-medium text-secondary-foreground hover:bg-secondary hover:text-foreground"
          >
            Masuk
          </Button>

          <Button
            onClick={handleNavigateRegisterFoundation}
            className="group relative inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-[14px] font-semibold text-white shadow-sm shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md hover:shadow-primary/35 active:translate-y-0 active:bg-primary-active"
          >
            <span>Daftar Yayasan</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        </div>

        {/* Mobile Nav Hamburger */}
        <div className="flex md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-border bg-background/80"
                aria-label="Buka menu navigasi"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-84 p-0 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className="text-lg font-bold text-foreground">
                      Sera
                    </span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      LMS
                    </span>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="px-5 py-6 space-y-1">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px] font-medium text-secondary-foreground transition-colors hover:bg-secondary hover:text-primary"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-50" />
                    </a>
                  ))}
                </div>

                <Separator className="bg-border" />

                {/* Auth Actions */}
                <div className="p-5 space-y-3">
                  <Button
                    onClick={handleNavigateRegisterFoundation}
                    className="w-full justify-center gap-2 rounded-full bg-primary py-5 font-semibold text-white shadow-sm hover:bg-primary-hover"
                  >
                    <span>Daftar Akun Yayasan</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleNavigateSignIn}
                    className="w-full justify-center gap-2 rounded-full border-border py-5 font-medium text-secondary-foreground hover:bg-secondary"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Masuk ke Akun</span>
                  </Button>
                </div>
              </div>

              {/* Drawer Footer info */}
              <div className="border-t border-border bg-secondary p-5 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">
                  PT Santosa Tech Indonesia
                </p>
                <p className="mt-0.5">
                  Sistem Manajemen Sekolah & Multi-Tenant Terpadu
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
