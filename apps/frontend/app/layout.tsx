import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Dock } from "@/components/dock";
import { ModuleHeader } from "@/components/ui/module-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FintERP - Intelligent Finance",
  description: "The layout for the next generation of ERPs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex h-screen flex-col bg-muted/20">
            {/* 1. Contextual Top Bar */}
            <ModuleHeader />

            {/* 2. Main Scrollable Content */}
            <main className="flex-1 overflow-auto bg-background pb-32">
              {children}
            </main>

            {/* 3. Global Floating Dock */}
            <Dock />
          </div>
        </Providers>
      </body>
    </html>
  );
}
