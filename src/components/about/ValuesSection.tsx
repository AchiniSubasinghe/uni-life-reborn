"use client";

import { Shield, Users, Lightbulb } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "All listings are verified to ensure students have access to safe and reliable services",
  },
  {
    icon: Users,
    title: "Student First",
    description:
      "Every decision we make prioritizes the needs and wellbeing of our student community",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We continuously improve our platform with new features to better serve students",
  },
];

export default function ValuesSection() {
  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Our Core Values
          </h2>
          <p className="text-xl text-gray-400">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className={`card-hover text-center fade-in-up delay-${(index + 1) * 100}`}
              >
                <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 glow pulse-glow">
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
