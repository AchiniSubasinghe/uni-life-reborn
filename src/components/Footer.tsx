import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "How It Works", href: "#" },
  { name: "FAQ", href: "#" },
  { name: "Contact Us", href: "/contact" },
  { name: "Blog", href: "#" },
];

const categories = [
  { name: "Hostels", href: "/hostels" },
  { name: "Restaurants", href: "/restaurants" },
  { name: "Supermarkets", href: "#" },
  { name: "Pharmacies", href: "#" },
  { name: "Salons", href: "#" },
  { name: "All Services", href: "/services" },
];

const universities = [
  { name: "NSBM Green University", href: "#" },
  { name: "University of Colombo", href: "#" },
  { name: "USJP Sri Jayewardenepura", href: "#" },
];

const socialLinks = [
  { icon: Facebook, href: "#", hoverColor: "hover:bg-cyan-600" },
  { icon: Twitter, href: "#", hoverColor: "hover:bg-cyan-600" },
  { icon: Instagram, href: "#", hoverColor: "hover:bg-green-600" },
  { icon: Youtube, href: "#", hoverColor: "hover:bg-red-600" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center glow transition-transform duration-300 group-hover:scale-110">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold">Green StudentHub</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Making student life easier, one click at a time. Your complete
              guide to everything around campus.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center ${social.hoverColor} transition-all duration-300 border border-gray-700 hover:scale-110`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="hover:text-cyan-400 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              {categories.map((category, index) => (
                <li key={index}>
                  <Link
                    href={category.href}
                    className="hover:text-cyan-400 transition-colors duration-300"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Universities & Legal */}
          <div>
            <h4 className="font-bold mb-4 text-white text-lg">Universities</h4>
            <ul className="space-y-2 text-gray-400 mb-6">
              {universities.map((uni, index) => (
                <li key={index}>
                  <Link
                    href={uni.href}
                    className="hover:text-cyan-400 transition-colors duration-300"
                  >
                    {uni.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-bold mb-4 text-white text-lg">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="#"
                  className="hover:text-cyan-400 transition-colors duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-cyan-400 transition-colors duration-300"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Green StudentHub. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Made with ❤️ for students</span>
              <span>•</span>
              <a
                href="mailto:support@studenthub.lk"
                className="hover:text-cyan-400 transition-colors duration-300"
              >
                support@studenthub.lk
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
