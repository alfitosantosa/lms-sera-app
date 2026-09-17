"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, ArrowRight, LogIn } from "lucide-react";
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
          ? "border-border bg-background/90 border-b shadow-[0_4px_20px_rgba(13,37,61,0.03)] backdrop-blur-md"
          : "bg-background/60 border-b border-transparent backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
            <span className="bg-primary relative inline-flex h-3 w-3 rounded-full" />
          </span>
          <span className="text-foreground group-hover:text-primary text-[20px] font-bold tracking-tight transition-colors">
            Sera
          </span>
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-semibold">
            LMS Yayasan
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-secondary-foreground hover:text-primary text-[14px] font-medium transition-colors duration-200"
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
            className="text-secondary-foreground hover:bg-secondary hover:text-foreground text-[14px] font-medium"
          >
            Masuk
          </Button>

          <Button
            onClick={handleNavigateRegisterFoundation}
            className="group bg-primary shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/35 active:bg-primary-active relative inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[14px] font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
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
                className="border-border bg-background/80 h-9 w-9 rounded-lg"
                aria-label="Buka menu navigasi"
              >
                <Menu className="text-foreground h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full flex-col justify-between p-0 sm:w-84"
            >
              <div>
                {/* Header */}
                <div className="border-border flex items-center justify-between border-b p-5">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary h-2.5 w-2.5 rounded-full" />
                    <span className="text-foreground text-lg font-bold">
                      Sera
                    </span>
                    <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] font-bold">
                      LMS
                    </span>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1 px-5 py-6">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-secondary-foreground hover:bg-secondary hover:text-primary flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="text-muted-foreground h-4 w-4 opacity-50" />
                    </a>
                  ))}
                </div>

                <Separator className="bg-border" />

                {/* Auth Actions */}
                <div className="space-y-3 p-5">
                  <Button
                    onClick={handleNavigateRegisterFoundation}
                    className="bg-primary hover:bg-primary-hover w-full justify-center gap-2 rounded-full py-5 font-semibold text-white shadow-sm"
                  >
                    <span>Daftar Akun Yayasan</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleNavigateSignIn}
                    className="border-border text-secondary-foreground hover:bg-secondary w-full justify-center gap-2 rounded-full py-5 font-medium"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Masuk ke Akun</span>
                  </Button>
                </div>
              </div>

              {/* Drawer Footer info */}
              <div className="border-border bg-secondary text-muted-foreground border-t p-5 text-xs">
                <p className="text-foreground font-semibold">
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
