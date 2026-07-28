import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollToTop } from "@/components/layout/scroll-to-top";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <ScrollToTop />
      <main className="flex-1 overflow-y-auto pt-[68px]">
        {children}
        <SiteFooter />
      </main>
    </>
  );
}
