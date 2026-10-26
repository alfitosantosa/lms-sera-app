import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/services/auth/auth";

/**
 * Penjaga rute pendaftaran yayasan: tanpa sesi login, pengunjung diarahkan ke
 * halaman masuk dulu. Pengecekan di server, jadi form tidak sempat berkedip.
 */
export default async function FoundationRegisterLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");
  return children;
}
