"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Hiruni Perera",
    university: "NSBM Green University",
    initials: "HP",
    rating: 5,
    review:
      "Found an amazing hostel just 5 minutes from campus within minutes of signing up. The verified listings gave me so much peace of mind as a first-year student.",
    service: "Hostels",
  },
  {
    name: "Kasun Silva",
    university: "University of Colombo",
    initials: "KS",
    rating: 5,
    review:
      "As someone who didn't know Colombo at all, finding affordable restaurants was my biggest stress. UniLife solved that on day one. Absolute game changer.",
    service: "Restaurants",
  },
  {
    name: "Sanduni Fernando",
    university: "University of Sri Jayewardenepura",
    initials: "SF",
    rating: 5,
    review:
      "Had a minor medical emergency and needed a pharmacy late at night. Found one nearby in seconds. I always keep UniLife bookmarked now.",
    service: "Pharmacies",
  },
  {
    name: "Ravindu Jayasinghe",
    university: "NSBM Green University",
    initials: "RJ",
    rating: 5,
    review:
      "The platform is super clean and fast. Everything is well organized by category and I love that the listings are actually verified — no outdated info.",
    service: "General",
  },
  {
    name: "Amali Wickramasinghe",
    university: "University of Colombo",
    initials: "AW",
    rating: 5,
    review:
      "I use it every week to check prices at nearby supermarkets before I go shopping. It has literally saved me money every single month.",
    service: "Supermarkets",
  },
  {
    name: "Thisara Peris",
    university: "University of Sri Jayewardenepura",
    initials: "TP",
    rating: 4,
    review:
      "Found a great salon near campus with fair prices. The reviews from other students helped me decide quickly. Would love to see more categories added soon!",
    service: "Salons",
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? "text-amber-300 fill-amber-300" : "text-white/20"}`}
        />
      ))}
    </div>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function PeopleSection() {
  return (
    <section id="people" className="relative py-28 px-6 overflow-hidden">
      {/* orb */}
      <div className="orb w-[500px] h-[500px] bg-blue-700 top-0 right-[-5%]" style={{ opacity: 0.1 }} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-blue-300 text-sm font-medium tracking-widest uppercase mb-3">People</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What students are saying</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Hear from real students who use UniLife every day across Sri Lankan universities.
          </p>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {reviews.map((r) => (
            <motion.div
              key={r.name}
              variants={item}
              className="glass glass-sheen rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/[0.07] transition-all duration-300 hover:scale-[1.01]"
            >
              {/* Quote icon */}
              <Quote className="w-6 h-6 text-blue-300/60 flex-shrink-0" />

              {/* Review text */}
              <p className="text-white/65 text-sm leading-relaxed flex-1">"{r.review}"</p>

              {/* Service badge */}
              <div className="inline-flex self-start">
                <span className="glass rounded-full px-3 py-1 text-xs text-blue-300 font-medium">
                  {r.service}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/8" />

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full glass-strong flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {r.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{r.name}</div>
                  <div className="text-white/40 text-xs truncate">{r.university}</div>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <StarRow rating={r.rating} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
