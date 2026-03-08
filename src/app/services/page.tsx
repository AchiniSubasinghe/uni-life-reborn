import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesHeroSection from "@/components/services/ServicesHeroSection";
import ServicesCategoriesSection from "@/components/services/ServicesCategoriesSection";
import HowItWorksSection from "@/components/services/HowItWorksSection";
import ServicesCTASection from "@/components/services/ServicesCTASection";

export default function ServicesPage() {
  return (
    <main className="min-h-screen site-bg text-white overflow-hidden">
      <Navbar />
      <ServicesHeroSection />
      <ServicesCategoriesSection />
      <HowItWorksSection />
      <ServicesCTASection />
      <Footer />
    </main>
  );
}
