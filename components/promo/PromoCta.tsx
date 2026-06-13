import Link from "next/link";
import { HeroSection } from "@/components/home/HeroSection";

export function PromoCta() {
  return (
    <HeroSection
      backgroundGradient="linear-gradient(160deg, #1f4d2c 0%, #2f6b3d 60%, #3a7a4a 100%)"
      badge="100% free · no credit card"
      headline={<>Ready to plan<br /><span className="text-lime">your floor?</span></>}
      description="No account needed — start right now and export your plan in minutes."
      primaryCta={{ label: "Open the planner", href: "/tile-plan" }}
      secondaryCta={{ label: "Create account", href: "/register" }}
      watermark
      fullHeight={false}
    />
  );
}

export function PromoFooterNote() {
  return (
    <div className="bg-forest py-6 text-center text-xs text-paper/50">
      <Link href="/tile-plan" className="transition hover:text-paper/80">
        ← Back to planner
      </Link>
      <span className="mx-3">·</span>
      <Link href="/" className="transition hover:text-paper/80">
        Bloomy home
      </Link>
    </div>
  );
}
