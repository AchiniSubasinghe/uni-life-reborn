"use client";

export default function AboutHeroSection() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About <span className="gradient-text">Green StudentHub</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We&apos;re on a mission to make student life easier by connecting
            you with everything you need around campus
          </p>
        </div>
      </div>
    </section>
  );
}
