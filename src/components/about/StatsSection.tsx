"use client";

const stats = [
  { value: "2,500+", label: "Active Students" },
  { value: "500+", label: "Verified Listings" },
  { value: "3", label: "Universities" },
  { value: "10,000+", label: "Bookings Made" },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
          <p className="text-xl text-gray-400">Numbers that tell our story</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center card-hover fade-in-up delay-${(index + 1) * 100}`}
            >
              <div className="text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
