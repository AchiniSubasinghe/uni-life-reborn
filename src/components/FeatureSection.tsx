"use client";

import Image from "next/image";
import { CheckCircle, Clock, MapPin } from "lucide-react";

const features = [
  {
    icon: CheckCircle,
    title: "Verified Listings",
    description:
      "All hostels and businesses are verified for your safety and reliability.",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description:
      "Get live information about availability, prices, and opening hours.",
  },
  {
    icon: MapPin,
    title: "Location-Based Search",
    description:
      "Find places nearest to your university with interactive maps.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="fade-in-left">
            <h2 className="text-4xl font-bold text-white mb-6">
              Why Choose StudentHub?
            </h2>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-start space-x-4 fade-in-up delay-${(index + 1) * 100}`}
                  >
                    <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center flex-shrink-0 glow">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Content - Image */}
          <div className="relative fade-in-right">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
              alt="Students Collaboration"
              width={800}
              height={600}
              className="rounded-2xl shadow-2xl border border-gray-800 hover:scale-[1.02] transition-transform duration-500"
            />
            {/* Floating Stats Card */}
            <div className="absolute -top-6 -right-6 bg-[#070c14]/90 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-white/10 glow pulse-glow">
              <div className="flex items-center space-x-2">
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
    </section>
  );
}
