import { GuideEntityModel, isIndexable } from "./types";

/**
 * Canonical Implementation Guides Registry for DIXITH
 * Evergreen technical architectures, practical frameworks, and implementation resources.
 * Structural draft items are maintained for architecture verification and static routing.
 */
export const GUIDES: GuideEntityModel[] = [
  {
    id: "GUI-001",
    slug: "schema-org-entity-graph-implementation",
    title: "Implementing Structured Entity Graphs with Schema.org",
    category: "Technical Architecture",
    summary:
      "Architectural implementation guide for establishing connected Schema.org entity graphs, canonical node disambiguation, and JSON-LD integration.",
    status: "DRAFT",
    authorId: "AUT-001",
    readTime: "14 min",
    readingTime: "14 min",
    difficultyLevel: "INTERMEDIATE",
    topics: ["TOP-002", "TOP-006"],
    targetSystems: [
      "Google AI Overview",
      "ChatGPT",
      "Perplexity",
      "Claude",
      "Gemini",
      "Microsoft Copilot",
    ],
    prerequisites: [
      "Deep understanding of JSON-LD (JavaScript Object Notation for Linked Data) syntax and specification",
      "Familiarity with Schema.org type inheritance (Thing -> CreativeWork -> TechArticle)",
      "Access to root layout template head injection or component-level schema generation (e.g., Next.js App Router)",
      "Familiarity with official Schema.org specifications (SRC-001) and Google Search Central structured data documentation (SRC-002)",
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Define the Root Entity Identity",
        description:
          "Establish the canonical Person or Organization node with a permanent @id fragment (e.g. https://example.com/#person, where example.com is a placeholder for your canonical domain). Using an absolute URI combined with a fragment identifier anchors the entity across all site pages and external knowledge bases, preventing parsers from generating isolated, anonymous entity duplicates.",
        codeSnippet: {
          language: "json",
          code: `{\n  "@context": "https://schema.org",\n  "@type": "Person",\n  "@id": "https://example.com/#person",\n  "name": "Dixith Kumar",\n  "jobTitle": "AI Search & Technical SEO Architect",\n  "url": "https://example.com",\n  "sameAs": [\n    "https://github.com/dixitkumar837-sketch",\n    "https://www.linkedin.com/in/dixithkumar"\n  ],\n  "knowsAbout": [\n    "AI Search Retrieval",\n    "Technical SEO",\n    "Knowledge Graphs",\n    "Schema.org Structured Data"\n  ]\n}`,
        },
      },
      {
        stepNumber: 2,
        title: "Model WebSite and WebPage Hierarchies",
        description:
          "Construct reciprocal relationships between the WebSite container node and individual WebPage nodes. The WebSite represents the overarching digital publication (with publisher pointing to the root Person/Organization), while each WebPage uses isPartOf to link back to the WebSite and mainEntityOfPage to ground its core subject matter.",
        codeSnippet: {
          language: "json",
          code: `[\n  {\n    "@type": "WebSite",\n    "@id": "https://example.com/#website",\n    "url": "https://example.com",\n    "name": "Knowledge Platform",\n    "description": "Independent technical research and engineering platform for AI search systems.",\n    "publisher": {\n      "@id": "https://example.com/#person"\n    },\n    "inLanguage": "en-US"\n  },\n  {\n    "@type": "WebPage",\n    "@id": "https://example.com/guides/schema-org-entity-graph-implementation#webpage",\n    "url": "https://example.com/guides/schema-org-entity-graph-implementation",\n    "name": "Implementing Structured Entity Graphs with Schema.org",\n    "isPartOf": {\n      "@id": "https://example.com/#website"\n    },\n    "about": {\n      "@id": "https://example.com/#person"\n    },\n    "inLanguage": "en-US"\n  }\n]`,
        },
      },
      {
        stepNumber: 3,
        title: "Ground Deep Entities and Author References",
        description:
          "Bind specific content nodes (such as TechArticle, Article, or Guide) directly to the root entity using typed @id pointers ({ \"@id\": \"https://example.com/#person\" }) rather than duplicating entire inline Person definitions. This establishes clear provenance, avoids property synchronization drift, and keeps the document payload lightweight.",
        codeSnippet: {
          language: "json",
          code: `{\n  "@type": "TechArticle",\n  "@id": "https://example.com/guides/schema-org-entity-graph-implementation#article",\n  "isPartOf": {\n    "@id": "https://example.com/guides/schema-org-entity-graph-implementation#webpage"\n  },\n  "headline": "Implementing Structured Entity Graphs with Schema.org",\n  "description": "Architectural implementation guide for establishing connected Schema.org entity graphs, canonical node disambiguation, and JSON-LD integration.",\n  "inLanguage": "en-US",\n  "mainEntityOfPage": "https://example.com/guides/schema-org-entity-graph-implementation",\n  "author": {\n    "@id": "https://example.com/#person"\n  },\n  "publisher": {\n    "@id": "https://example.com/#person"\n  },\n  "proficiencyLevel": "Intermediate",\n  "dependencies": "Understanding of JSON-LD data structures and Schema.org type inheritance."\n}`,
        },
      },
      {
        stepNumber: 4,
        title: "Assemble the Unified @graph Structure",
        description:
          "Consolidate all discrete JSON-LD nodes into a single root @graph array within a single script tag. Placing interconnected nodes within a unified @graph array enables parsers to resolve forward and backward @id references deterministically without relying on script tag execution order or DOM traversal.",
        codeSnippet: {
          language: "json",
          code: `{\n  "@context": "https://schema.org",\n  "@graph": [\n    {\n      "@type": "Person",\n      "@id": "https://example.com/#person",\n      "name": "Dixith Kumar",\n      "jobTitle": "AI Search & Technical SEO Architect",\n      "url": "https://example.com"\n    },\n    {\n      "@type": "WebSite",\n      "@id": "https://example.com/#website",\n      "url": "https://example.com",\n      "name": "Knowledge Platform",\n      "publisher": { "@id": "https://example.com/#person" }\n    },\n    {\n      "@type": "WebPage",\n      "@id": "https://example.com/guides/schema-org-entity-graph-implementation#webpage",\n      "url": "https://example.com/guides/schema-org-entity-graph-implementation",\n      "isPartOf": { "@id": "https://example.com/#website" }\n    },\n    {\n      "@type": "TechArticle",\n      "@id": "https://example.com/guides/schema-org-entity-graph-implementation#article",\n      "headline": "Implementing Structured Entity Graphs with Schema.org",\n      "author": { "@id": "https://example.com/#person" },\n      "publisher": { "@id": "https://example.com/#person" },\n      "mainEntityOfPage": { "@id": "https://example.com/guides/schema-org-entity-graph-implementation#webpage" }\n    }\n  ]\n}`,
        },
      },
      {
        stepNumber: 5,
        title: "Validate and Debug Node Disambiguation Across Parsers",
        description:
          "Systematically validate the graph using Schema.org Validator (to confirm strict syntactic and vocabulary compliance) and Google Rich Results Test (to verify Google feature compatibility). Ensure every referenced @id pointer resolves to an existing node in the graph, canonical URLs match exactly, and the structured data accurately represents the user-visible content.",
        codeSnippet: {
          language: "text",
          code: `VALIDATION PROTOCOL CHECKLIST:\n1. Schema.org Validator (validator.schema.org):\n   - Confirm zero JSON syntax errors.\n   - Verify all @type definitions match official Schema.org vocabulary.\n2. Google Rich Results Test (search.google.com/test/rich-results):\n   - Verify required and recommended fields for supported Google features.\n3. Reference Resolution:\n   - Check that every target URI referenced via @id exists within the graph array.\n4. Content Parity:\n   - Verify headlines, author names, dates, and descriptions match visible page text.`,
        },
      },
    ],
    body: `1. What this guide solves

In modern search engine and answer engine architectures, structured data often degenerates into a disjointed collection of standalone JSON-LD snippets. A developer might add an Organization block on the homepage, a BreadcrumbList on category pages, and an Article block on blog posts. While each block is syntactically valid in isolation, they frequently fail to declare how they relate to one another.

When structured data is fragmented into unconnected objects, search engine parsers must rely on heuristics to determine whether the "Person" named in an article author field is the same individual who owns the website or publishes research on another domain. 

An entity graph solves this problem by shifting from isolated schema annotations to a unified, interconnected semantic network. Instead of creating redundant, anonymous nodes on every page, an entity graph establishes stable identifiers (@id) for core entities—such as a Person, Organization, WebSite, and WebPage—and links them through explicit relationship edges (such as author, publisher, isPartOf, and mainEntityOfPage).

This guide provides a comprehensive architectural framework for engineering structured entity graphs using Schema.org specifications (SRC-001) and Google Search Central structured data documentation (SRC-002).

Crucially, implementing structured data does NOT guarantee:
- Automatic inclusion in search engine Knowledge Panels
- Direct citations or answer extraction in generative AI engines (Google AI Overview, ChatGPT, Perplexity, Claude, Gemini, Microsoft Copilot)
- Improved search rankings or crawl frequency
- Automatic qualification for rich snippet features

What it does provide is absolute semantic clarity: a deterministic, machine-readable model of your content, author identity, and topical scope that eliminates parsing ambiguity.


2. Prerequisites

Before deploying an enterprise-grade entity graph, verify that your technical environment supports the following capabilities:

- Deep understanding of JSON-LD syntax: JSON-LD (JavaScript Object Notation for Linked Data) is the W3C standard format recommended by Google Search Central for structured data. You must be comfortable with JSON object nesting, arrays, and standard data types.
- Familiarity with Schema.org type inheritance: Schema.org operates on an object-oriented type hierarchy where every entity inherits from Thing. For example, TechArticle inherits from Article, which inherits from CreativeWork, which inherits from Thing. Understanding this inheritance ensures you select the most specific applicable type without inventing invalid properties.
- Access to root template head injection: You must have the ability to inject structured JSON-LD payloads into the document head or server-rendered DOM. In modern frameworks like Next.js App Router, this is accomplished via server components rendering script tags with dangerouslySetInnerHTML.
- Verification tooling access: Immediate access to the Schema.org Validator (validator.schema.org) for universal RDF/JSON-LD validation and Google Rich Results Test for search-feature specific conformance.


3. Entity identity architecture

The foundational principle of any knowledge graph is unambiguous identity. In Schema.org JSON-LD, entity identity is governed by the @id keyword.

An @id is a Uniform Resource Identifier (URI) that serves as the globally unique, permanent identifier for a node. Without an @id, an entity is considered an anonymous node ("blank node"). If five articles on your website define an inline author object with name "Dixith Kumar" without an @id, a search engine parser sees five distinct anonymous person instances who happen to share a name.

To establish stable identity architecture:
1. Anchor @id values to your canonical base URL: Always prefix entity identifiers with your primary canonical domain (e.g., https://example.com).
   IMPORTANT NOTE ON TEACHING EXAMPLES: Throughout this guide, all illustrative URIs use "https://example.com" (e.g., https://example.com/#person). "example.com" is an IANA-reserved placeholder domain used solely for instruction. In your implementation, you must replace every occurrence of "https://example.com" with your website's actual, verified canonical domain. Avoid protocol-relative URLs (//example.com) or temporary deployment/staging URLs.
2. Use standardized URI fragments: Differentiate real-world entities from web documents using fragment identifiers. For example, https://example.com/#person denotes the living individual, https://example.com/#website denotes the digital platform, and https://example.com/guides/schema-org-entity-graph-implementation#webpage denotes the specific HTML document.
3. Separate the entity from the document: A person is not an HTML document, and an organization is not a URL. Conflating a Person with a WebPage by assigning the same URL as the @id causes semantic collision.
4. Leverage sameAs for external disambiguation: Use the sameAs property on Person and Organization entities to link to authoritative third-party entities, such as Wikidata items, official GitHub organizations, LinkedIn profiles, or academic identifiers (ORCID). This enables search engines to reconcile your identity with existing global knowledge bases.


4. Building the root entity

Every entity graph should have one or more authoritative root entities representing the primary publisher or author. For a personal portfolio or expert knowledge platform, the root entity is a Schema.org Person. For a company, it is an Organization.

When modeling the root Person entity, include properties that establish professional identity, canonical presence, and topical focus:
- @type: Set to "Person".
- @id: A permanent fragment URL (e.g., "https://example.com/#person").
- name: The canonical full name of the individual.
- url: The primary homepage or authoritative author profile URL (e.g., "https://example.com").
- jobTitle: Professional title representing current technical focus.
- sameAs: Array of external profile URLs on authoritative platforms (e.g., GitHub, LinkedIn, Google Scholar, Wikidata).
- knowsAbout: Array of core technical topics or domain entities in which the individual has demonstrated expertise.
- worksFor or affiliation: Optional pointer to an Organization node establishing institutional or enterprise context.

By establishing this complete root definition once, every subsequent article, research paper, guide, or case study can reference this entity using { "@id": "https://example.com/#person" } rather than re-declaring properties on every page.


5. Modeling WebSite and WebPage

A common error in structured data implementation is treating a website as a collection of isolated pages with no overarching container. In Schema.org, a WebSite entity represents the overarching publication, while individual WebPage entities represent the distinct documents within it.

The relationship between WebSite and WebPage must be reciprocal and explicit:
- WebSite Node (@type: "WebSite"):
  - @id: "https://example.com/#website"
  - url: "https://example.com"
  - name: The title of the platform.
  - publisher: Points to the root Person or Organization via @id ({ "@id": "https://example.com/#person" }).
- WebPage Node (@type: "WebPage"):
  - @id: "https://example.com/guides/schema-org-entity-graph-implementation#webpage"
  - url: The canonical URL of the current page.
  - isPartOf: Explicitly points back to the WebSite container ({ "@id": "https://example.com/#website" }).
  - about: Points to the primary subject matter of the page (which may be the root Person or a specific Topic).
  - mainEntity: Pointers to the primary creative work or article hosted on this page.

This hierarchical modeling creates a clear navigation and ownership tree for search engine crawlers: the Document belongs to the Website, which is published by the Author.


6. Connecting authors and deeper entities

When publishing substantive content—such as technical articles, research papers, or implementation guides—you must connect the creative work to the document hosting it and the author who created it.

Using Schema.org TechArticle (a specialized subtype of Article designed for technical documentation):
- Set @id to a fragment of the article URL (e.g., "https://example.com/guides/schema-org-entity-graph-implementation#article").
- Set isPartOf or mainEntityOfPage to point to the WebPage node.
- Set author to { "@id": "https://example.com/#person" }.
- Set publisher to { "@id": "https://example.com/#person" } (or your Organization node).
- Specify technical prerequisites using the dependencies property.
- Specify target technical difficulty using proficiencyLevel (e.g., "Beginner", "Intermediate", "Advanced").

Note on search engine feature eligibility: Using TechArticle provides precise semantic categorization for technical documentation under Schema.org vocabulary (SRC-001). However, Google does not offer a standalone rich-result feature exclusive to TechArticle; it processes technical articles under general Article guidelines (SRC-002). Marking up an article with TechArticle does not guarantee rich snippet display, enhanced search presentation, or preferential indexing.

By referencing the root Person by @id rather than duplicating the entire Person block, you guarantee that any updates to your author profile (such as new sameAs links or updated titles) propagate across all referencing content without requiring site-wide schema rewrites.


7. Using @graph correctly

Traditional structured data implementations often inject multiple independent <script type="application/ld+json"> blocks into a page—one for breadcrumbs, one for the article, one for the author, and one for the organization.

While parsers can technically parse multiple script tags, this practice introduces severe architectural disadvantages:
1. Execution and parsing race conditions: Parsers cannot guarantee the evaluation order of independent script blocks, leading to unresolved forward references if an Article in script block 1 references a Person declared in script block 2.
2. DOM bloat: Repeating Schema.org boilerplate across multiple script tags inflates the HTML payload.
3. Lack of graph coherence: Disconnected blocks make it difficult for developers and automated linters to inspect the relational integrity of the page.

The Schema.org @graph array solves this by grouping all entity nodes for a page inside a single root JSON-LD object:
{
  "@context": "https://schema.org",
  "@graph": [
    { /* Person node */ },
    { /* WebSite node */ },
    { /* WebPage node */ },
    { /* TechArticle node */ }
  ]
}

Inside the @graph array, order does not matter. The parser ingests all nodes into an in-memory graph and resolves all @id pointers simultaneously.


8. Validation and debugging

Validating a structured entity graph requires a multi-stage quality assurance protocol. Never deploy structured data to production based solely on browser console absence of errors.

Follow this systematic testing sequence:

Step 1: Syntax Validation
Verify that the JSON payload is strictly valid. Common syntax errors include trailing commas, unescaped quotation marks in string bodies, and invalid control characters.

Step 2: Schema.org Vocabulary Validation
Submit your rendered HTML to the official Schema.org Validator (validator.schema.org). The validator checks that all property names exist on their declared @type in the Schema.org vocabulary. Pay close attention to warnings regarding deprecated properties or domain/range mismatches (e.g., assigning a string where an entity pointer is expected).

Step 3: Google Search Conformance
Submit the page to the Google Rich Results Test (search.google.com/test/rich-results). Google enforces strict requirements that go beyond the basic Schema.org vocabulary. For example, Google Article features require specific properties (such as image, datePublished, and dateModified) to qualify for enhanced search displays. Note that Google evaluates eligibility algorithmically; schema presence satisfies technical syntax requirements but does not guarantee rich result appearance in search results.

Step 4: Referential Integrity Audit
Manually inspect every @id pointer in your graph:
- Does every { "@id": "URI" } reference correspond to an actual node defined in the graph or accessible on the canonical homepage?
- Are there any broken fragments (e.g., pointing to /#author when the node was defined with @id: /#person)?
- Are canonical URLs matching the HTTP response headers and rel="canonical" link tag?

Step 5: Visual Content Parity Audit
Google structured data guidelines (SRC-002) explicitly require that structured data accurately represents the user-visible content on the page. If your JSON-LD claims an author, datePublished, or technical headline that does not appear in the rendered HTML, your page is vulnerable to structured data algorithmic suppression.


9. Common implementation mistakes

During architectural audits of enterprise websites, the following anti-patterns appear frequently:

1. Dynamic or Unstable @id Values
Generating random GUIDs, database row IDs, or build timestamps as @id fragments (e.g., /#person-98234a17b) prevents search engines from recognizing the entity across multiple crawls. @id values must remain deterministic, static, and permanent.

2. Anonymous Duplicate Person Nodes
Inlining { "@type": "Person", "name": "Dixith Kumar" } on hundreds of pages without an @id creates hundreds of orphaned person nodes in the search index, diluting entity authority and confusing disambiguation algorithms.

3. Canonical URL Inconsistency
Using HTTP in schema while the site serves HTTPS, or omitting the trailing slash in schema when the canonical URL enforces trailing slashes. The base URI of your @id must exactly match the resolved canonical document URL.

4. Schema Cloaking and Hidden Text
Adding properties, ratings, or biographical claims into JSON-LD that are completely absent from the rendered DOM. Structured data is an annotation layer for visible content, not an invisible channel for keyword stuffing.

5. Treating Structured Data as a Ranking Guarantee
Believing that adding comprehensive schema guarantees first-page rankings, AI answer citations, or instant Knowledge Panels. Search engine ranking systems evaluate hundreds of signals; schema merely provides semantic clarity.


10. Implementation checklist

Before promoting structured entity graphs to production:

- [ ] Root Person or Organization node defined with deterministic @id (e.g., /#person)
- [ ] Authoritative external profiles linked via sameAs array (GitHub, LinkedIn, Wikidata)
- [ ] WebSite node established with publisher pointer to root entity
- [ ] WebPage node established with isPartOf pointer to WebSite
- [ ] Content entity (TechArticle or Article) points to WebPage via mainEntityOfPage
- [ ] Author and publisher properties reference the root entity via @id pointer
- [ ] All page nodes unified inside a single @graph array in one script tag
- [ ] Base URLs in @id exactly match canonical link tags and HTTP response headers
- [ ] Passed Schema.org Validator with 0 errors
- [ ] Passed Google Rich Results Test with 0 critical errors
- [ ] 100% content parity verified between JSON-LD properties and visible DOM text


11. What structured entity graphs can and cannot establish

To maintain engineering integrity, technical architects must maintain a realistic understanding of what structured data accomplishes:

SUPPORTED CAPABILITIES:
- Explicit machine-readable identity: Provides search engine parsers with an unambiguous declaration of who published the page and what it contains.
- Deterministic relationship modeling: Explicitly connects author to article, article to publication, and publication to domain.
- Cross-platform entity disambiguation: Enables reconciliation with external knowledge graphs (Wikidata, Wikipedia, Google Knowledge Graph).
- Vocabulary standardization: Uses globally recognized W3C/Schema.org schemas (SRC-001) that all major search crawlers understand.

UNSUPPORTED & NON-GUARANTEED OUTCOMES:
- Guaranteed search ranking increases: Google has repeatedly stated that structured data is not a direct ranking factor.
- Guaranteed AI engine citations: Generative engines (ChatGPT, Claude, Perplexity, Gemini, Copilot) select citation sources based on vector retrieval, topical authority, and synthesized relevance, not solely structured data presence.
- Guaranteed Knowledge Panel generation: Google Knowledge Panels are generated algorithmically based on broad consensus across independent web sources; adding schema to your own site is insufficient on its own.
- Automatic rich snippet display: Google search algorithms dynamically decide whether to render rich snippets based on query intent, user location, and algorithmic trust thresholds.


12. DIXITH research connection

The principles outlined in this guide directly inform the ongoing laboratory research conducted within the DIXITH AI Search Lab.

Specifically, research protocol EXP-013 ("How Entities Influence AI Search Visibility") is currently evaluating to what degree unambiguous Schema.org entity graphs correlate with entity representation and citation accuracy across generative answer engines.

IMPORTANT NOTE:
EXP-013 is currently in IN_REVIEW status. Its empirical data collection and correlation analyses across Google AI Overview, ChatGPT, Perplexity, Claude, Gemini, and Microsoft Copilot are actively undergoing verification. Therefore, the findings of EXP-013 must NOT be cited or treated as established empirical evidence at this stage.

This guide provides the foundational, verified engineering standard (grounded in SRC-001 and SRC-002) upon which future empirical research observations will be evaluated.`,
    entityReferences: [
      { type: "research", id: "EXP-013", relation: "applies" },
    ],
    relatedResearchIds: ["EXP-013"],
    sourceIds: ["SRC-001", "SRC-002"],
  },
  {
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
          "Explicitly configure permissions for Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, GPTBot, ClaudeBot, and the Google-Extended control token in robots.txt. Distinguish real-time search retrieval crawlers from foundational model training scrapers, avoiding global disallow rules that unintentionally sever conversational search citations.",
        codeSnippet: {
          language: "text",
          code: `# https://example.com/robots.txt
# Allow search & real-time AI retrieval; disallow model pre-training scraping

User-agent: Googlebot
User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /admin/

User-agent: OAI-SearchBot
User-agent: PerplexityBot
Allow: /
Disallow: /api/
Disallow: /admin/

User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
Disallow: /

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml`,
        },
      },
      {
        stepNumber: 2,
        title: "Enforce Fine-Grained Indexation and Snippet Controls via HTTP Headers",
        description:
          "Deploy X-Robots-Tag HTTP response headers at the server or CDN edge to govern indexing, snippet length, and preview extraction independently of robots.txt. Ensure pages requiring de-indexation are allowed in robots.txt so crawlers can fetch the noindex directive.",
        codeSnippet: {
          language: "text",
          code: `# Nginx HTTP Header Configuration for Public Production Routes
location / {
    # Permit full-length text extraction for search snippets and AI answers
    add_header X-Robots-Tag "max-snippet:-1, max-image-preview:large, max-video-preview:-1" always;
}

# Staging & Internal Route Protection (Edge Header Injection)
location /staging/ {
    add_header X-Robots-Tag "noindex, nofollow" always;
}`,
        },
      },
      {
        stepNumber: 3,
        title: "Eliminate Client-Side DOM Rendering Bottlenecks",
        description:
          "Server-rendered or statically generated HTML can make important content available in the initial HTTP response without depending on client-side JavaScript execution. This can simplify crawling and retrieval, but crawler behavior and rendering capabilities vary by system.",
        codeSnippet: {
          language: "typescript",
          code: `// Next.js App Router: Static Semantic Server Component
// Delivers primary semantic content in the initial HTTP response stream
export default async function GuidePage({ params }: { params: { slug: string } }) {
  const guide = await getGuideData(params.slug);
  return (
    <article className="prose prose-invert max-w-none">
      <h1>{guide.title}</h1>
      <p className="lead">{guide.summary}</p>
      <section dangerouslySetInnerHTML={{ __html: guide.renderedHtml }} />
    </article>
  );
}`,
        },
      },
      {
        stepNumber: 4,
        title: "Standardize Canonical URLs and Dynamic XML Sitemaps",
        description:
          "Enforce absolute, self-referential canonical tags across all indexable routes, normalize trailing slashes with permanent 301 redirects, and generate dynamic XML sitemaps containing exclusively 200 OK canonical endpoints with accurate lastmod dates while omitting drafts and staging URLs.",
        codeSnippet: {
          language: "xml",
          code: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Canonical production URLs only; no redirects, 404s, or drafts -->
  <url>
    <loc>https://example.com/guides/crawler-access-and-index-hygiene-for-ai-search</loc>
    <lastmod>2026-03-24</lastmod>
  </url>
</urlset>`,
        },
      },
      {
        stepNumber: 5,
        title: "Establish Bot Verification and Edge Protection Policies",
        description:
          "Implement provider-specific verification (such as Google's two-step reverse DNS lookup or published CIDR IP blocks for other providers) and tune edge WAF rate-limiting rules. Because User-Agent headers can be spoofed, rely on verified network identity rather than headers alone.",
        codeSnippet: {
          language: "bash",
          code: `# Googlebot Verification via Two-Step Reverse DNS (Google-Specific)
CRAWLER_IP="66.249.66.1"

# Step 1: Query PTR record for domain name
HOST_NAME=$(host $CRAWLER_IP | awk '{print $NF}' | sed 's/\.$//')
echo "Resolved Hostname: $HOST_NAME"

# Step 2: Forward lookup to confirm IP match
FORWARD_IP=$(host $HOST_NAME | awk '{print $NF}')
if [ "$CRAWLER_IP" = "$FORWARD_IP" ]; then
    echo "VERIFIED: Genuine Googlebot crawler from $HOST_NAME"
else
    echo "SPOOFED: IP $CRAWLER_IP does not match forward lookup $FORWARD_IP"
fi`,
        },
      },
    ],
    body: `1. What this guide solves

As search engines shift from keyword-indexed link directories toward Retrieval-Augmented Generation (RAG) and generative answer synthesis, technical SEO architects face a new paradigm in crawl accessibility and index hygiene.

In modern AI search ecosystems—encompassing Google AI Overview, ChatGPT, Perplexity, Claude, Gemini, and Microsoft Copilot—crawling operations are divided across distinct functional objectives: general search indexation, real-time conversational retrieval, and foundation model pre-training data management.

Without an intentional crawler access architecture and disciplined index hygiene, websites encounter two critical failure modes:
- Inadvertent Search Exclusion: Overly broad robots.txt disallow rules or aggressive edge WAF rate-limiting inadvertently sever connections to real-time retrieval bots, causing content to be excluded from conversational search results and citations.
- Index Contamination: Fragmented canonical tags, client-side rendering bottlenecks, or unmanaged staging deployments allow incomplete, duplicate, or private data to enter retrieval candidate pools.

This guide provides an architectural specification for configuring crawler access, structuring robots.txt directives, enforcing HTTP response headers, managing rendering considerations, and standardizing sitemap pipelines.

CRITICAL NON-GUARANTEE NOTICE:
Configuring crawler access and index hygiene is an absolute architectural prerequisite for retrieval, but it does NOT guarantee:
- Inclusion in Google AI Overviews or rich snippet features
- Direct citations, quotes, or source links in ChatGPT, Perplexity, Claude, Gemini, or Microsoft Copilot
- Favorable algorithmic ranking, recommendation, or preferential crawl scheduling
- Knowledge Graph inclusion or entity graph validation
Crawl accessibility ensures that search engine and AI agent bots have permission and capability to fetch and parse page content. Inclusion in generated responses depends entirely on downstream semantic retrieval algorithms, query relevance, factual authority, and model reasoning.

DOMAIN IMPLEMENTATION NOTICE:
All example URLs, hostnames, and robots.txt paths in this guide use the RFC 2606 / IANA reserved placeholder domain https://example.com. You must replace https://example.com with your site's verified production domain during actual deployment. Never deploy example.com configurations to production environments.


2. Crawler categories: search/retrieval vs training/data collection vs general search

A fundamental error in modern technical SEO is treating all automated crawlers as a monolithic group. Crawler purposes, operational scopes, and supported controls are provider-specific rather than governed by a single universal standard.

To structure access policies clearly, this guide organizes automated crawlers into three functional categories:

Category A: General Web Search Crawlers (e.g., Googlebot, Bingbot)
These crawlers discover, crawl, and index web pages to build comprehensive inverted indexes. Crucially, these general search indexes serve as the foundational retrieval corpus for search-grounded AI features. Google AI Overviews retrieve passages directly from the primary Google Search index populated by Googlebot, and Microsoft Copilot retrieves passages from the Bing index populated by Bingbot. Blocking general search crawlers removes your site from standard organic search results and all derived AI search features.

Category B: Dedicated AI Search and Real-Time Retrieval Crawlers (e.g., OAI-SearchBot, PerplexityBot)
These crawlers operate in direct support of conversational search features and real-time RAG. When a user submits a query in a conversational interface (such as ChatGPT Search or Perplexity), these bots fetch live web pages to ground answers in verified, current source documents. They do not build offline model training datasets; their mission is immediate retrieval and source attribution. Allowing retrieval crawlers enables content discovery and referral citations in conversational search interfaces.

Category C: AI Training and Data Collection Controls (e.g., GPTBot, ClaudeBot, Google-Extended)
These crawlers and control tokens conduct large-scale, asynchronous web scraping or data management to assemble text corpora for training foundation models. Restricting training data collection prevents proprietary research and editorial content from being absorbed into foundational model weights without compensation, while having zero negative impact on visibility in standard search engines or real-time search citations.

Recognizing these functional categories allows technical architects to implement nuanced access policies aligned with provider-specific controls, rather than forcing a false choice between total content exposure and complete search obscurity.


3. Current documented crawler identities

To configure access policies accurately, engineering teams must rely exclusively on official documentation published directly by crawler operators, rather than secondary speculation.

| User-Agent Token | Organization | Primary Purpose | Control Mechanism | Official Source |
| :--- | :--- | :--- | :--- | :--- |
| Googlebot | Google | General search indexation & AI Overview retrieval | robots.txt / X-Robots-Tag | Google Search Central (SRC-005) |
| Google-Extended | Google | Control token for Gemini & Vertex AI model training | robots.txt User-agent token | Google Search Central (SRC-005) |
| GPTBot | OpenAI | Data collection for training & fine-tuning OpenAI models | robots.txt User-agent token | OpenAI Documentation (SRC-003) |
| OAI-SearchBot | OpenAI | Real-time web retrieval for search features in ChatGPT | robots.txt User-agent token | OpenAI Documentation (SRC-003) |
| ClaudeBot | Anthropic | Automated data collection for training Claude models | robots.txt User-agent token | Anthropic Documentation (SRC-004) |
| PerplexityBot | Perplexity AI | Web crawling, indexation & real-time answer grounding | robots.txt User-agent token | Perplexity Documentation (SRC-006) |

Operational Distinctions:
- Googlebot handles standard Google indexation. Google AI Overviews retrieve content indexed by Googlebot rather than deploying a standalone crawler. Disallowing Googlebot removes the site from Google Search entirely.
- Google-Extended is a robots.txt control token, not an independent HTTP user-agent string or standalone network crawler. Google Search Central (SRC-005) documents that web publishers can use the Google-Extended token in robots.txt to manage whether content is used to train Gemini and Vertex AI generative models. Disallowing Google-Extended does not affect crawling or indexing by Googlebot, nor does it impact a site's presence or ranking in Google Search or Google AI Overviews.
- GPTBot (SRC-003) scrapes public web data to train OpenAI models. Disallowing GPTBot withholds content from foundational training pipelines.
- OAI-SearchBot (SRC-003) is used strictly for conversational search retrieval in ChatGPT Search. It does not train models. Blocking it prevents citation links in ChatGPT Search.
- ClaudeBot (SRC-004) collects data to train Anthropic models. Controlled via User-agent: ClaudeBot. (Anthropic also operates Claude-Web for user-directed browsing).
- PerplexityBot (SRC-006) indexes web content and fetches real-time data for Perplexity search answers and citation links.


4. robots.txt fundamentals and RFC 9309 protocol rules

The Robots Exclusion Protocol, standardized in RFC 9309, governs how automated web crawlers interpret access permissions on web servers:

- Record Structure & Specificity: A robots.txt file contains record groups starting with User-agent lines, followed by Allow or Disallow rules. Crawlers look for their specific token (case-insensitively). If an exact match exists (e.g. User-agent: GPTBot), the crawler obeys ONLY that group, completely ignoring the generic User-agent: * group. If no specific match exists, it falls back to User-agent: *.
- Path Matching: Prefix matching applies from the start of the URI path. Disallow: /private matches /private, /private/, and /private-draft.html. Trailing slashes enforce directory boundaries: Disallow: /private/ matches /private/doc.html but not /private-draft.html.
- Wildcards: Asterisk (*) matches zero or more characters. Dollar sign ($) marks the path end (e.g., Disallow: /*.pdf$).
- Precedence and Conflict Resolution: Under RFC 9309, if Allow and Disallow directives match the same URL within a group, the directive with the most specific (longest character length) path pattern takes precedence. For /research/open-access/paper.html, Allow: /research/open-access/ (22 chars) overrides Disallow: /research/ (10 chars).
- Provider-Specific Precedence: While RFC 9309 standardizes the core format, individual search engines document specific parsing rules. For Google crawlers, Google documents that the most specific rule based on character length of the path pattern applies, and if conflicting Allow and Disallow rules have equal length, Google defaults to Allow. Other crawlers may implement varying fallback behaviors when encountering equal-length conflicts.
- Scope & Status: robots.txt is valid only on its exact protocol, hostname, and port. The file must return HTTP 200 OK with Content-Type: text/plain. A 5xx error suspends crawling across the host; a 404 error implies no crawl restrictions exist.


5. Search vs training access strategy: Scenarios A, B, C, and D

Every organization must determine its own balance between public reach, intellectual property protection, and server resource allocation. There is no single universal robots.txt configuration that is ideal for all websites. The following four operational scenarios represent distinct strategic postures:

Scenario A: Maximum Openness (Universal Access)
- Target Profile: Open-access academic repositories, public documentation libraries, developer knowledge hubs, and open-source projects.
- Architecture: Unrestricted access for general search engines, AI retrieval crawlers, and AI training scrapers across public routes.
- Trade-offs: Maximizes presence in foundation model pre-training corpora and real-time retrieval citations; provides zero protection against uncompensated commercial data harvesting.

Scenario B: Retrieval Allowed, Training Blocked (Selective AI Access)
- Target Profile: Commercial publishers, independent research institutions, software companies, and media organizations that value search referral traffic and AI citations, but decline to contribute uncompensated pre-training data.
- Architecture: Allow Googlebot, Bingbot, OAI-SearchBot, and PerplexityBot. Disallow GPTBot, ClaudeBot, and the Google-Extended control token.
- Trade-offs: Preserves live search visibility and referral traffic while establishing an explicit boundary against offline model training datasets. Requires active monitoring as bot tokens and provider controls evolve.

Scenario C: Traditional Search Preservation (Block Dedicated AI Crawlers)
- Target Profile: Organizations that rely exclusively on traditional organic search engine referral models and actively opt out of all standalone generative AI answer engines.
- Architecture: Allow Googlebot and Bingbot. Disallow GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, and the Google-Extended control token.
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

# 3. Dedicated AI Training & Scraping Controls (Blocks Model Training Data)
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
A frequent cause of inadvertent AI search exclusion is an aggressive WAF rule that misidentifies legitimate retrieval bots (such as OAI-SearchBot or PerplexityBot) as malicious scrapers, issuing automated 403 Forbidden or JavaScript CAPTCHA challenges. Because automated retrieval bots do not solve interactive CAPTCHAs, retrieval fails instantly. Because User-Agent strings can easily be spoofed, security teams should configure WAF rules using provider-documented IP ranges or verified network identities rather than relying purely on user-agent headers.


8. Rendering and AI retrieval: the cost of client-side execution

In conversational AI search and RAG retrieval pipelines, document retrieval latency is critical. When a user prompts an AI search interface, the backend retrieval agent has a finite time window to query an index, fetch live URLs, extract candidate passages, synthesize facts, and stream the response.

Server-rendered or statically generated HTML can make important content available in the initial HTTP response without depending on client-side JavaScript execution. This can simplify crawling and retrieval, but crawler behavior and rendering capabilities vary by system.

The Considerations of Client-Side Rendering (CSR):
When a website is built as a pure Client-Side Rendered Single Page Application, the initial HTTP response body returned to a crawler contains minimal content:
<!DOCTYPE html>
<html>
  <head><title>App</title></head>
  <body>
    <div id="root"></div>
    <script src="/static/bundle.js"></script>
  </body>
</html>

While Googlebot maintains a headless Chromium rendering pipeline capable of executing client-side JavaScript, this rendering occurs in a secondary, asynchronous queue that may be delayed depending on crawl budget and server load.

Furthermore, specialized AI retrieval bots and automated fetchers often utilize streamlined HTTP retrieval pipelines that parse raw HTML directly to minimize latency during live conversational turns. If primary text, research data, headings, and schema are injected exclusively via client-side hydration, fetchers that parse only the initial HTML payload may capture an empty container div.

The Architecture: Server-Side Rendering (SSR) and Static Site Generation (SSG)
Architecting public content layers with SSR or SSG (e.g., Next.js App Router Server Components) ensures that primary informational passages, heading hierarchies, and citation sources are delivered directly in the initial HTML document payload. This eliminates dependency on client-side JavaScript execution, although actual retrieval and citation inclusion remain governed by each system's algorithmic relevance and ranking models.

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
An XML sitemap is a declaration of your site's canonical indexable assets. Submitting dirty sitemaps wastes crawl budget and sends conflicting quality signals.
- Status Code: Every URL in sitemap.xml must return HTTP 200 OK. Never include 301/302 redirects, 404 Not Found, or 500 Server Errors.
- Canonical Alignment: Every URL must match its self-referential canonical tag character-for-character.
- Indexability: Never list URLs that carry noindex meta tags or X-Robots-Tag headers.
- Status Filtering: Dynamic sitemaps must automatically exclude DRAFT, IN_REVIEW, ARCHIVED, or internal staging documents.
- Supported Metadata: Include accurate <loc> and <lastmod> timestamps. Major search engines like Google document that <priority> and <changefreq> values are ignored during crawl scheduling; focus exclusively on canonical URL accuracy and fresh lastmod dates.
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
- Item 3 (Provider-Specific Crawler Verification): Because User-Agent request headers are easily spoofed, verify crawler authenticity using provider-documented methods. For Google crawlers, execute Google's documented two-step reverse DNS lookup (PTR lookup resolving to googlebot.com or google.com, followed by forward DNS confirmation). For other providers such as OpenAI, Anthropic, or Perplexity, consult their official documentation for published CIDR IP blocks or network verification, as verification mechanisms are provider-specific.
- Item 4 (Disallow vs Noindex): Ensure URLs intended for de-indexation are NOT blocked in robots.txt so crawlers can fetch the noindex tag.
- Item 5 (HTTP Response Headers): Run curl -I https://example.com/guides/target-article to confirm edge headers do not inject unintended noindex directives.
- Item 6 (Initial HTML Payload): Run curl -s https://example.com/guides/target-article | grep -i "primary heading" to confirm text exists in the raw HTTP response without relying on client-side JavaScript.
- Item 7 (Canonical Tag Integrity): Confirm <link rel="canonical"> exactly matches the requested URL, including protocol, domain, and trailing slashes.
- Item 8 (XML Sitemap Audit): Verify programmatically that 100% of URLs in https://example.com/sitemap.xml return HTTP 200 OK and zero redirects.
- Item 9 (CDN/WAF Log Audit): Review edge firewall logs for 403 Forbidden or 429 Too Many Requests responses served to legitimate AI retrieval bots.
- Item 10 (Asset Accessibility): Verify CSS, JavaScript, and web font paths are not blocked by robots.txt Disallow directives.
- Item 11 (Search Console Monitoring): Review crawl stats and coverage reports in Google Search Console to detect server errors, DNS failures, or crawl drops.


11. Common mistakes and anti-patterns: 9 documented failure modes

Review your production setup against these 9 pervasive architectural mistakes:

- Anti-Pattern 1 (Disallow Noindex Trap): Blocking a path in robots.txt while placing a noindex tag on the page. The crawler cannot fetch the page, misses the tag, and retains the URL listing in search results.
- Anti-Pattern 2 (Blocking Rendering Assets): Adding Disallow: /css/, Disallow: /js/, or Disallow: /_next/. This blinds headless browsers to page styling and layout, leading to degraded rendering evaluations.
- Anti-Pattern 3 (Over-Reliance on Client-Side Rendering): Serving empty container divs (<div id="root">) where primary content requires client-side JavaScript execution. Because crawler rendering capabilities and execution budgets vary widely across systems, relying entirely on client hydration can impede content discovery compared to serving server-rendered or static HTML.
- Anti-Pattern 4 (Relative Canonical URLs): Using <link rel="canonical" href="/article" /> instead of absolute URIs (https://example.com/article), which can lead to canonical confusion across subdomains or CDNs.
- Anti-Pattern 5 (Trailing Slash Inconsistency): Permitting both https://example.com/guide and https://example.com/guide/ to return duplicate 200 OK responses instead of a permanent 301 canonical redirect.
- Anti-Pattern 6 (Overzealous WAF Bot Filtering): Configuring aggressive WAF challenge rules that flag automated AI retrieval bots as threats, issuing 403 Forbidden headers to legitimate search agents.
- Anti-Pattern 7 (Assuming robots.txt Protects Secrets): Publishing sensitive URLs in robots.txt Disallow directives. robots.txt is completely public; protect private endpoints with HTTP authentication (401/403).
- Anti-Pattern 8 (Conflating Training Controls and Retrieval Bots): Attempting to block AI training by placing a blanket Disallow: / on all AI tokens, inadvertently blocking OAI-SearchBot and PerplexityBot and severing conversational search citations.
- Anti-Pattern 9 (Permitting Staging Leaks): Deploying preview branches without automated X-Robots-Tag: noindex headers, causing staging versions to compete against production URLs.


12. Implementation checklist

Follow this sequential checklist to audit, deploy, and maintain your crawler access architecture:

Phase 1: Strategic Policy Selection
- Determine your organization's AI posture: Scenario A (Open), Scenario B (Retrieval Only / Training Blocked), Scenario C (Traditional Search Only), or Scenario D (Lockdown).
- Align stakeholders on whether foundational training bots and tokens (GPTBot, ClaudeBot, Google-Extended) should be permitted or restricted.

Phase 2: robots.txt Authoring and Deployment
- Construct robots.txt adhering strictly to RFC 9309 group and path specificity rules.
- Explicitly configure user-agent blocks for Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, GPTBot, ClaudeBot, and the Google-Extended control token according to your chosen strategy.
- Verify that all asset paths required for rendering (CSS, JS, fonts) remain accessible.
- Declare the absolute production sitemap URL (https://example.com/sitemap.xml) at the bottom of the file.

Phase 3: HTTP Header & Edge WAF Configuration
- Configure edge rules to inject X-Robots-Tag: max-snippet:-1, max-image-preview:large on public pages.
- Configure staging environments to inject X-Robots-Tag: noindex, nofollow on all responses.
- Audit CDN WAF rules to ensure verified search and retrieval bots are not challenged by CAPTCHAs.

Phase 4: Rendering and DOM Architecture
- Deliver primary text, headings, author metadata, and structured data in the initial server HTML response (SSR/SSG).
- Confirm clean semantic HTML structure (<article>, <main>, <header>, <section>).

Phase 5: Canonical & Sitemap Standardization
- Verify that every published page outputs an absolute, self-referential canonical tag.
- Automate dynamic XML sitemap generation to include strictly 200 OK, canonical, indexable URLs with accurate lastmod dates.
- Ensure non-published states (DRAFT, IN_REVIEW, ARCHIVED) are programmatically excluded from sitemaps.

Phase 6: Post-Deployment Verification
- Test live robots.txt retrieval across multiple user-agents.
- Verify crawler identities using provider-specific verification methods (such as Google rDNS or published IP ranges).
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
- Renderability and Initial Delivery: Server-rendered or statically generated HTML makes key text available on initial request, reducing dependency on client-side JavaScript execution queues.
- Index hygiene is the disambiguator: Without clean canonicals and sitemaps, retrieval models encounter fragmented signals and duplicate nodes.

However, EXP-014 explicitly explores the reality that while crawler access is a mandatory prerequisite, it is NOT sufficient on its own to generate citations. Across the six canonical AI search systems evaluated in DIXITH research—Google AI Overview, ChatGPT, Perplexity, Claude, Gemini, and Microsoft Copilot—citation frequency is governed by:
- Semantic passage density
- Structured entity graph disambiguation (GUI-001)
- Source authority and consensus validation
- Prompt alignment and synthesis logic

This guide establishes the verified, standards-compliant server and crawler infrastructure upon which the ongoing empirical investigations of EXP-014 are conducted.`,
    entityReferences: [
      { type: "research", id: "EXP-014", relation: "applies" },
    ],
    relatedResearchIds: ["EXP-014"],
    sourceIds: ["SRC-003", "SRC-004", "SRC-005", "SRC-006"],
  }
];

export function getAllGuides(): GuideEntityModel[] {
  return GUIDES;
}

export function getGuideBySlug(slug: string): GuideEntityModel | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function getGuideById(id: string): GuideEntityModel | undefined {
  return GUIDES.find((guide) => guide.id === id);
}

export function getPublishedGuides(): GuideEntityModel[] {
  return GUIDES.filter((guide) => isIndexable(guide.status));
}
