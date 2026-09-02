"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// Definisi tipe data untuk event instalasi browser
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Menangkap event dari browser
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Mencegah browser memunculkan prompt bawaan secara otomatis
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true); // Tampilkan tombol kustom kita
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Munculkan prompt instalasi
    await deferredPrompt.prompt();

    // Tunggu respons dari user (apakah menekan "Install" atau "Batal")
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User menerima instalasi PWA");
      setIsVisible(false); // Sembunyikan tombol setelah di-install
    }

    // Reset prompt karena hanya bisa dipanggil sekali
    setDeferredPrompt(null);
  };

  // Jika web belum siap di-install atau sudah di-install, tombol tidak dirender
  if (!isVisible) return null;

  return (
    <Button
      onClick={handleInstallClick}
      className="fixed bottom-8 right-8 z-50 bg-black text-white border-2 border-black px-6 py-3 font-mono text-sm uppercase tracking-widest shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-black transition-all duration-300"
    >
      [+] Install App
    </Button>
  );
}
