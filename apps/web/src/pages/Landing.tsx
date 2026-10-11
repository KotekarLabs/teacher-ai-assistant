import { LandingHeader } from "../components/landing/LandingHeader";
import { HeroSection } from "../components/landing/HeroSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { CurriculumSection } from "../components/landing/CurriculumSection";
import { LandingFooter } from "../components/landing/LandingFooter";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF9] text-slate-900 selection:bg-violet-100 selection:text-violet-900 overflow-x-hidden">
      <LandingHeader />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <HeroSection />
        <FeaturesSection />
        <CurriculumSection />
      </main>
      <LandingFooter />
    </div>
  );
}
