export const GUI002_BODY = `1. What this guide solves

As search engines shift from keyword-indexed link directories toward Retrieval-Augmented Generation (RAG) and generative answer synthesis, technical SEO architects face a new paradigm in crawl accessibility and index hygiene.

In modern AI search ecosystems—encompassing Google AI Overview, ChatGPT, Perplexity, Claude, Gemini, and Microsoft Copilot—crawling operations are divided across distinct functional objectives: general search indexation, real-time conversational retrieval, and foundation model pre-training data scraping.

Without an intentional crawler access architecture and disciplined index hygiene, websites encounter two critical failure modes:
- Inadvertent Search Exclusion: Overly broad robots.txt disallow rules or aggressive edge WAF rate-limiting inadvertently sever connections to real-time retrieval bots, causing content to be excluded from AI citations and conversational search results.
- Index Contamination: Fragmented canonical tags, client-side rendering bottlenecks, or unmanaged staging deployments allow incomplete, duplicate, or private data to enter retrieval candidate pools.

This guide provides an architectural specification for configuring crawler access, structuring robots.txt directives, enforcing HTTP response headers, eliminating rendering bottlenecks, and standardizing sitemap pipelines.

CRITICAL NON-GUARANTEE NOTICE:
Configuring crawler access and index hygiene is an absolute architectural prerequisite for retrieval, but it does NOT guarantee:
- Inclusion in Google AI Overviews or rich snippet features
- Direct citations, quotes, or source links in ChatGPT, Perplexity, Claude, Gemini, or Microsoft Copilot
- Favorable algorithmic ranking or preferential crawl scheduling
Crawl accessibility ensures that search engine and AI agent bots have permission and capability to fetch and parse page content. Inclusion in generated responses depends entirely on downstream semantic retrieval algorithms, query relevance, factual authority, and model reasoning.

DOMAIN IMPLEMENTATION NOTICE:
All example URLs, hostnames, and robots.txt paths in this guide use the RFC 2606 / IANA reserved placeholder domain https://example.com. You must replace https://example.com with your site's verified production domain during actual deployment. Never deploy example.com configurations to production environments.


2. Crawler categories: search/retrieval vs training/data collection vs general search

A fundamental error in modern technical SEO is treating all automated crawlers as a monolithic group. AI search engines and foundation model providers operate distinct bot families with fundamentally different operational purposes, crawl frequencies, and business implications:

Tier 1: General Web Search Crawlers (Googlebot, Bingbot)
These crawlers discover, crawl, and index web pages to build comprehensive inverted indexes. Crucially, these general search indexes serve as the foundational retrieval corpus for search-grounded AI features. Google AI Overviews retrieve passages directly from the primary Google Search index populated by Googlebot, and Microsoft Copilot retrieves passages from the Bing index populated by Bingbot. Blocking Tier 1 crawlers removes your site from standard organic search results and all derived AI search features.

Tier 2: Dedicated AI Search and Real-Time Retrieval Crawlers (OAI-SearchBot, PerplexityBot)
These crawlers operate in direct support of conversational search features and real-time RAG. When a user submits a query in a conversational interface (such as ChatGPT Search or Perplexity), these bots fetch live web pages to ground answers in verified, current source documents. They do not build offline model training datasets; their mission is immediate retrieval and source attribution. Allowing Tier 2 crawlers enables content discovery and referral citations in AI search interfaces.

Tier 3: AI Training and Foundational Data Collection Crawlers (GPTBot, ClaudeBot, Google-Extended)
These crawlers conduct large-scale, asynchronous web scraping to assemble text corpora for training foundation models. Restricting Tier 3 crawlers prevents proprietary research and editorial content from being absorbed into foundational model weights without compensation, while having zero negative impact on visibility in standard search engines or real-time search citations.

Recognizing these three tiers allows technical architects to implement nuanced access policies rather than forcing a false choice between total content exposure and complete search obscurity.


3. Current documented crawler identities

To configure access policies accurately, engineering teams must rely exclusively on official documentation published directly by crawler operators, rather than secondary speculation.

| User-Agent Token | Organization | Primary Purpose | Control Mechanism | Official Source |
| :--- | :--- | :--- | :--- | :--- |
| Googlebot | Google | General search indexation & AI Overview retrieval | robots.txt / X-Robots-Tag | Google Search Central (SRC-005) |
| Google-Extended | Google | Training data collection for Gemini & Vertex AI models | robots.txt User-agent token | Google Search Central (SRC-005) |
| GPTBot | OpenAI | Data collection for training & fine-tuning OpenAI models | robots.txt User-agent token | OpenAI Documentation (SRC-003) |
| OAI-SearchBot | OpenAI | Real-time web retrieval for search features in ChatGPT | robots.txt User-agent token | OpenAI Documentation (SRC-003) |
| ClaudeBot | Anthropic | Automated data collection for training Claude models | robots.txt User-agent token | Anthropic Documentation (SRC-004) |
| PerplexityBot | Perplexity AI | Web crawling, indexation & real-time answer grounding | robots.txt User-agent token | Perplexity Documentation (SRC-006) |

Operational Distinctions:
- Googlebot handles standard Google indexation. Google AI Overviews retrieve content indexed by Googlebot rather than deploying a standalone crawler. Disallowing Googlebot removes the site from Google Search entirely.
- Google-Extended is a robots.txt policy token recognized by Google (SRC-005). It allows publishers to manage whether content trains Gemini and Vertex AI models without impacting search rankings or visibility.
- GPTBot (SRC-003) scrapes public web data to train OpenAI models. Disallowing GPTBot withholds content from foundational training pipelines.
- OAI-SearchBot (SRC-003) is used strictly for conversational search retrieval in ChatGPT Search. It does not train models. Blocking it prevents citation links in ChatGPT Search.
- ClaudeBot (SRC-004) collects data to train Anthropic models. Controlled via User-agent: ClaudeBot. (Anthropic also operates Claude-Web for user-directed browsing).
- PerplexityBot (SRC-006) indexes web content and fetches real-time data for Perplexity search answers and citation links.


4. robots.txt fundamentals and RFC 9309 protocol rules

The Robots Exclusion Protocol, standardized in RFC 9309, governs how automated web crawlers interpret access permissions on web servers:

- Record Structure & Specificity: A robots.txt file contains record groups starting with User-agent lines, followed by Allow or Disallow rules. Crawlers look for their specific token (case-insensitively). If an exact match exists (e.g. User-agent: GPTBot), the crawler obeys ONLY that group, completely ignoring the generic User-agent: * group. If no specific match exists, it falls back to User-agent: *.
- Path Matching: Prefix matching applies from the start of the URI path. Disallow: /private matches /private, /private/, and /private-draft.html. Trailing slashes enforce directory boundaries: Disallow: /private/ matches /private/doc.html but not /private-draft.html.
- Wildcards: Asterisk (*) matches zero or more characters. Dollar sign ($) marks the path end (e.g., Disallow: /*.pdf$).
- Longest Match Precedence: Under RFC 9309, if Allow and Disallow conflict, the directive with the longest character pattern wins. For /research/open-access/paper.html, Allow: /research/open-access/ (22 chars) overrides Disallow: /research/ (10 chars). If lengths are identical, Allow takes precedence.
- Scope & Status: robots.txt is valid only on its exact protocol, hostname, and port. The file must return HTTP 200 OK with Content-Type: text/plain. A 5xx error suspends crawling across the host; a 404 error implies no crawl restrictions exist.


5. Search vs training access strategy: Scenarios A, B, C, and D

Every organization must determine its own balance between public reach, intellectual property protection, and server resource allocation. There is no single universal robots.txt configuration that is ideal for all websites. The following four operational scenarios represent distinct strategic postures:

Scenario A: Maximum Openness (Universal Access)
- Target Profile: Open-access academic repositories, public documentation libraries, developer knowledge hubs, and open-source projects.
- Architecture: Unrestricted access for general search engines, AI retrieval crawlers, and AI training scrapers across public routes.
- Trade-offs: Maximizes presence in foundation model pre-training corpora and real-time retrieval citations; provides zero protection against uncompensated commercial data harvesting.

Scenario B: Retrieval Allowed, Training Blocked (Selective AI Access)
- Target Profile: Commercial publishers, independent research institutions, software companies, and media organizations that value search referral traffic and AI citations, but decline to contribute uncompensated pre-training data.
- Architecture: Allow Googlebot, Bingbot, OAI-SearchBot, and PerplexityBot. Disallow GPTBot, ClaudeBot, and Google-Extended.
- Trade-offs: Preserves live search visibility and referral traffic while establishing an explicit copyright boundary against offline model training datasets. Requires active monitoring as bot tokens evolve.

Scenario C: Traditional Search Preservation (Block Dedicated AI Crawlers)
- Target Profile: Organizations that rely exclusively on traditional organic search engine referral models and actively opt out of all standalone generative AI answer engines.
- Architecture: Allow Googlebot and Bingbot. Disallow GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, and Google-Extended.
- Trade-offs: Minimizes bot traffic and server overhead. Eliminates visibility and citation links in ChatGPT Search, Perplexity, and third-party AI interfaces. Content will still appear in Google AI Overviews unless snippet lengths are constrained via X-Robots-Tag.

Scenario D: Comprehensive Lockdown (Private Staging and Internal Repositories)
- Target Profile: Development environments, staging branches, proprietary internal knowledge bases, and private client portals.
- Architecture: Full crawl denial via robots.txt combined with enforced HTTP authentication (Basic Auth, OAuth, or edge IP allowlisting).
- Trade-offs: Guarantees complete exclusion from search indexes and training datasets. Must be enforced at the HTTP layer, as robots.txt alone does not prevent indexing of externally linked URLs.


6. Example robots.txt configurations

WARNING: Do NOT copy and paste these example configurations blindly without auditing your site's business objectives, monetization model, and traffic sources. Adapt each configuration to your specific architecture and replace https://example.com with your verified canonical domain.

Configuration 1: Baseline Open Configuration (Scenario A)
# Domain: https://example.com (Replace with canonical production domain)
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /checkout/

Sitemap: https://example.com/sitemap.xml

Configuration 2: Selective Retrieval Configuration (Scenario B - Recommended for AI Citation)
# Domain: https://example.com (Replace with canonical production domain)

# 1. General Search Engines
User-agent: Googlebot
User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

# 2. AI Search & Real-Time Retrieval Bots (Allows Citations)
User-agent: OAI-SearchBot
User-agent: PerplexityBot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

# 3. Dedicated AI Training & Scraping Bots (Blocks Model Training Data)
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
Disallow: /

# 4. Fallback for All Other Crawlers
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: https://example.com/sitemap.xml

Configuration 3: Traditional Search Only (Scenario C)
# Domain: https://example.com (Replace with canonical production domain)

User-agent: Googlebot
User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ClaudeBot
User-agent: PerplexityBot
User-agent: Google-Extended
Disallow: /

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: https://example.com/sitemap.xml


7. robots.txt vs HTTP controls: the layered defense model

A dangerous operational misconception in technical engineering is assuming that robots.txt is a security mechanism or a complete indexation control tool. It is neither.

Technical Boundaries:
- robots.txt controls CRAWL ACCESS: whether a bot is permitted to request and download the raw bytes of a URL.
- HTTP headers and HTML meta tags control INDEXATION AND SNIPPET PRESENTATION: how search engines store, index, and display content.
- HTTP status codes (401 Unauthorized, 403 Forbidden) control ACCESS AUTHORIZATION: enforcing cryptographic or credential boundaries.

The Two Classic Indexation Traps:

Trap 1: "Disallowed but Indexed"
If a URL is blocked in robots.txt (Disallow: /internal-report.html), search engine crawlers will not fetch the file. However, if external websites link to https://example.com/internal-report.html, Google can still index the URL without fetching the content. In search results, it appears as an empty snippet containing only the title or URL with the notice: "No information is available for this page". robots.txt did not prevent indexation; it only prevented Googlebot from seeing page content.

Trap 2: "Robots.txt Blocks Noindex"
To de-index a page using <meta name="robots" content="noindex"> or the X-Robots-Tag: noindex HTTP header, the search crawler MUST BE ABLE TO FETCH THE PAGE to read the directive. If you disallow the page in robots.txt, the crawler will never download the HTML, will never see the noindex instruction, and will retain the URL in its index. To de-index a page cleanly, it MUST BE ALLOWED in robots.txt and serve an HTTP noindex response.

Advanced HTTP Controls: The X-Robots-Tag
For non-HTML assets or global server-level enforcement, deliver indexation instructions via the X-Robots-Tag HTTP response header:

Example Nginx Header Directive:
add_header X-Robots-Tag "noindex, nofollow" always;

For fine-grained snippet control across search and AI systems:
add_header X-Robots-Tag "max-snippet:-1, max-image-preview:large, max-video-preview:-1" always;
- max-snippet:-1: Allows search and retrieval engines to extract text passages of any length for snippets and answers.
- max-snippet:0: Prohibits snippet extraction entirely (preventing text quotation in AI answers).
- nosnippet: Completely forbids snippet display or quotation.

Edge WAF and Rate-Limiting Governance:
A frequent cause of AI search exclusion is an aggressive WAF rule that misidentifies legitimate retrieval bots (such as OAI-SearchBot or PerplexityBot) as malicious scrapers, issuing automated 403 Forbidden or JavaScript CAPTCHA challenges. Because automated retrieval bots do not solve interactive CAPTCHAs, retrieval fails instantly. Ensure your WAF rules explicitly allowlist verified crawler ASNs or implement reverse DNS verification before blocking.


8. Rendering and AI retrieval: the cost of client-side execution

In conversational AI search and RAG retrieval pipelines, document retrieval latency is measured in milliseconds. When a user prompts an AI search interface, the backend retrieval agent has a finite time window to query an index, fetch live URLs, extract candidate passages, synthesize facts, and stream the response.

The Flaw of Client-Side Rendering (CSR):
When a website is built as a pure Client-Side Rendered Single Page Application, the initial HTTP response body returned to a crawler contains minimal content:
<!DOCTYPE html>
<html>
  <head><title>App</title></head>
  <body>
    <div id="root"></div>
    <script src="/static/bundle.js"></script>
  </body>
</html>

While Googlebot maintains a headless Chromium rendering pipeline capable of executing client-side JavaScript, this rendering occurs in a secondary, asynchronous queue that may be delayed by hours or days depending on crawl budget.

More critically, specialized AI retrieval bots and real-time scrapers often utilize streamlined HTTP retrieval pipelines that parse raw HTML directly without executing heavy JavaScript engines. If your primary text, research data, headings, and schema are injected via client-side hydration, real-time retrieval bots will scrape an empty container, resulting in zero citation extraction.

The Solution: Server-Side Rendering (SSR) and Static Site Generation (SSG)
Architect your public content layers using SSR or SSG (e.g., Next.js App Router Server Components). This guarantees that every informative paragraph, heading hierarchy, and citation source is fully rendered into the initial HTML document payload delivered on the first byte.

DOM Cleanliness Principles for Retrieval:
- Use semantic HTML: <article>, <main>, <header>, <section>, <p>, and <table> elements provide clear structural signals for passage extraction algorithms.
- Avoid hidden DOM traps: Content hidden behind tab clicks or accordion toggles that only fetch data on user click events cannot be discovered by static retrieval crawlers.
- Maintain shallow DOM depth: Deeply nested div wrappers increase HTML payload weight and parsing overhead without semantic benefit.


9. Canonical URLs and sitemap hygiene

Search engines and AI retrieval systems must resolve the single, definitive version of every content asset. Ambiguous URLs split link authority, confuse passage deduplication algorithms, and dilute citation frequency.

Self-Referential Canonical Tags:
Every indexable page must declare an absolute, self-referential canonical tag in its HTML <head>:
<link rel="canonical" href="https://example.com/guides/crawler-access-and-index-hygiene-for-ai-search" />

Rules for Canonical Consistency:
- Absolute URIs: Never use relative paths (e.g. href="/guide"). Always specify the full protocol and canonical domain.
- Trailing Slash Normalization: Enforce a strict sitewide convention (either always trailing slash or never). Inconsistent slashes create duplicate URL entries in indexes.
- Query Parameter Stripping: Ensure tracking parameters (?utm_source, ?ref, ?session_id) resolve canonically to the clean base URL.
- Protocol Enforcement: Canonical tags must always specify https://, never http://.

Strict XML Sitemap Hygiene:
An XML sitemap is a declaration of your site's highest-quality indexable assets. Submitting dirty sitemaps wastes crawl budget and sends conflicting quality signals.
- Status Code: Every URL in sitemap.xml must return HTTP 200 OK. Never include 301/302 redirects, 404 Not Found, or 500 Server Errors.
- Canonical Alignment: Every URL must match its self-referential canonical tag character-for-character.
- Indexability: Never list URLs that carry noindex meta tags or X-Robots-Tag headers.
- Status Filtering: Dynamic sitemaps must automatically exclude DRAFT, IN_REVIEW, ARCHIVED, or internal staging documents.
- Sitemap Declaration: Declare the sitemap location at the bottom of robots.txt using an absolute URL: Sitemap: https://example.com/sitemap.xml.

Eliminating Staging and Preview Leaks:
In modern CI/CD deployment pipelines, automated preview deployments generate unique staging URLs. If these staging URLs are discovered by search crawlers, they can be indexed as duplicate copies of production content.
Mandatory Staging Defense:
- Enforce HTTP Basic Authentication or IP allowlisting on all staging and preview environments.
- Configure edge middleware to inject X-Robots-Tag: noindex, nofollow on all non-production domains.
- Ensure production sitemaps and schema markup never reference staging domain strings.


10. Debugging checklist: 11-point diagnostic protocol

When diagnosing crawler access or indexation anomalies, execute the following 11-point verification sequence systematically:

- Item 1 (robots.txt Status): Request robots.txt via curl -I -A "Googlebot" https://example.com/robots.txt and confirm HTTP 200 OK with Content-Type: text/plain.
- Item 2 (Syntax Validation): Confirm User-agent directives are correctly spelled and followed by valid Allow/Disallow paths without omitting sitemap declarations.
- Item 3 (rDNS Verification): Run host <crawler-ip> to verify official domain PTR records, then host <hostname> to verify IP match.
- Item 4 (Disallow vs Noindex): Ensure URLs intended for de-indexation are NOT blocked in robots.txt so crawlers can fetch the noindex tag.
- Item 5 (HTTP Response Headers): Run curl -I https://example.com/guides/target-article to confirm edge headers do not inject unintended noindex directives.
- Item 6 (Initial HTML Payload): Run curl -s https://example.com/guides/target-article | grep -i "primary heading" to confirm text exists in raw response without JavaScript.
- Item 7 (Canonical Tag Integrity): Confirm <link rel="canonical"> exactly matches the requested URL, including protocol, domain, and trailing slashes.
- Item 8 (XML Sitemap Audit): Verify programmatically that 100% of URLs in https://example.com/sitemap.xml return HTTP 200 OK and zero redirects.
- Item 9 (CDN/WAF Log Audit): Review edge firewall logs for 403 Forbidden or 429 Too Many Requests responses served to legitimate AI retrieval bots.
- Item 10 (Asset Accessibility): Verify CSS, JavaScript, and web font paths are not blocked by robots.txt Disallow directives.
- Item 11 (Search Console Monitoring): Review crawl stats and coverage reports in Google Search Console to detect server errors, DNS failures, or crawl drops.


11. Common mistakes and anti-patterns: 9 documented failure modes

Review your production setup against these 9 pervasive architectural mistakes:

- Anti-Pattern 1 (Disallow Noindex Trap): Blocking a path in robots.txt while placing a noindex tag on the page. The crawler cannot fetch the page, misses the tag, and retains the URL listing in search results.
- Anti-Pattern 2 (Blocking Rendering Assets): Adding Disallow: /css/, Disallow: /js/, or Disallow: /_next/. This blinds headless browsers to page styling and layout, leading to degraded rendering quality evaluations.
- Anti-Pattern 3 (Full Client-Side Rendering): Serving empty container divs (<div id="root">) and loading primary text via client JavaScript. Real-time AI retrieval bots scrape empty containers, yielding zero citations.
- Anti-Pattern 4 (Relative Canonical URLs): Using <link rel="canonical" href="/article" /> instead of absolute URIs (https://example.com/article), which can lead to canonical confusion across subdomains or CDNs.
- Anti-Pattern 5 (Trailing Slash Inconsistency): Permitting both https://example.com/guide and https://example.com/guide/ to return duplicate 200 OK responses instead of a permanent 301 canonical redirect.
- Anti-Pattern 6 (Overzealous WAF Bot Filtering): Configuring aggressive WAF challenge rules that flag automated AI retrieval bots as threats, issuing 403 Forbidden headers to legitimate search agents.
- Anti-Pattern 7 (Assuming robots.txt Protects Secrets): Publishing sensitive URLs in robots.txt Disallow directives. robots.txt is completely public; protect private endpoints with HTTP authentication (401/403).
- Anti-Pattern 8 (Conflating Training and Retrieval Bots): Attempting to block AI training by placing a blanket Disallow: / on all AI tokens, inadvertently blocking OAI-SearchBot and PerplexityBot and severing conversational search citations.
- Anti-Pattern 9 (Permitting Staging Leaks): Deploying preview branches without automated X-Robots-Tag: noindex headers, causing staging versions to compete against production URLs.


12. Implementation checklist

Follow this sequential checklist to audit, deploy, and maintain your crawler access architecture:

Phase 1: Strategic Policy Selection
- Determine your organization's AI posture: Scenario A (Open), Scenario B (Retrieval Only / Training Blocked), Scenario C (Traditional Search Only), or Scenario D (Lockdown).
- Align stakeholders on whether foundational training bots (GPTBot, ClaudeBot, Google-Extended) should be permitted or restricted.

Phase 2: robots.txt Authoring and Deployment
- Construct robots.txt adhering strictly to RFC 9309 group and path specificity rules.
- Explicitly configure user-agent blocks for Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, GPTBot, ClaudeBot, and Google-Extended according to your chosen strategy.
- Verify that all asset paths required for rendering (CSS, JS, fonts) remain accessible.
- Declare the absolute production sitemap URL (https://example.com/sitemap.xml) at the bottom of the file.

Phase 3: HTTP Header & Edge WAF Configuration
- Configure edge rules to inject X-Robots-Tag: max-snippet:-1, max-image-preview:large on public pages.
- Configure staging environments to inject X-Robots-Tag: noindex, nofollow on all responses.
- Audit CDN WAF rules to ensure verified search and retrieval bots are not challenged by CAPTCHAs.

Phase 4: Rendering and DOM Architecture
- Verify that primary text, headings, author metadata, and structured data are pre-rendered into the initial server HTML response (SSR/SSG).
- Confirm clean semantic HTML structure (<article>, <main>, <header>, <section>).

Phase 5: Canonical & Sitemap Standardization
- Verify that every published page outputs an absolute, self-referential canonical tag.
- Automate dynamic XML sitemap generation to include strictly 200 OK, canonical, indexable URLs.
- Ensure non-published states (DRAFT, IN_REVIEW, ARCHIVED) are programmatically excluded from sitemaps.

Phase 6: Post-Deployment Verification
- Test live robots.txt retrieval across multiple user-agents.
- Verify reverse DNS resolution on visiting search bot IP addresses.
- Monitor Google Search Console crawl stats and coverage reports for indexation errors.


13. DIXITH research connection: EXP-014 and empirical retrieval verification

This technical implementation guide is architecturally linked to DIXITH empirical research entity EXP-014: "Citation Patterns Across AI Search Systems".

Status and Evidentiary Boundaries:
- Research Entity: EXP-014
- Current Research Status: IN_REVIEW
- Evidentiary Notice: EXP-014 represents an active research protocol and ongoing empirical observation effort. Its findings and analytical frameworks are currently undergoing systematic review. They must NOT be treated as established empirical certainty or dogma.

The Foundational Relationship:
In the DIXITH research methodology, crawler access and index hygiene represent the necessary physical baseline upon which empirical citation patterns are observed.

A document cannot be cited, quoted, or evaluated by an AI search engine if it cannot be crawled, parsed, and indexed:
- Crawlability is the gatekeeper: Without proper robots.txt permissions and unblocked HTTP delivery, an AI retrieval engine has zero access to the document.
- Renderability is the extractor: Without server-rendered static HTML, fast retrieval agents fail to capture passage text during live search queries.
- Index hygiene is the disambiguator: Without clean canonicals and sitemaps, retrieval models encounter fragmented signals and duplicate nodes.

However, EXP-014 explicitly explores the reality that while crawler access is a mandatory prerequisite, it is NOT sufficient on its own to generate citations. Across the six canonical AI search systems evaluated in DIXITH research—Google AI Overview, ChatGPT, Perplexity, Claude, Gemini, and Microsoft Copilot—citation frequency is governed by:
- Semantic passage density
- Structured entity graph disambiguation (GUI-001)
- Source authority and consensus validation
- Prompt alignment and synthesis logic

This guide establishes the verified, standards-compliant server and crawler infrastructure upon which the ongoing empirical investigations of EXP-014 are conducted.`;
