"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, ChevronDown, Send } from "lucide-react";

const faqs = [
  {
    q: "Is UniLife free to use?",
    a: "Yes — UniLife is completely free for students. There are no hidden fees, no premium tiers, and no ads. It will always remain free for students.",
  },
  {
    q: "How are businesses verified?",
    a: "Our team manually reviews every submitted business before it appears in listings. We verify contact details, location accuracy, and that the business genuinely serves students.",
  },
  {
    q: "Which universities are currently supported?",
    a: "We currently support NSBM Green University, University of Colombo, and University of Sri Jayewardenepura. We are actively working to expand to more campuses.",
  },
  {
    q: "Can I leave reviews for businesses?",
    a: "Yes! Once you create a free student account, you can leave ratings and written reviews for any business you visit.",
  },
  {
    q: "How do I list my business on UniLife?",
    a: "Sign up as a service provider, fill in your business details, and submit for review. Once approved by our team, your listing will go live for students to discover.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass glass-sheen rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/[0.04] transition-colors duration-200"
      >
        <span className="text-white font-medium">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-5 text-white/50 text-sm leading-relaxed border-t border-white/[0.06]">
              <p className="pt-4">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactSection() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="relative py-28 px-6 overflow-hidden">
      {/* orb */}
      <div className="orb w-[600px] h-[600px] bg-cyan-800 bottom-[-10%] left-[-10%]" style={{ opacity: 0.08 }} />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-blue-300 text-sm font-medium tracking-widest uppercase mb-3">Contact</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in touch</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Have a question, suggestion, or want to list your business? We&apos;d love to hear from you.
          </p>
        </motion.div>

        {/* Top grid — form + info */}
        <div className="grid lg:grid-cols-5 gap-6 mb-10">
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 glass glass-sheen rounded-2xl p-8"
          >
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="glass rounded-full p-4 mb-4">
                  <Send className="w-8 h-8 text-blue-300" />
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">Message sent!</h3>
                <p className="text-white/50 text-sm">We&apos;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: "", email: "", message: "" }); }}
                  className="mt-6 text-blue-300 text-sm hover:text-blue-200 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h3 className="text-white font-semibold text-lg mb-2">Send us a message</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/50 text-xs font-medium">Your name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="glass rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none focus:bg-white/[0.08] transition-colors duration-200 border-0"
                      placeholder="Kasun Silva"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-white/50 text-xs font-medium">Email address</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="glass rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none focus:bg-white/[0.08] transition-colors duration-200 border-0"
                      placeholder="you@university.lk"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/50 text-xs font-medium">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="glass rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none focus:bg-white/[0.08] transition-colors duration-200 resize-none border-0"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>
                <button
                  type="submit"
                  className="self-start inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105 text-sm"
                >
                  Send message
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-4"
          >
            {[
              {
                icon: Mail,
                label: "Email",
                value: "support@studenthub.lk",
                sub: "We reply within 24 hours",
              },
              {
                icon: Phone,
                label: "Phone",
                value: "+94 77 123 4567",
                sub: "Mon – Fri, 9 am – 6 pm",
              },
              {
                icon: MapPin,
                label: "Location",
                value: "Colombo, Sri Lanka",
                sub: "Serving universities island-wide",
              },
            ].map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.label}
                  className="glass glass-sheen rounded-2xl p-5 flex items-start gap-4 hover:bg-white/[0.07] transition-all duration-300"
                >
                  <div className="glass rounded-xl p-2.5 text-blue-300 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-0.5">{info.label}</div>
                    <div className="text-white text-sm font-medium">{info.value}</div>
                    <div className="text-white/35 text-xs mt-0.5">{info.sub}</div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          id="faq"
        >
          <h3 className="text-white text-2xl font-bold mb-6 text-center">Frequently asked questions</h3>
          <div className="flex flex-col gap-3 max-w-3xl mx-auto">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
