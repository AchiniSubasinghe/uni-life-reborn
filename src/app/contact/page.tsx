import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactHeroSection from "@/components/contact/ContactHeroSection";
import ContactFormSection from "@/components/contact/ContactFormSection";
import ContactInfoSection from "@/components/contact/ContactInfoSection";
import FAQSection from "@/components/contact/FAQSection";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white overflow-hidden">
      <Navbar />
      <ContactHeroSection />
      <ContactFormSection />
      <ContactInfoSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
