"use client";

const team = [
  {
    name: "Kasun Silva",
    role: "Co-Founder & CEO",
    university: "NSBM Green University",
    gradient: "from-teal-500 to-amber-600",
  },
  {
    name: "Sanjana Perera",
    role: "Co-Founder & CTO",
    university: "University of Colombo",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    name: "Dineth Fernando",
    role: "Product Manager",
    university: "USJP",
    gradient: "from-orange-500 to-pink-600",
  },
  {
    name: "Amaya Jayasinghe",
    role: "Marketing Lead",
    university: "NSBM Green University",
    gradient: "from-orange-500 to-red-600",
  },
];

export default function TeamSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Meet Our Team</h2>
          <p className="text-xl text-gray-400">
            The passionate students behind StudentHub
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={index}
              className={`card-hover text-center fade-in-up delay-${(index + 1) * 100}`}
            >
              <div
                className={`w-32 h-32 bg-gradient-to-br ${member.gradient} rounded-full mx-auto mb-4 hover:scale-110 transition-transform duration-300`}
              ></div>
              <h3 className="text-xl font-bold text-white mb-1">
                {member.name}
              </h3>
              <p className="text-teal-400 text-sm mb-2">{member.role}</p>
              <p className="text-gray-400 text-sm">{member.university}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
