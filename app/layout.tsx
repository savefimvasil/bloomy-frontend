import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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
      <body className="min-h-full bg-[#f7f4ec] text-[#171717]">
        <div className="flex min-h-full flex-col">
          <SiteHeader />
          <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
