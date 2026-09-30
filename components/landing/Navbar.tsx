"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const CLIENT_NAME = process.env.NEXT_PUBLIC_CLIENT_NAME || "Yayasan";

export const NAV_LINKS = [
  { label: "Modul", href: "#fitur" },
  { label: "Arsitektur", href: "#arsitektur" },
  { label: "Keuangan", href: "#keuangan" },
  { label: "Cakupan", href: "#cakupan" },
  { label: "Pertanyaan", href: "#faq" },
];

/**
 * The register's top rule: a constant hairline, not a chrome effect that
 * appears on scroll. Two actions only — masuk, and mendaftarkan yayasan.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const goToRegister = () => {
    setMobileOpen(false);
    router.push("/landing/register/foundation");
  };

  const goToSignIn = () => {
    setMobileOpen(false);
    router.push("/auth/sign-in");
  };

  return (
    <nav className="bg-background/95 border-border sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-display text-foreground text-lg font-semibold tracking-tight">
            LMS
          </span>
          <span className="border-border text-muted-foreground hidden border-l pl-3 text-[11px] sm:inline">
            {CLIENT_NAME}
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-secondary-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" onClick={goToSignIn} className="text-sm">
            Masuk
          </Button>
          <Button onClick={goToRegister} className="text-sm">
            Daftar yayasan
          </Button>
        </div>

        <div className="flex md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                aria-label="Buka menu navigasi"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full flex-col justify-between p-0 sm:w-84"
            >
              <div>
                <div className="border-border flex items-center justify-between border-b px-5 py-4">
                  <span className="font-display text-foreground font-semibold">
                    LMS
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {CLIENT_NAME}
                  </span>
                </div>

                <nav className="flex flex-col py-2">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-secondary-foreground hover:bg-accent hover:text-foreground flex min-h-11 items-center px-5 py-2.5 text-[15px] transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>

                <Separator />

                <div className="space-y-2 p-5">
                  <Button onClick={goToRegister} className="w-full">
                    Daftar yayasan
                  </Button>
                  <Button variant="outline" onClick={goToSignIn} className="w-full">
                    Masuk
                  </Button>
                </div>
              </div>

              <div className="border-border text-muted-foreground border-t p-5 text-xs">
                <p className="text-foreground font-medium">
                  PT Santosa Tech Indonesia
                </p>
                <p className="mt-0.5">
                  Sistem manajemen sekolah multi-cabang untuk yayasan.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
