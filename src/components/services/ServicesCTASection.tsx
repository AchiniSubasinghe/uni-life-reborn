"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ServicesCTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-bg opacity-90"></div>

      {/* Animated Blobs */}
      <div className="blob w-96 h-96 bg-blue-400 top-10 left-20"></div>
      <div
        className="blob w-96 h-96 bg-green-400 bottom-10 right-20"
        style={{ animationDelay: "3s" }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight fade-in-up">
          Can&apos;t Find What You&apos;re Looking For?
        </h2>

        <p className="text-xl text-white/90 mb-10 fade-in-up delay-100">
          Let us know what services you need, and we&apos;ll work on adding them
          to our platform.
        </p>

        <div className="flex flex-wrap justify-center gap-4 fade-in-up delay-200">
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-white text-cyan-600 px-10 py-6 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Request a Service
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent text-white border-2 border-white px-10 py-6 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Join as Provider
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
