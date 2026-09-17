import * as React from "react";

export function GradientMesh() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -top-32 z-0 h-[720px] overflow-hidden select-none"
    >
      {/* Stripe-style luminous multi-hue blur orbs */}
      <div className="absolute top-12 left-[-5%] h-[420px] w-[500px] rounded-full bg-[#f5e9d4] opacity-80 blur-[100px]" />
      <div className="absolute top-4 left-[15%] h-[380px] w-[450px] rounded-full bg-[#ffb86c] opacity-35 blur-[110px]" />
      <div className="absolute top-[-20px] left-[32%] h-[460px] w-[540px] rounded-full bg-[#b9b9f9] opacity-60 blur-[110px]" />
      <div className="absolute top-6 left-[50%] h-[500px] w-[560px] rounded-full bg-[#533afd] opacity-35 blur-[120px]" />
      <div className="absolute top-16 left-[70%] h-[440px] w-[480px] rounded-full bg-[#ea2261] opacity-25 blur-[110px]" />
      <div className="absolute top-8 left-[85%] h-[360px] w-[400px] rounded-full bg-[#f96bee] opacity-25 blur-[100px]" />

      {/* Subtle bottom fade to white */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
