import { GUIDES } from "../data/guides";
import { GUI002_BODY } from "./verify-gui002-draft";

const testGuide = {
  id: "GUI-002",
  slug: "crawler-access-and-index-hygiene-for-ai-search",
  title: "Crawler Access and Index Hygiene for AI Search Engines",
  category: "Crawl Optimization",
  summary:
    "Systematic configuration guide for robots.txt rules, DOM cleanliness, and server-side rendering pipelines for generative AI crawlers.",
  status: "DRAFT",
  authorId: "AUT-001",
  readTime: "16 min",
  readingTime: "16 min",
  difficultyLevel: "ADVANCED",
  topics: ["TOP-001", "TOP-002"],
  targetSystems: [
    "Google AI Overview",
    "ChatGPT",
    "Perplexity",
    "Claude",
    "Gemini",
    "Microsoft Copilot",
  ],
  prerequisites: [
    "Server configuration, reverse proxy, or CDN edge rule access (e.g., Cloudflare, Fastly, AWS CloudFront, Nginx)",
    "Direct authority over robots.txt deployment and HTTP response headers (X-Robots-Tag, Cache-Control)",
    "Basic understanding of HTTP User-Agent header handling and DNS reverse lookup verification",
    "Familiarity with official crawler documentation for OpenAI (SRC-003), Anthropic (SRC-004), Google (SRC-005), and Perplexity (SRC-006)",
  ],
  steps: [
    {
      stepNumber: 1,
      title: "Audit AI Search Bot User-Agent Directives",
      description:
        "Explicitly configure permissions for Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, GPTBot, ClaudeBot, and Google-Extended in robots.txt. Distinguish real-time search retrieval crawlers from foundational model training scrapers, avoiding global disallow rules that unintentionally sever conversational search citations.",
      codeSnippet: {
        language: "text",
        code: `# https://example.com/robots.txt\n# Allow search & real-time AI retrieval; disallow model pre-training scraping\n\nUser-agent: Googlebot\nUser-agent: Bingbot\nAllow: /\nDisallow: /api/\nDisallow: /admin/\n\nUser-agent: OAI-SearchBot\nUser-agent: PerplexityBot\nAllow: /\nDisallow: /api/\nDisallow: /admin/\n\nUser-agent: GPTBot\nUser-agent: ClaudeBot\nUser-agent: Google-Extended\nDisallow: /\n\nUser-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\n\nSitemap: https://example.com/sitemap.xml`,
      },
    },
    {
      stepNumber: 2,
      title: "Enforce Fine-Grained Indexation and Snippet Controls via HTTP Headers",
      description:
        "Deploy X-Robots-Tag HTTP response headers at the server or CDN edge to govern indexing, snippet length, and preview extraction independently of robots.txt. Ensure pages requiring de-indexation are allowed in robots.txt so crawlers can fetch the noindex directive.",
      codeSnippet: {
        language: "text",
        code: `# Nginx HTTP Header Configuration for Public Production Routes\nlocation / {\n    # Permit full-length text extraction for search snippets and AI answers\n    add_header X-Robots-Tag "max-snippet:-1, max-image-preview:large, max-video-preview:-1" always;\n}\n\n# Staging & Internal Route Protection (Edge Header Injection)\nlocation /staging/ {\n    add_header X-Robots-Tag "noindex, nofollow" always;\n}`,
      },
    },
    {
      stepNumber: 3,
      title: "Eliminate Client-Side DOM Rendering Bottlenecks",
      description:
        "Pre-render primary informational passages, headings, and structured data into the initial HTML document payload using Server-Side Rendering (SSR) or Static Site Generation (SSG). Real-time retrieval agents often do not execute client-side JavaScript, scraping empty containers if content requires hydration.",
      codeSnippet: {
        language: "typescript",
        code: `// Next.js App Router: Static Semantic Server Component\n// Guarantees immediate DOM availability on initial HTTP response\nexport default async function GuidePage({ params }: { params: { slug: string } }) {\n  const guide = await getGuideData(params.slug);\n  return (\n    <article className="prose prose-invert max-w-none">\n      <h1>{guide.title}</h1>\n      <p className="lead">{guide.summary}</p>\n      <section dangerouslySetInnerHTML={{ __html: guide.renderedHtml }} />\n    </article>\n  );\n}`,
      },
    },
    {
      stepNumber: 4,
      title: "Standardize Canonical URLs and Dynamic XML Sitemaps",
      description:
        "Enforce absolute, self-referential canonical tags across all indexable routes, normalize trailing slashes with permanent 301 redirects, and generate dynamic XML sitemaps containing exclusively 200 OK canonical endpoints while omitting drafts and staging URLs.",
      codeSnippet: {
        language: "xml",
        code: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <!-- Canonical production URLs only; no redirects, 404s, or drafts -->\n  <url>\n    <loc>https://example.com/guides/crawler-access-and-index-hygiene-for-ai-search</loc>\n    <lastmod>2026-03-24</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`,
      },
    },
    {
      stepNumber: 5,
      title: "Establish Bot Verification and Edge Protection Policies",
      description:
        "Implement two-step reverse DNS (rDNS) lookup scripts and tune edge WAF rate-limiting rules to verify legitimate search and retrieval bots while preventing aggressive CAPTCHA challenges from blocking real-time conversational agents.",
      codeSnippet: {
        language: "bash",
        code: `# Two-Step Reverse DNS (rDNS) Crawler Verification\nCRAWLER_IP="66.249.66.1"\n\n# Step 1: Query PTR record for domain name\nHOST_NAME=$(host $CRAWLER_IP | awk '{print $NF}' | sed 's/\\.$//')\necho "Resolved Hostname: $HOST_NAME"\n\n# Step 2: Forward lookup to confirm IP match\nFORWARD_IP=$(host $HOST_NAME | awk '{print $NF}')\nif [ "$CRAWLER_IP" = "$FORWARD_IP" ]; then\n    echo "VERIFIED: Genuine search crawler from $HOST_NAME"\nelse\n    echo "SPOOFED: IP $CRAWLER_IP does not match forward lookup $FORWARD_IP"\nfi`,
      },
    },
  ],
  body: GUI002_BODY,
  entityReferences: [
    { type: "research", id: "EXP-014", relation: "applies" },
  ],
  relatedResearchIds: ["EXP-014"],
  sourceIds: ["SRC-003", "SRC-004", "SRC-005", "SRC-006"],
};

const bodyWords = testGuide.body.trim().split(/\s+/).filter(Boolean).length;
let stepWords = 0;
for (const step of testGuide.steps) {
  stepWords += step.title.split(/\s+/).filter(Boolean).length;
  stepWords += step.description.split(/\s+/).filter(Boolean).length;
}
console.log("Body Words:", bodyWords);
console.log("Step Words:", stepWords);
console.log("Total Guide Words:", bodyWords + stepWords);
