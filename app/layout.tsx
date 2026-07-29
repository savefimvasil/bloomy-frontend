import type { Metadata } from "next";
import { AuthHydration } from "@/components/auth-hydration";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
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
      <body
        className="flex h-full flex-col overflow-hidden bg-canvas text-ink"
        suppressHydrationWarning
      >
        <AuthHydration />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
