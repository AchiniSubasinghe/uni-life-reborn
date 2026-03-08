"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  UtensilsCrossed,
  ShoppingCart,
  Pill,
  Scissors,
  GraduationCap,
  Bus,
  Dumbbell,
  Printer,
  Wifi,
  Coffee,
  BookOpen,
} from "lucide-react";

const services = [
  {
    name: "Hostels",
    description:
      "Find affordable and verified accommodation near your university with amenities that suit your needs.",
    icon: Home,
    link: "/hostels",
    gradient: "from-teal-950 to-gray-900",
    border: "border-teal-900/50",
    text: "text-teal-400",
    iconBg: "from-teal-500 to-amber-600",
    glow: "shadow-[0_0_25px_rgba(14,165,233,0.5)]",
    features: ["WiFi", "Meals", "Security"],
  },
  {
    name: "Restaurants",
    description:
      "Discover hygienic restaurants with student-friendly prices and diverse cuisines.",
    icon: UtensilsCrossed,
    link: "/restaurants",
    gradient: "from-orange-950 to-gray-900",
    border: "border-orange-900/50",
    text: "text-orange-400",
    iconBg: "from-orange-500 to-red-600",
    glow: "shadow-[0_0_25px_rgba(249,115,22,0.5)]",
    features: ["Delivery", "Dine-in", "Takeaway"],
  },
  {
    name: "Supermarkets",
    description:
      "Locate grocery stores with essential items and competitive prices near campus.",
    icon: ShoppingCart,
    link: "#",
    gradient: "from-green-950 to-gray-900",
    border: "border-green-900/50",
    text: "text-green-400",
    iconBg: "from-green-500 to-emerald-600",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.5)]",
    features: ["Fresh Produce", "24/7", "Discounts"],
  },
  {
    name: "Pharmacies",
    description:
      "Access medical supplies and healthcare products when you need them most.",
    icon: Pill,
    link: "#",
    gradient: "from-amber-950 to-gray-900",
    border: "border-amber-900/50",
    text: "text-amber-400",
    iconBg: "from-amber-500 to-teal-600",
    glow: "shadow-[0_0_25px_rgba(59,130,246,0.5)]",
    features: ["Prescriptions", "OTC", "Health Tips"],
  },
  {
    name: "Salons",
    description:
      "Book grooming services at nearby salons with student discounts available.",
    icon: Scissors,
    link: "#",
    gradient: "from-orange-950 to-gray-900",
    border: "border-orange-900/50",
    text: "text-orange-400",
    iconBg: "from-orange-500 to-pink-600",
    glow: "shadow-[0_0_25px_rgba(20,184,166,0.5)]",
    features: ["Haircuts", "Spa", "Appointments"],
  },
  {
    name: "Tuition Classes",
    description:
      "Find tutors and coaching centers for academic support in various subjects.",
    icon: GraduationCap,
    link: "#",
    gradient: "from-amber-950 to-gray-900",
    border: "border-amber-900/50",
    text: "text-amber-400",
    iconBg: "from-amber-500 to-teal-600",
    glow: "shadow-[0_0_25px_rgba(99,102,241,0.5)]",
    features: ["1-on-1", "Group", "Online"],
  },
  {
    name: "Transport",
    description:
      "Find reliable transport options including buses, vans, and ride-sharing services.",
    icon: Bus,
    link: "#",
    gradient: "from-teal-950 to-gray-900",
    border: "border-teal-900/50",
    text: "text-teal-400",
    iconBg: "from-teal-500 to-teal-600",
    glow: "shadow-[0_0_25px_rgba(20,184,166,0.5)]",
    features: ["Buses", "Tuk-tuks", "Car Pools"],
  },
  {
    name: "Gyms & Fitness",
    description:
      "Stay fit with nearby gyms and fitness centers offering student memberships.",
    icon: Dumbbell,
    link: "#",
    gradient: "from-red-950 to-gray-900",
    border: "border-red-900/50",
    text: "text-red-400",
    iconBg: "from-red-500 to-orange-600",
    glow: "shadow-[0_0_25px_rgba(239,68,68,0.5)]",
    features: ["Equipment", "Classes", "Trainers"],
  },
  {
    name: "Printing & Stationery",
    description:
      "Get your documents printed and find stationery supplies for your studies.",
    icon: Printer,
    link: "#",
    gradient: "from-amber-950 to-gray-900",
    border: "border-amber-900/50",
    text: "text-amber-400",
    iconBg: "from-amber-500 to-yellow-600",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.5)]",
    features: ["Printing", "Binding", "Supplies"],
  },
  {
    name: "Internet Cafes",
    description:
      "Access high-speed internet and computer services at affordable rates.",
    icon: Wifi,
    link: "#",
    gradient: "from-orange-950 to-gray-900",
    border: "border-orange-900/50",
    text: "text-orange-400",
    iconBg: "from-orange-500 to-amber-600",
    glow: "shadow-[0_0_25px_rgba(14,165,233,0.5)]",
    features: ["Fast WiFi", "Gaming", "Printing"],
  },
  {
    name: "Cafes & Coffee Shops",
    description:
      "Relax and study at cozy cafes with great coffee and comfortable seating.",
    icon: Coffee,
    link: "#",
    gradient: "from-rose-950 to-gray-900",
    border: "border-rose-900/50",
    text: "text-rose-400",
    iconBg: "from-rose-500 to-pink-600",
    glow: "shadow-[0_0_25px_rgba(244,63,94,0.5)]",
    features: ["Coffee", "Snacks", "Study Space"],
  },
  {
    name: "Libraries & Study Spaces",
    description:
      "Find quiet study spaces and libraries for focused academic work.",
    icon: BookOpen,
    link: "#",
    gradient: "from-emerald-950 to-gray-900",
    border: "border-emerald-900/50",
    text: "text-emerald-400",
    iconBg: "from-emerald-500 to-green-600",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.5)]",
    features: ["Books", "WiFi", "Silent Zones"],
  },
];

export default function ServicesCategoriesSection() {
  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            All Services Available
          </h2>
          <p className="text-xl text-gray-400">
            Browse through our comprehensive list of student services
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Link key={index} href={service.link} className="h-full block">
                <Card
                  className={`h-full card-hover bg-gradient-to-br ${service.gradient} border ${service.border} rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-2xl backdrop-blur-xl group`}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${service.iconBg} rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 ${service.glow}`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2">
                      {service.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 flex-grow">
                      {service.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.features.map((feature, fIndex) => (
                        <span
                          key={fIndex}
                          className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Link */}
                    <div className="mt-auto">
                      <span
                        className={`${service.text} font-semibold text-sm group-hover:underline`}
                      >
                        Explore →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
