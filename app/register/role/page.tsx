"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SplitHighlight } from "@/components/ui/split-highlight";
import { RegisterSteps } from "@/components/ui/register-steps";
import { useRedirectIfAuthenticated } from "@/lib/useRedirectIfAuthenticated";

function HomeownerIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 13L16 4L28 13V28H20V20H12V28H4V13Z" />
    </svg>
  );
}

function ContractorIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="14" width="24" height="14" rx="2" />
      <path d="M10 14V10C10 7.24 12.24 5 15 5H17C19.76 5 22 7.24 22 10V14" />
      <line x1="16" y1="19" x2="16" y2="24" />
      <line x1="13" y1="21.5" x2="19" y2="21.5" />
    </svg>
  );
}

type Role = "homeowner" | "contractor";

function RegisterRolePageComponent() {
  const router = useRouter();
  const ready = useRedirectIfAuthenticated();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [selected, setSelected] = useState<Role | null>(null);

  useEffect(() => {
    if (!email) router.replace("/register");
  }, [email, router]);

  function handleContinue() {
    if (!selected) return;
    sessionStorage.setItem("bloomy_reg_role", selected);
    router.push(`/register/password?email=${encodeURIComponent(email)}`);
  }

  const options: { role: Role; title: string; description: string; Icon: () => React.ReactElement }[] = [
    {
      role: "homeowner",
      title: "Homeowner",
      description: "I want to plan my garden or tiling project and find professionals to do the work.",
      Icon: HomeownerIcon,
    },
    {
      role: "contractor",
      title: "Contractor",
      description: "I offer tiling, landscaping, or garden services and want to find and quote on local jobs.",
      Icon: ContractorIcon,
    },
  ];

  if (!ready) return null;

  return (
    <SplitHighlight
      title="Tell us who you are"
      description="Your role determines your experience on Bloomy — you can always contact support to change it."
      imageAlt="Botanical signup visual"
      imageUrl="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80"
      aside={
        <div className="container py-12 md:py-28">
          <div className="mx-auto w-full max-w-md">
            <RegisterSteps current={3} total={5} />
            <h2 className="text-display-sm text-forest">
              How will you use Bloomy?
            </h2>
            <p className="mt-3 text-sm text-muted">
              For{" "}
              <span className="font-medium text-forest">{email || "your account"}</span>
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {options.map(({ role, title, description, Icon }) => {
                const active = selected === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelected(role)}
                    className={`flex items-start gap-5 rounded-xl border-2 p-5 text-left transition ${
                      active
                        ? "border-forest bg-forest/5"
                        : "border-line bg-paper hover:border-forest/30 hover:bg-canvas"
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 ${active ? "text-forest" : "text-sage"}`}>
                      <Icon />
                    </span>
                    <div>
                      <p className={`text-body font-semibold ${active ? "text-forest" : "text-ink"}`}>
                        {title}
                      </p>
                      <p className="mt-1 text-sm text-muted leading-snug">{description}</p>
                    </div>
                    <span
                      className={`ml-auto mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        active ? "border-forest bg-forest" : "border-line"
                      }`}
                    >
                      {active && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              disabled={!selected}
              onClick={handleContinue}
              className="mt-8 w-full"
            >
              Continue
            </Button>
          </div>
        </div>
      }
    />
  );
}

export default function RegisterRolePage() {
  return (
    <Suspense>
      <RegisterRolePageComponent />
    </Suspense>
  );
}
