"use client";

import { Search, Filter, Star, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search",
    description:
      "Browse through our extensive database of verified services near your campus.",
    number: "01",
  },
  {
    icon: Filter,
    title: "Filter & Compare",
    description:
      "Use filters to narrow down options and compare prices, ratings, and features.",
    number: "02",
  },
  {
    icon: Star,
    title: "Choose the Best",
    description:
      "Select the service that best fits your needs based on reviews and ratings.",
    number: "03",
  },
  {
    icon: MessageSquare,
    title: "Connect & Book",
    description:
      "Get in touch with service providers and make bookings directly through our platform.",
    number: "04",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-xl text-gray-400">
            Finding services has never been easier
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`relative text-center fade-in-up delay-${(index + 1) * 100}`}
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-cyan-500 to-green-500 opacity-30"></div>
                )}

                {/* Step Number */}
                <div className="absolute -top-2 -left-2 w-8 h-8 gradient-bg rounded-full flex items-center justify-center text-white text-sm font-bold glow">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 glow hover:scale-110 transition-transform duration-300">
                  <Icon className="w-10 h-10 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
