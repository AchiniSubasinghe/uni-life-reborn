"use client";

export default function ContactHeroSection() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-gray-900 to-gray-950 relative overflow-hidden">
      {/* Animated Blobs */}
      <div className="blob w-96 h-96 bg-teal-500 top-10 -left-48"></div>
      <div
        className="blob w-96 h-96 bg-green-500 bottom-10 -right-48"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Have questions or feedback? We&apos;d love to hear from you. Reach
            out to us and we&apos;ll get back to you as soon as possible.
          </p>
        </div>
      </div>
    </section>
  );
}
