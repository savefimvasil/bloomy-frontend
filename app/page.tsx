import { FinalCta } from "@/components/home/FinalCta";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { IntroStrip } from "@/components/home/IntroStrip";
import { ProjectsTeaser } from "@/components/home/ProjectsTeaser";
import { TilePlannerSpotlight } from "@/components/home/TilePlannerSpotlight";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection
        backgroundGradient="linear-gradient(160deg, #152e1a 0%, #234a2e 45%, #2e6040 100%)"
        tagline="For designers & contractors"
        headline={
          <>
            EARLY LIGHT.<br />
            <span className="text-lime">EXACT COUNTS.</span>
          </>
        }
        description="Plan the patio before the sun's fully up. Share the count with the yard before they open."
        primaryCta={{ label: "Start planning", href: "/tile-plan" }}
        secondaryCta={{ label: "Open Tile Planner →", href: "/tile-plan" }}
        scrollHint
      />
      <IntroStrip />
      <TilePlannerSpotlight />
      <HowItWorks />
      <ProjectsTeaser />
      <FinalCta />
    </div>
  );
}
