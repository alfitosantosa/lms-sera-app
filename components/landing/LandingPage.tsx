import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
import { FinanceSection } from "./FinanceSection";
import { Faq } from "./Faq";
import { CtaSection } from "./CtaSection";
import { Footer } from "./Footer";

/**
 * One page, read top to bottom: the masthead over the register, then what the
 * system records, the three steps that move a record, the money behind it, the
 * questions, and the closing band.
 *
 * Server component on purpose — the interactive parts (navbar sheet, FAQ
 * accordion, CTA routing) declare their own `"use client"`.
 */
export function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-[100dvh] selection:bg-interactive-surface selection:text-foreground antialiased">
      <Navbar />

      <main>
        {/* Masthead, and the register it is about */}
        <Hero />

        {/* The module register: what is recorded, and the tables behind it */}
        <Features />

        {/* Catat, validasi, kirim */}
        <HowItWorks />

        {/* SPP, Midtrans, and branch accounting */}
        <FinanceSection />

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
