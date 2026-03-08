"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-20"
    >
      {/* Background photo */}
      <Image
        src="/images/hero-bg.jpeg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        style={{ zIndex: 0 }}
      />

      {/* Primary dark vignette — keeps text readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(14,10,4,0.88) 0%, rgba(14,10,4,0.68) 45%, rgba(14,10,4,0.94) 100%)",
        }}
      />

      {/* Subtle warm-amber radial bloom at top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background:
            "radial-gradient(ellipse 65% 45% at 50% 0%, rgba(217,119,6,0.13) 0%, transparent 65%)",
        }}
      />

      {/* All content above overlays */}
      <div className="relative flex flex-col items-center w-full" style={{ zIndex: 3 }}>
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass glass-sheen rounded-full px-5 py-2 mb-8 flex items-center gap-2 text-sm text-white/70"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight max-w-5xl"
        >
          Everything you need,{" "}
          <span className="gradient-text">near campus</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-center text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed"
        >
          First-year university students in Sri Lanka arrive on campus with no idea where to find
          safe housing, affordable food, or essential services. UniLife fixes that — a verified
          directory, AI-powered search, and a growing community, all for free.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 bg-amber-500 text-black font-semibold px-7 py-3.5 rounded-full hover:bg-amber-400 transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(217,119,6,0.45)]"
          >
            Get started free
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/chat"
            className="group inline-flex items-center gap-2 glass glass-sheen rounded-full px-7 py-3.5 text-white font-medium hover:bg-white/10 transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4 text-amber-300" />
            Chat with UniBot
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-6 md:gap-12"
        >
          {[
            { value: "50+", label: "Verified businesses" },
            { value: "3", label: "Universities covered" },
            { value: "2,500+", label: "Active students" },
            { value: "24/7", label: "AI support" },
          ].map((stat) => (
            <div key={stat.label} className="glass glass-sheen rounded-2xl px-6 py-4 text-center min-w-[110px]">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 text-xs"
        style={{ zIndex: 3 }}
      >
        <span>scroll down</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
        />
      </motion.div>
    </section>
  );
}
