"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "How do I list my business on StudentHub?",
    answer:
      "To list your business, click on the 'Join as Provider' button and fill out the registration form. Our team will review your application and verify your business details within 2-3 business days.",
  },
  {
    question: "Is StudentHub free for students?",
    answer:
      "Yes! StudentHub is completely free for students to use. You can browse all listings, read reviews, and contact service providers without any charges.",
  },
  {
    question: "How do you verify the listings?",
    answer:
      "We have a dedicated verification team that physically visits each business and checks for quality, safety, and reliability. We also collect student feedback to ensure ongoing quality.",
  },
  {
    question: "Can I leave reviews for places I've visited?",
    answer:
      "Absolutely! After signing up, you can leave reviews and ratings for any place you've visited. Your feedback helps other students make informed decisions.",
  },
  {
    question: "Which universities do you currently cover?",
    answer:
      "We currently serve students at NSBM Green University, University of Colombo, and University of Sri Jayewardenepura. We're actively working on expanding to more universities.",
  },
  {
    question: "How can I report a problem with a listing?",
    answer:
      "You can report any issues by clicking the 'Report' button on the listing page or by contacting our support team through this contact form. We take all reports seriously and investigate promptly.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400">
            Find quick answers to common questions
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-background border border-border rounded-xl overflow-hidden transition-all duration-300 ${openIndex === index ? "shadow-lg shadow-cyan-500/10" : ""}`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-card/50 transition-colors"
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
              >
                <span className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-96" : "max-h-0"}`}
              >
                <p className="px-6 pb-5 text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
