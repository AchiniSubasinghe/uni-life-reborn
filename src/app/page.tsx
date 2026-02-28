import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturesSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white overflow-hidden">
      <Navbar />
      <HeroSection />
      <CategorySection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
