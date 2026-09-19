import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { BRAND_CONFIG } from "@/data/navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dixith.ai"),
  title: {
    default: "DIXITH — AI Search Strategist",
    template: "%s | DIXITH",
  },
  description:
    "Dixith Kumar is an AI Search Strategist researching SEO, search systems, AEO, GEO, and emerging AI discovery experiences. Research first. Build second. Measure always.",
  keywords: [
    "AI Search",
    "AI Search Strategist",
    "Dixith Kumar",
    "SEO",
    "AEO",
    "GEO",
    "Generative Engine Optimization",
    "Answer Engine Optimization",
    "Technical SEO",
    "Enterprise Search",
  ],
  authors: [{ name: "Dixith Kumar" }],
  creator: "Dixith Kumar",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dixith.ai",
    title: "DIXITH — AI Search Strategist",
    description:
      "Researching how people, businesses and information are discovered across modern search.",
    siteName: "DIXITH",
  },
  twitter: {
    card: "summary_large_image",
    title: "DIXITH — AI Search Strategist",
    description:
      "Researching how people, businesses and information are discovered across modern search.",
    creator: "@dixithkumar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-brand-bg text-brand-text-primary antialiased min-h-screen flex flex-col selection:bg-brand-accent selection:text-white">
        {/* WCAG 2.2 AA Accessible Skip Link */}
        <a href="#main-content" className="sr-only skip-to-content">
          Skip to main content
        </a>

        {/* Global sticky navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Global brand footer */}
        <Footer />
      </body>
    </html>
  );
}
