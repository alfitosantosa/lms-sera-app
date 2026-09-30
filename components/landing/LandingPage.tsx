import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { SocialProof } from "./SocialProof";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
import { Architecture } from "./Architecture";
import { FinanceSection } from "./FinanceSection";
import { Pricing } from "./Pricing";
import { Faq } from "./Faq";
import { CtaSection } from "./CtaSection";
import { Footer } from "./Footer";

/**
 * The page reads as one register, top to bottom: masthead, the sheet, the
 * structure it runs on, the modules it records, then the closing band.
 *
 * Server component on purpose — the interactive parts (navbar sheet, finance
 * and CTA routing, FAQ accordion) declare their own `"use client"`.
 */
export function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-[100dvh] selection:bg-brand-tint selection:text-foreground antialiased">
      <Navbar />

      <main>
        {/* Masthead and the live register */}
        <Hero />

        {/* One yayasan, three cabang */}
        <SocialProof />

        {/* The module register: what is recorded, and the tables behind it */}
        <Features />

        {/* Catat, validasi, kirim */}
        <HowItWorks />

        {/* Foundation / Branch isolation, inverse band */}
        <Architecture />

        {/* SPP, Midtrans, and branch accounting */}
        <FinanceSection />

        {/* Cakupan modul */}
        <Pricing />

        {/* Pertanyaan yang biasanya muncul */}
        <Faq />

        {/* Closing band */}
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}

export default LandingPage;
