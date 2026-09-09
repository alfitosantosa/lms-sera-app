import * as React from "react";

export function GradientMesh() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -top-32 z-0 h-[720px] overflow-hidden select-none"
    >
      {/* Stripe-style luminous multi-hue blur orbs */}
      <div className="absolute left-[-5%] top-12 h-[420px] w-[500px] rounded-full bg-[#f5e9d4] opacity-80 blur-[100px]" />
      <div className="absolute left-[15%] top-4 h-[380px] w-[450px] rounded-full bg-[#ffb86c] opacity-35 blur-[110px]" />
      <div className="absolute left-[32%] top-[-20px] h-[460px] w-[540px] rounded-full bg-[#b9b9f9] opacity-60 blur-[110px]" />
      <div className="absolute left-[50%] top-6 h-[500px] w-[560px] rounded-full bg-[#533afd] opacity-35 blur-[120px]" />
      <div className="absolute left-[70%] top-16 h-[440px] w-[480px] rounded-full bg-[#ea2261] opacity-25 blur-[110px]" />
      <div className="absolute left-[85%] top-8 h-[360px] w-[400px] rounded-full bg-[#f96bee] opacity-25 blur-[100px]" />

      {/* Subtle bottom fade to white */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
