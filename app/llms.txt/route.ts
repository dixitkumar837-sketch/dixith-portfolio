import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-static";

export async function GET() {
  const content = `# ${SITE_CONFIG.name}
> ${SITE_CONFIG.tagline} · ${SITE_CONFIG.philosophy}

## Entity Information
- Name: ${SITE_CONFIG.author.name}
- Role: ${SITE_CONFIG.positioning}
- Focus: ${SITE_CONFIG.description}
- Canonical URL: ${SITE_CONFIG.url}

## Core Research Domains
- AI Search & Generative Retrieval
- Technical & Enterprise SEO
- Answer Engine Optimization (AEO)
- Generative Engine Optimization (GEO)
- Search Systems Architecture
- Information Discovery & Knowledge Graphs

## AI Search Lab — 6 Evaluated Systems
Active benchmark testing under standardized query vectors:
1. Google AI Overview
2. ChatGPT
3. Perplexity
4. Claude
5. Gemini
6. Microsoft Copilot

## Real Information Architecture & Section Anchors
- Research Archive: ${SITE_CONFIG.url}#research
- AI Search Lab (Active Experiments): ${SITE_CONFIG.url}#search-lab
- Professional Experience: ${SITE_CONFIG.url}#experience
- Professional Experience Archive: ${SITE_CONFIG.url}/professional-experience
- Articles & Strategic Analysis: ${SITE_CONFIG.url}/articles
- Guides & Implementation Frameworks: ${SITE_CONFIG.url}/guides
- About & Operating Principles: ${SITE_CONFIG.url}#about
- Internal Search (Utility): ${SITE_CONFIG.url}/search
- Authority Inquiries & Contact: ${SITE_CONFIG.url}#connect

## Core Principles
- Evidence over opinions
- Research over assumptions
- Results over noise
- Long-term visibility over short-term ranking tactics
- Clear thinking over marketing hype
- Human expertise combined with emerging search technology

---
*Experimental machine-readability reference for AI search engines, research agents, and LLM discovery systems. Not an endorsement or ranking guarantee.*
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
