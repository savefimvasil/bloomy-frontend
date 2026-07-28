import { HeroSection } from "@/components/home/HeroSection";
import { PatternShowcase } from "@/components/promo/PatternShowcase";
import { PromoHowItWorks } from "@/components/promo/PromoHowItWorks";
import { PromoFeaturesGrid } from "@/components/promo/PromoFeaturesGrid";
import { PromoCta, PromoFooterNote } from "@/components/promo/PromoCta";

export default function PlanPromoPage() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection
        backgroundGradient="linear-gradient(160deg, #1f4d2c 0%, #2f6b3d 55%, #4da162 100%)"
        badge="Free to use · No account needed"
        headline={<>Plan your<br /><span className="text-lime">perfect floor</span></>}
        description="Calculate tiles for any room — straight, running bond, or diagonal. Get exact material counts, see cut pieces, export your plan in seconds."
        primaryCta={{ label: "Start planning free", href: "/tile-plan" }}
        secondaryCta={{ label: "How it works", href: "#how-it-works" }}
        watermark
        fullHeight={false}
      />
      <PatternShowcase />
      <PromoHowItWorks />
      <PromoFeaturesGrid />
      <PromoCta />
      <PromoFooterNote />
    </main>
  );
}
