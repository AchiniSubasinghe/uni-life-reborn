"use client"

import {
  Home,
  ShoppingCart,
  Store,
  Plus,
  Smile,
  SlidersHorizontal,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

const categories = [
  {
    name: "Hostels",
    icon: Home,
    gradient: "from-cyan-950 to-gray-900",
    border: "border-cyan-900/50",
    text: "text-cyan-400",
    iconBg: "from-cyan-500 to-blue-600",
    glow: "shadow-[0_0_25px_rgba(14,165,233,0.5)]",
  },
  {
    name: "Restaurants",
    icon: ShoppingCart,
    gradient: "from-orange-950 to-gray-900",
    border: "border-orange-900/50",
    text: "text-orange-400",
    iconBg: "from-orange-500 to-red-600",
    glow: "shadow-[0_0_25px_rgba(249,115,22,0.5)]",
  },
  {
    name: "Supermarkets",
    icon: Store,
    gradient: "from-green-950 to-gray-900",
    border: "border-green-900/50",
    text: "text-green-400",
    iconBg: "from-green-500 to-emerald-600",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.5)]",
  },
  {
    name: "Pharmacies",
    icon: Plus,
    gradient: "from-blue-950 to-gray-900",
    border: "border-blue-900/50",
    text: "text-blue-400",
    iconBg: "from-blue-500 to-cyan-600",
    glow: "shadow-[0_0_25px_rgba(59,130,246,0.5)]",
  },
  {
    name: "Salons",
    icon: Smile,
    gradient: "from-sky-950 to-gray-900",
    border: "border-sky-900/50",
    text: "text-sky-400",
    iconBg: "from-sky-500 to-pink-600",
    glow: "shadow-[0_0_25px_rgba(6,182,212,0.5)]",
  },
  {
    name: "More Services",
    icon: SlidersHorizontal,
    gradient: "from-blue-950 to-gray-900",
    border: "border-blue-900/50",
    text: "text-blue-400",
    iconBg: "from-blue-500 to-cyan-600",
    glow: "shadow-[0_0_25px_rgba(99,102,241,0.5)]",
  },
]

export default function CategorySection() {
  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            What Are You Looking For?
          </h2>
          <p className="text-lg text-gray-400">
            Find verified places tailored to your needs
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {categories.map((cat, index) => {
            const Icon = cat.icon

            return (
              <motion.div
                key={index}
                className="h-full"
                whileHover={{ scale: 1.05, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  href={`/signup?category=${cat.name.toLowerCase()}`}
                  className="h-full block"
                >
                  <Card
                    className={`group h-full flex flex-col justify-between
                    bg-gradient-to-br ${cat.gradient}
                    border ${cat.border}
                    rounded-2xl cursor-pointer
                    transition-all duration-300
                    hover:shadow-2xl backdrop-blur-xl`}
                  >
                    <CardContent className="p-8 flex flex-col h-full">

                      {/* Top Content */}
                      <div>
                        {/* ICON */}
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${cat.iconBg}
                          rounded-2xl flex items-center justify-center mb-6
                          transition-transform duration-300
                          group-hover:scale-110 ${cat.glow}`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">
                          {cat.name}
                        </h3>

                        <p className="text-gray-400 mb-4">
                          Discover verified {cat.name.toLowerCase()} near campus
                        </p>
                      </div>

                      {/* Bottom Link */}
                      <div className="mt-auto">
                        <span className={`${cat.text} font-semibold`}>
                          Explore →
                        </span>
                      </div>

                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}