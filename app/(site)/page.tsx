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
            PLAN YOUR GARDEN.<br />
            <span className="text-lime">GET IT BUILT.</span>
          </>
        }
        description="Draw your garden layout, get exact material counts in seconds, then post your project to receive quotes from local contractors — all in one place."
        primaryCta={{ label: "Start planning", href: "/projects/new" }}
        secondaryCta={{ label: "Browse tile planner →", href: "/tile-plan" }}
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
