"use client";

import Image from "next/image";

export default function StorySection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="fade-in-left">
            <h2 className="text-4xl font-bold text-white mb-6">Our Story</h2>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Green StudentHub was founded by a group of university students who
              understood the challenges of navigating life around campus.
              Finding reliable hostels, affordable restaurants, and essential
              services shouldn&apos;t be complicated.
            </p>
            <p className="text-gray-400 mb-4 leading-relaxed">
              What started as a simple idea to help fellow students has grown
              into a comprehensive platform serving thousands of students across
              NSBM Green University, University of Colombo, and University of
              Sri Jayewardenepura.
            </p>
            <p className="text-gray-400 leading-relaxed">
              Today, we&apos;re proud to be the trusted platform that helps
              students discover verified hostels, restaurants, supermarkets,
              pharmacies, salons, and more - all within walking distance of
              their campus.
            </p>
          </div>
          <div className="fade-in-right">
            <Image
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800"
              alt="Students"
              width={800}
              height={600}
              className="rounded-2xl shadow-2xl border border-border hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
