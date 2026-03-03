import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import AboutSection from "@/components/home/AboutSection";
import PeopleSection from "@/components/home/PeopleSection";
import ContactSection from "@/components/home/ContactSection";

export default function Home() {
  return (
    <main className="min-h-screen site-bg text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <PeopleSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
