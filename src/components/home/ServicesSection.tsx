"use client";

import Link from "next/link";
import { Home, ShoppingCart, Store, Plus, Smile, SlidersHorizontal, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Hostels",
    description: "Find safe, affordable accommodation close to campus.",
    icon: Home,
    accent: "text-amber-300",
  },
  {
    name: "Restaurants",
    description: "Discover budget-friendly meals and local eateries nearby.",
    icon: ShoppingCart,
    accent: "text-teal-300",
  },
  {
    name: "Supermarkets",
    description: "Stock up on essentials without going far from uni.",
    icon: Store,
    accent: "text-amber-300",
  },
  {
    name: "Pharmacies",
    description: "Access healthcare products whenever you need them.",
    icon: Plus,
    accent: "text-orange-300",
  },
  {
    name: "Salons",
    description: "Look your best with trusted salons near your university.",
    icon: Smile,
    accent: "text-orange-300",
  },
  {
    name: "More Services",
    description: "Browse all categories from stationery to laundry.",
    icon: SlidersHorizontal,
    accent: "text-slate-300",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ServicesSection() {
  return (
    <section id="services" className="relative py-28 px-6 overflow-hidden">
      {/* Orb */}
      <div className="orb w-[400px] h-[400px] bg-amber-600 top-1/2 right-[-5%]" style={{ opacity: 0.08 }} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-amber-300 text-sm font-medium tracking-widest uppercase mb-3">Services</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What are you looking for?</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Everything a student needs, organised and verified for you.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.name} variants={item}>
                <Link
                  href={`/signup?category=${cat.name.toLowerCase()}`}
                  className="group block glass glass-sheen rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(217,119,6,0.18)]"
                >
                  <div className={`w-10 h-10 rounded-xl glass flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${cat.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-1">{cat.name}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{cat.description}</p>
                  <div className={`mt-4 flex items-center gap-1 text-xs font-medium ${cat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
