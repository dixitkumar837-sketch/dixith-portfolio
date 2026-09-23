import React from "react";
import { HeroSection } from "@/components/hero/HeroSection";
import { PhilosophySection } from "@/components/hero/PhilosophySection";
import { AreasOfPracticeSection } from "@/components/hero/AreasOfPracticeSection";
import { AISearchUniverseSection } from "@/components/visualizations/AISearchUniverseSection";
import { FeaturedResearchSection } from "@/components/research/FeaturedResearchSection";
import { AISearchLabSection } from "@/components/search-lab/AISearchLabSection";
import { CaseStudiesSection } from "@/components/case-studies/CaseStudiesSection";
import { LatestInsightsSection } from "@/components/research/LatestInsightsSection";
import { AboutSection } from "@/components/hero/AboutSection";
import { ConnectSection } from "@/components/hero/ConnectSection";
import { SITE_CONFIG } from "@/lib/site-config";
import { generateWebPageSchema } from "@/lib/schema";

export default function Home() {
  const webPageSchema = generateWebPageSchema({
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Search Forward Philosophy */}
      <PhilosophySection />

      {/* 3. Areas of Practice */}
      <AreasOfPracticeSection />

      {/* 4. AI Search Universe */}
      <AISearchUniverseSection />

      {/* 5. Featured Research */}
      <FeaturedResearchSection />

      {/* 6. AI Search Lab */}
      <AISearchLabSection />

      {/* 7. Professional Experience */}
      <CaseStudiesSection />

      {/* 8. Latest Insights */}
      <LatestInsightsSection />

      {/* 9. About Dixith */}
      <AboutSection />

      {/* 10. Connect */}
      <ConnectSection />
    </>
  );
}
