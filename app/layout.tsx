import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bloomy garden",
  description: "Bloomy garden description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full overflow-hidden bg-canvas text-ink">
        <div className="flex h-full flex-col">
          <ScrollToTop />
          <SiteHeader />
          <main className="flex-1 overflow-y-auto pt-[68px]">
            {children}
            <SiteFooter />
          </main>
        </div>
      </body>
    </html>
  );
}
