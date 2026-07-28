import { ContractorMarketplaceSection } from "@/components/home/ContractorMarketplaceSection";
import { FinalCta } from "@/components/home/FinalCta";
import { GardenPlannerPromo } from "@/components/home/GardenPlannerPromo";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { IntroStrip } from "@/components/home/IntroStrip";
import { TilePlannerSpotlight } from "@/components/home/TilePlannerSpotlight";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection
        backgroundGradient="linear-gradient(160deg, #152e1a 0%, #234a2e 45%, #2e6040 100%)"
        tagline="For homeowners & contractors"
        headline={
          <>
            YOUR SPACE.<br />
            <span className="text-lime">EXACT COUNTS.</span>
          </>
        }
        description="Bloomy gives you a visual garden planner, a precise tile calculator, and a contractor marketplace — design your project, count your materials, then connect with local professionals."
        primaryCta={{ label: "Start a project", href: "/projects/new" }}
        secondaryCta={{ label: "Open Tile Planner →", href: "/tile-plan" }}
        scrollHint
      />
      <IntroStrip />
      <GardenPlannerPromo />
      <TilePlannerSpotlight />
      <ContractorMarketplaceSection />
      <HowItWorks />
      <FinalCta />
    </div>
  );
}
