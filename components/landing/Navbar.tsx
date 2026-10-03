"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, Menu, UserIcon } from "lucide-react";
import { SeraLogo } from "@/components/SeraLogo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { signOut, useSession } from "@/lib/authClients";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu } from "radix-ui";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Image from "next/image";

export const NAV_LINKS = [
  { label: "Modul", href: "#fitur" },
  { label: "Cara kerja", href: "#cara-kerja" },
  { label: "Keuangan", href: "#keuangan" },
  { label: "Pertanyaan", href: "#faq" },
];

/**
 * The register's top rule: a constant hairline, not a chrome effect that
 * appears on scroll. Two actions only — masuk, and mendaftarkan yayasan.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const goToSignIn = () => {
    setMobileOpen(false);
    router.push("/auth/sign-in");
  };

  const handleSignOut = () => {
    await signOut();
    router.refresh();
    router.push("/");
  }

  const session = useSession();

  console.log("session", session);

  return (
    <nav className="bg-background/95 border-border sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3.5">
        <Link
          href="/"
          className="focus-visible:ring-ring/80 rounded-2xl focus-visible:ring-[3px] focus-visible:outline-none"
        >
          <SeraLogo markClassName="h-8 w-auto" />
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
          <Button onClick={goToSignIn} className="text-sm">
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
                  <SeraLogo markClassName="h-7 w-auto" />
                </div>

                <nav className="flex flex-col py-2">
                  {NAV_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-secondary-foreground hover:bg-accent hover:text-foreground flex min-h-11 items-center px-5 py-2.5 text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>

                <Separator />
                {session.data?.user ? (
             <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group hover:border-border hover:bg-secondary flex w-full items-center gap-2.5 rounded-2xl border border-transparent p-2 text-left transition-all">
              <Avatar className="border-border bg-brand-tint text-primary h-8 w-8 rounded-full border">
                {userData?.avatarUrl && (
                  <Image
                    width={32}
                    height={32}
                    src={userData.avatarUrl}
                    alt={userData.name || "User"}
                    className="rounded-full object-cover"
                  />
                )}
                <AvatarFallback className="bg-brand-tint text-primary text-[11px] font-bold">
                  {getUserInitials(userData?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-foreground truncate text-xs font-bold">
                  {userData?.name || "Pengguna"}
                </span>
                <span className="text-muted-foreground truncate text-[10px] capitalize">
                  {userData?.role?.name || "Pengguna"}
                </span>
              </div>

              <ChevronRight className="text-muted-foreground h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="right"
            className="border-border w-56 rounded-3xl p-1.5 shadow-lg"
          >
            <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs">
              <div>Akun Terhubung</div>
              <div className="text-foreground truncate font-bold">
                {session?.user?.email || "user@sekolah.com"}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              onClick={() => router.push("/dashboard/profile")}
              className="text-secondary-foreground hover:bg-secondary hover:text-primary cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium"
            >
              <UserIcon className="text-primary mr-2 h-4 w-4" />
              <span>Profil Pengguna</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive hover:bg-destructive-chip cursor-pointer rounded-lg px-2.5 py-2 text-xs font-medium"
            >
              <LogOut className="text-destructive mr-2 h-4 w-4" />
              <span>Keluar dari Akun</span>
            </DropdownMenuItem>
                ) : (
                  <div className="space-y-2 p-5">
                    <Button onClick={goToSignIn} className="w-full">
                      Daftar yayasan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={goToSignIn}
                      className="w-full"
                    >
                      Masuk
                    </Button>
                  </div>
                )}
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
