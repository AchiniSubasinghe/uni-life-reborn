import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import StorySection from "@/components/about/StorySection";
import MissionVisionSection from "@/components/about/MissionVisionSection";
import ValuesSection from "@/components/about/ValuesSection";
import StatsSection from "@/components/about/StatsSection";
import TeamSection from "@/components/about/TeamSection";
import AboutCTASection from "@/components/about/AboutCTASection";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white overflow-hidden">
      <Navbar />
      <AboutHeroSection />
      <StorySection />
      <MissionVisionSection />
      <ValuesSection />
      <StatsSection />
      <TeamSection />
      <AboutCTASection />
      <Footer />
    </main>
  );
}
