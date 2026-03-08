"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Our Location",
    details: ["NSBM Green University", "Pitipana, Homagama", "Sri Lanka"],
    gradient: "from-teal-500 to-amber-600",
    glow: "shadow-[0_0_25px_rgba(14,165,233,0.5)]",
  },
  {
    icon: Phone,
    title: "Phone Number",
    details: ["+94 11 544 5000", "+94 76 123 4567"],
    gradient: "from-green-500 to-emerald-600",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.5)]",
  },
  {
    icon: Mail,
    title: "Email Address",
    details: ["support@studenthub.lk", "info@studenthub.lk"],
    gradient: "from-orange-500 to-teal-600",
    glow: "shadow-[0_0_25px_rgba(20,184,166,0.5)]",
  },
  {
    icon: Clock,
    title: "Working Hours",
    details: ["Monday - Friday: 9AM - 6PM", "Saturday: 9AM - 1PM"],
    gradient: "from-orange-500 to-red-600",
    glow: "shadow-[0_0_25px_rgba(249,115,22,0.5)]",
  },
];

export default function ContactInfoSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Other Ways to Reach Us
          </h2>
          <p className="text-xl text-gray-400">
            Choose the method that works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <Card
                key={index}
                className={`card-hover bg-background border-border rounded-2xl fade-in-up delay-${(index + 1) * 100}`}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${info.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 ${info.glow} hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {info.title}
                  </h3>
                  <div className="space-y-1">
                    {info.details.map((detail, dIndex) => (
                      <p key={dIndex} className="text-gray-400">
                        {detail}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
