"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-transparent">
      {/* Animated Blobs */}
      <div className="blob w-96 h-96 bg-teal-500 top-20 -left-48"></div>
      <div
        className="blob w-96 h-96 bg-green-500 bottom-20 -right-48"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="fade-in-left">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Find Everything You Need{" "}
              <span className="gradient-text">Near Campus</span>
            </h1>

            <p className="text-xl text-gray-400 mb-8">
              Discover hostels, restaurants, supermarkets, pharmacies, salons
              and more around NSBM, UoC, and USJP. Save time and money with
              verified listings.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gradient-bg text-white px-8 py-6 rounded-xl font-semibold glow hover:scale-105 transition-all duration-300 group"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="bg-[#070c14]/80 text-gray-200 px-8 py-6 rounded-xl border-2 border-white/10 hover:border-teal-500 hover:text-teal-400 transition-all duration-300 group"
              >
                <Play className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                <span>Watch Demo</span>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="fade-in-up delay-100">
                <div className="text-3xl font-bold gradient-text">50+</div>
                <div className="text-gray-400 text-sm">Verified Places</div>
              </div>
              <div className="fade-in-up delay-200">
                <div className="text-3xl font-bold gradient-text">3</div>
                <div className="text-gray-400 text-sm">Universities</div>
              </div>
              <div className="fade-in-up delay-300">
                <div className="text-3xl font-bold gradient-text">24/7</div>
                <div className="text-gray-400 text-sm">Support</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="fade-in-right relative">
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800"
                alt="Students collaborating"
                width={800}
                height={600}
                className="rounded-2xl shadow-2xl border border-gray-800 hover:scale-[1.02] transition-transform duration-500"
              />
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-[#070c14]/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-white/10 glow fade-in-up delay-400">
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-teal-500 rounded-full border-2 border-gray-800"></div>
                    <div className="w-8 h-8 bg-amber-500 rounded-full border-2 border-gray-800"></div>
                    <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    2.5k+ Students
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}