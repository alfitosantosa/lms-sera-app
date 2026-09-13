"use client";

import * as React from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { SocialProof } from "./SocialProof";
import { Features } from "./Features";
import { Architecture } from "./Architecture";
import { FinanceSection } from "./FinanceSection";
import { Pricing } from "./Pricing";
import { Faq } from "./Faq";
import { CtaSection } from "./CtaSection";
import { Footer } from "./Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* 1. Frosted Navigation Bar */}
      <Navbar />

      <main>
        {/* 2. Hero with Luminous Ambient Gradient & Interactive Preview */}
        <Hero />

        {/* 3. Social Proof & Scale Statistics */}
        <SocialProof />

        {/* 4. Core Features Bento Grid */}
        <Features />

        {/* 5. Deep Navy Multi-Tenant Architecture & RBAC */}
        <Architecture />

        {/* 6. Finance & Midtrans SPP Billing Showcase */}
        <FinanceSection />

        {/* 7. Transparent Tiered Pricing */}
        <Pricing />

        {/* 8. Frequently Asked Questions Accordion */}
        <Faq />

        {/* 9. High-Conversion CTA Band */}
        <CtaSection />
      </main>

      {/* 10. Comprehensive Footer */}
      <Footer />
    </div>
  );
}

export default LandingPage;
