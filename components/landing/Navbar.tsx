"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, UserIcon } from "lucide-react";
import { SeraLogo } from "@/components/SeraLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { signOut, useSession } from "@/services/auth/authClients";
import { products } from "@/lib/marketing/products";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { label: "Paket", href: "#paket" },
  { label: "Demo data", href: "#demo" },
  { label: "Fitur", href: "#fitur" },
  { label: "Pertanyaan", href: "#faq" },
];

/**
 * Navigasi utama: logo kiri, menu tengah, aksi kanan — `justify-between`
 * meratakan ketiganya. "Produk" membuka panel berisi sepuluh modul menuju
 * /produk/[slug]; tautan lain meluncur ke anchor (Lenis menanganinya).
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const user = session?.user;
  const initials = (user?.name ?? user?.email ?? "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <nav className="bg-background/85 border-border sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="focus-visible:ring-ring/80 shrink-0 rounded-xl focus-visible:ring-[3px] focus-visible:outline-none"
          aria-label="Sera App — beranda"
        >
          <SeraLogo markClassName="h-8 w-auto" />
        </Link>

        <NavigationMenu viewport={false} className="hidden lg:block">
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-accent/60 focus:bg-accent/60 data-[state=open]:bg-accent/60 h-9 rounded-xl px-3 py-2 text-sm font-medium">
                Produk
              </NavigationMenuTrigger>
              <NavigationMenuContent className="border-border bg-card rounded-3xl border shadow-xl">
                <div className="grid w-[34rem] grid-cols-1 gap-1 p-3 sm:grid-cols-2 lg:w-[40rem]">
                  {products.map((product) => {
                    const Icon = product.icon;
                    return (
                      <NavigationMenuLink asChild key={product.slug}>
                        <Link
                          href={`/produk/${product.slug}`}
                          className="focus-visible:ring-ring/80 hover:bg-accent/60 rounded-2xl p-3 transition-colors focus-visible:ring-[3px] focus-visible:outline-none"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon
                              className="text-primary size-4 shrink-0"
                              aria-hidden
                            />
                            <span className="text-foreground text-sm font-semibold">
                              {product.name}
                            </span>
                          </span>
                          <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                            {product.tagline}
                          </span>
                        </Link>
                      </NavigationMenuLink>
                    );
                  })}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {NAV_LINKS.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <a
                    href={link.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent hover:bg-accent/60 focus:bg-accent/60",
                    )}
                  >
                    {link.label}
                  </a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="focus-visible:ring-ring/80 rounded-full focus-visible:ring-[3px] focus-visible:outline-none"
                  aria-label="Akun Anda"
                >
                  <Avatar className="size-9">
                    <AvatarImage src={user.image ?? undefined} alt="" />
                    <AvatarFallback className="text-xs">
                      {initials || <UserIcon className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {user.name ?? user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Buka dasbor</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>
                  <LogOut className="mr-2 size-4" aria-hidden />
                  Keluar dari akun
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/auth/sign-in">Masuk</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/landing/register/foundation">Daftar yayasan</Link>
              </Button>
            </>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Buka menu"
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="border-border border-b px-5 py-4">
                <SeraLogo markClassName="h-8 w-auto" />
              </div>
              <ul className="max-h-[60vh] overflow-y-auto p-3">
                <li className="text-muted-foreground px-3 pt-2 pb-1 text-xs font-semibold uppercase">
                  Produk
                </li>
                {products.map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/produk/${product.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="text-foreground hover:bg-accent block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                    >
                      {product.name}
                    </Link>
                  </li>
                ))}
                <li className="text-muted-foreground px-3 pt-4 pb-1 text-xs font-semibold uppercase">
                  Halaman
                </li>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-foreground hover:bg-accent block rounded-xl px-3 py-3 text-sm font-medium transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              {!user ? (
                <div className="border-border border-t p-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link
                      href="/auth/sign-in"
                      onClick={() => setMobileOpen(false)}
                    >
                      Masuk
                    </Link>
                  </Button>
                </div>
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
