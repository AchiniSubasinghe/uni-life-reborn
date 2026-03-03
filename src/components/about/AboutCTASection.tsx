"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutCTASection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 fade-in-up">
          Join Thousands of Happy Students
        </h2>
        <p className="text-xl text-gray-400 mb-8 fade-in-up delay-100">
          Start discovering everything you need around campus today
        </p>
        <div className="flex flex-wrap justify-center gap-4 fade-in-up delay-200">
          <Link href="/signup">
            <Button
              size="lg"
              className="gradient-bg text-white px-10 py-6 rounded-xl font-bold text-lg glow hover:scale-105 transition-all duration-300"
            >
              Get Started Free
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              variant="outline"
              size="lg"
              className="bg-gray-800 text-gray-200 px-10 py-6 rounded-xl font-bold text-lg border-2 border-gray-700 hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300"
            >
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
