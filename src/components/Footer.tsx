import Link from "next/link";

const links = {
  Platform: [
    { label: "Browse services", href: "/browse" },
    { label: "List your business", href: "/signup?role=provider" },
    { label: "Student sign-up", href: "/signup" },
    { label: "AI Chat (UniBot)", href: "/chat" },
  ],
  Universities: [
    { label: "NSBM Green University", href: "#" },
    { label: "University of Colombo", href: "#" },
    { label: "Uni. of Sri Jayewardenepura", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-xl glass-strong flex items-center justify-center">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              <span className="text-white font-semibold tracking-tight">UniLife</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              Making student life simpler, one campus at a time. Verified services, zero cost.
            </p>
            <a
              href="mailto:support@studenthub.lk"
              className="text-indigo-300/70 text-sm hover:text-indigo-300 transition-colors duration-200"
            >
              support@studenthub.lk
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-4">{group}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/55 text-sm hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-sm">© {new Date().getFullYear()} UniLife. All rights reserved.</p>
          <p className="text-white/25 text-sm">Made with care for students across Sri Lanka ✦</p>
        </div>
      </div>
    </footer>
  );
}
