import * as fs from "fs";
import * as path from "path";
import { QueryDefinition, QueryRegistryMetadata, CANONICAL_AI_SEARCH_SYSTEMS } from "../data/research-protocol-types";

const queries: QueryDefinition[] = [
  // =========================================================================
  // CATEGORY 1: FACTUAL (Q-001 to Q-016)
  // =========================================================================
  {
    id: "Q-001",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What is the HTTP status code for Moved Permanently according to RFC 9110?",
    intent: "Verify direct answer extraction and primary standards specification attribution.",
    expectedObservables: [
      "answer presence",
      "direct numerical value (301)",
      "citation count",
      "RFC/IETF official citation",
      "citation rendering format"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "IETF RFC 9110 standards specification ground truth.",
    expectedEntityAnchors: ["HTTP 301", "RFC 9110", "IETF"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-002",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What is the maximum character length of a single standard DNS label?",
    intent: "Test factual numeric retrieval from networking standards specifications.",
    expectedObservables: [
      "answer presence",
      "direct numerical value (63 octets/characters)",
      "citation count",
      "RFC 1035 citation",
      "claim association"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "RFC 1035 Domain Names - Implementation and Specification.",
    expectedEntityAnchors: ["DNS label", "63 characters", "RFC 1035"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-003",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "Which organization maintains the official Schema.org vocabulary?",
    intent: "Evaluate organizational entity attribution for semantic web standards.",
    expectedObservables: [
      "answer presence",
      "organization entity naming (Schema.org Community Group / W3C)",
      "official domain citation (schema.org)",
      "citation position"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Schema.org is an open community activity with a W3C Community Group.",
    expectedEntityAnchors: ["Schema.org", "W3C Community Group"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-004",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What is the default TCP port used for secure HTTPS web connections?",
    intent: "Verify standard networking port retrieval and authoritative documentation citation.",
    expectedObservables: [
      "answer presence",
      "direct numerical answer (Port 443)",
      "citation count",
      "IANA or official documentation citation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "IANA Service Name and Transport Protocol Port Number Registry.",
    expectedEntityAnchors: ["Port 443", "HTTPS", "TCP"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-005",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What does the robots.txt disallow directive with an empty value mean for web crawlers?",
    intent: "Assess technical interpretation of standard robots exclusion syntax.",
    expectedObservables: [
      "answer presence",
      "semantic explanation (allows all crawling / clears disallow)",
      "RFC 9309 citation",
      "search engine documentation attribution"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "RFC 9309 Section 2.2.2 Disallow with empty value.",
    expectedEntityAnchors: ["Disallow: ", "RFC 9309", "crawling allowed"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-006",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What is the recommended maximum uncompressed file size for an XML sitemap file?",
    intent: "Test numerical specification extraction for web publishing standards.",
    expectedObservables: [
      "answer presence",
      "direct numerical value (50MB)",
      "sitemaps.org official protocol citation",
      "distinct cited domains"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Sitemaps XML format protocol specifies 50MB and 50,000 URLs limit.",
    expectedEntityAnchors: ["50MB", "sitemaps.org", "XML Sitemap"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-007",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What date format standard is required by the Schema.org datePublished property?",
    intent: "Verify ISO standard identification in structured data property specifications.",
    expectedObservables: [
      "answer presence",
      "standards citation (ISO 8601 / RFC 3339)",
      "example date formatting syntax",
      "schema.org citation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Schema.org Date and DateTime primitive types require ISO 8601 formatting.",
    expectedEntityAnchors: ["ISO 8601", "datePublished", "Schema.org"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-008",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What is the purpose of the hreflang x-default attribute value in international web architecture?",
    intent: "Evaluate technical definition retrieval for internationalization link headers.",
    expectedObservables: [
      "answer presence",
      "fallback/neutral language explanation",
      "official search engine documentation citation",
      "claim association"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Google Search Central international targeting documentation.",
    expectedEntityAnchors: ["x-default", "hreflang", "international targeting"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-009",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "Which HTTP header is used by web servers to declare a canonical URL relation for non-HTML files?",
    intent: "Verify HTTP protocol header specification retrieval for canonical links.",
    expectedObservables: [
      "answer presence",
      "header name syntax (Link: <url>; rel=\"canonical\")",
      "RFC 5988 / RFC 8288 citation",
      "developer documentation citation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "RFC 8288 Web Linking header implementation for PDFs and media.",
    expectedEntityAnchors: ["Link header", "rel=canonical", "RFC 8288"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-010",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What does the HTTP 429 Too Many Requests response code signify to web crawlers?",
    intent: "Test rate-limiting response code definition retrieval and crawler backoff implications.",
    expectedObservables: [
      "answer presence",
      "rate limiting / throttling explanation",
      "Retry-After header mention",
      "RFC 6585 citation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "RFC 6585 Additional HTTP Status Codes.",
    expectedEntityAnchors: ["HTTP 429", "Rate Limit", "Retry-After", "RFC 6585"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-011",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What is the official MIME media type recommended for JSON-LD structured data documents?",
    intent: "Verify W3C JSON-LD specification media type extraction.",
    expectedObservables: [
      "answer presence",
      "exact MIME string (application/ld+json)",
      "W3C Recommendation citation",
      "citation format"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "W3C JSON-LD 1.1 specification defines application/ld+json.",
    expectedEntityAnchors: ["application/ld+json", "W3C", "JSON-LD 1.1"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-012",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "Which standards consortium publishes official Recommendations for semantic web technologies like RDF and OWL?",
    intent: "Test standards governance entity extraction and official consortium attribution.",
    expectedObservables: [
      "answer presence",
      "organization entity name (World Wide Web Consortium / W3C)",
      "official w3.org domain citation",
      "response length"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "W3C Semantic Web activity.",
    expectedEntityAnchors: ["W3C", "RDF", "OWL", "World Wide Web Consortium"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-013",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What is the default user-agent token specified in robots.txt to apply directives to all web crawlers?",
    intent: "Verify wild-card crawler token extraction from RFC 9309.",
    expectedObservables: [
      "answer presence",
      "asterisk wildcard token (*)",
      "RFC 9309 citation",
      "directive examples"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "RFC 9309 Section 2.2.1 User-Agent line syntax.",
    expectedEntityAnchors: ["User-agent: *", "wildcard", "RFC 9309"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-014",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What is the standard XML root element name for an individual XML sitemap document?",
    intent: "Test XML schema element retrieval for sitemaps protocol.",
    expectedObservables: [
      "answer presence",
      "XML element name (<urlset>)",
      "sitemap namespace URL (http://www.sitemaps.org/schemas/sitemap/0.9)",
      "sitemaps.org citation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Sitemap 0.9 XML schema definition.",
    expectedEntityAnchors: ["<urlset>", "sitemaps.org", "XML namespace"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-015",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What is the technical difference between HTTP 301 and HTTP 308 redirect status codes?",
    intent: "Evaluate HTTP method preservation distinction retrieval across RFC 9110 specifications.",
    expectedObservables: [
      "answer presence",
      "HTTP method preservation explanation (POST to POST vs potential GET rewrite)",
      "RFC 9110 citation",
      "source authority distribution"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "RFC 9110 Section 15.4.9 (308 Permanent Redirect) vs 15.4.2 (301 Moved Permanently).",
    expectedEntityAnchors: ["HTTP 308", "HTTP 301", "method preservation", "RFC 9110"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-016",
    experimentId: "EXP-001",
    category: "FACTUAL",
    query: "What is the maximum number of URLs permitted in a single XML sitemap file by the sitemaps.org standard?",
    intent: "Test numeric constraint extraction from official protocol documentation.",
    expectedObservables: [
      "answer presence",
      "exact numerical value (50,000 URLs)",
      "sitemaps.org protocol citation",
      "citation position"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Sitemaps protocol maximum URL capacity specification.",
    expectedEntityAnchors: ["50,000 URLs", "sitemaps.org", "sitemap index"],
    temporalSensitivity: "STATIC"
  },

  // =========================================================================
  // CATEGORY 2: EXPLANATORY (Q-017 to Q-032)
  // =========================================================================
  {
    id: "Q-017",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "How does Retrieval-Augmented Generation combine document retrieval with parametric language models?",
    intent: "Examine explanation structure, technical depth, and citation patterns for modern RAG architecture.",
    expectedObservables: [
      "answer presence",
      "multi-stage pipeline explanation (retrieval, augmentation, generation)",
      "academic or technical documentation citations",
      "citation count",
      "response length"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Foundational AI search architecture topic based on Lewis et al. (2020).",
    expectedEntityAnchors: ["Retrieval-Augmented Generation", "dense retrieval", "parametric model"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-018",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "How do search engine crawlers allocate crawl budget across large enterprise websites?",
    intent: "Measure explanation depth regarding server response capacity, crawl demand, and crawl rate limits.",
    expectedObservables: [
      "answer presence",
      "distinction between crawl demand and crawl capacity",
      "search engine engineering documentation citations",
      "domain authority distribution"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Google Search Central crawl budget guide for large sites.",
    expectedEntityAnchors: ["crawl budget", "crawl rate limit", "crawl demand"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-019",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "Why does client-side JavaScript rendering introduce indexing latency compared to server-side rendering?",
    intent: "Evaluate technical explanation of search engine rendering queues and headless browser resource costs.",
    expectedObservables: [
      "answer presence",
      "two-wave indexing / rendering queue explanation",
      "browser resource constraints mention",
      "developer documentation citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Technical SEO rendering pipeline mechanics.",
    expectedEntityAnchors: ["client-side rendering", "two-wave indexing", "render queue", "SSR"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-020",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "How does vector search utilize dense embeddings to match semantic intent beyond lexical keyword matching?",
    intent: "Analyze conceptual explanation of vector spaces, cosine similarity, and semantic representations.",
    expectedObservables: [
      "answer presence",
      "vector space / embedding model explanation",
      "distance metric mentions (cosine, dot product)",
      "technical blog or academic citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Information retrieval and dense vector indexing.",
    expectedEntityAnchors: ["dense embeddings", "cosine similarity", "vector search", "semantic intent"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-021",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "What mechanisms do web crawlers use to detect and avoid infinite crawl loops in dynamic web applications?",
    intent: "Evaluate algorithmic explanation of URL normalization, path depth heuristics, and content fingerprinting.",
    expectedObservables: [
      "answer presence",
      "pattern detection techniques (depth limits, URL repetition, simhash)",
      "search crawler documentation citations",
      "claim association"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Web crawler engineering and graph traversal limits.",
    expectedEntityAnchors: ["crawl loop", "URL normalization", "spider trap"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-022",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "How does reciprocal rank fusion merge ranked search results from lexical and semantic retrieval pipelines?",
    intent: "Test mathematical and conceptual explanation of hybrid retrieval rank aggregation.",
    expectedObservables: [
      "answer presence",
      "reciprocal rank formula explanation (1 / (k + rank))",
      "IR research citations",
      "distinct cited domains"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Cormack et al. (2009) Reciprocal Rank Fusion research.",
    expectedEntityAnchors: ["Reciprocal Rank Fusion", "RRF", "hybrid search", "lexical ranking"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-023",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "Why is entity disambiguation critical when extracting knowledge graph triples from unstructured web text?",
    intent: "Evaluate knowledge representation explanations, polysemy handling, and URI assignment.",
    expectedObservables: [
      "answer presence",
      "polysemy / homonym explanation",
      "URI / entity ID assignment concepts",
      "semantic web or computer science citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Knowledge graph construction and Information Extraction.",
    expectedEntityAnchors: ["entity disambiguation", "knowledge graph", "semantic triple", "URI"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-024",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "How do generative answer engines decide whether to trigger external web retrieval for a user prompt?",
    intent: "Measure explanation depth regarding query classification, parametric confidence thresholds, and freshness triggers.",
    expectedObservables: [
      "answer presence",
      "query classifier / intent detection mention",
      "confidence / freshness trigger discussion",
      "visible uncertainty in engine explanations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Generative search orchestration and selective retrieval routing.",
    expectedEntityAnchors: ["retrieval trigger", "query classification", "freshness detection"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-025",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "What is the relationship between Schema.org structured data and knowledge graph entity reconciliation?",
    intent: "Evaluate explanation of explicit semantic types, sameAs linking, and entity resolution.",
    expectedObservables: [
      "answer presence",
      "sameAs URI resolution explanation",
      "graph linking concepts",
      "W3C or Schema.org documentation citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Structured data to entity graph mapping.",
    expectedEntityAnchors: ["Schema.org", "entity reconciliation", "sameAs", "knowledge graph"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-026",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "How does progressive hydration work in modern web frameworks and how does it impact search bot crawling?",
    intent: "Assess explanation of HTML streaming, JavaScript payload chunking, and bot interaction rendering.",
    expectedObservables: [
      "answer presence",
      "hydration mechanism explanation",
      "crawler HTML parsing vs JS execution differences",
      "framework documentation citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Modern web architecture and bot crawlability.",
    expectedEntityAnchors: ["progressive hydration", "island architecture", "web crawler"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-027",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "Why do AI search engines sometimes exhibit citation hallucination or attribution mismatch during text generation?",
    intent: "Examine how engines explain technical causes of source misattribution, attention drift, and context compression.",
    expectedObservables: [
      "answer presence",
      "mechanisms of hallucination (context window loss, attention misattribution)",
      "academic research citations",
      "neutrality of self-evaluation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Attribution fidelity in LLM synthesis.",
    expectedEntityAnchors: ["citation hallucination", "attribution mismatch", "attention mechanism"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-028",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "How does the canonical link tag resolve duplicate content issues caused by dynamic URL parameters?",
    intent: "Evaluate technical SEO explanation of URL clustering, link equity consolidation, and crawler directive handling.",
    expectedObservables: [
      "answer presence",
      "canonical URL consolidation explanation",
      "search engine documentation citations",
      "citation rendering format"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Google Search Central canonicalization guide.",
    expectedEntityAnchors: ["rel=canonical", "URL parameters", "duplicate content"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-029",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "What role do semantic tokens and self-attention mechanisms play in determining passage relevance for search?",
    intent: "Test deep learning explanation of transformer attention weights, token embeddings, and cross-encoders.",
    expectedObservables: [
      "answer presence",
      "transformer self-attention explanation",
      "passage relevance scoring concepts",
      "academic citations (Vaswani et al. / BERT)"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Neural information retrieval foundations.",
    expectedEntityAnchors: ["self-attention", "tokens", "passage relevance", "transformers"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-030",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "How do crawler access policies in robots.txt interact with HTTP X-Robots-Tag response headers?",
    intent: "Assess explanation of crawl prevention vs indexation prevention precedence rules.",
    expectedObservables: [
      "answer presence",
      "critical nuance: robots.txt blocks crawling so headers cannot be seen",
      "Google Search Central citations",
      "claim association"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Standard technical SEO precedence: robots.txt Disallow prevents crawler from reading X-Robots-Tag.",
    expectedEntityAnchors: ["robots.txt", "X-Robots-Tag", "crawl vs index precedence"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-031",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "Why do search engines evaluate Core Web Vitals and how do these metrics relate to real-user page experience?",
    intent: "Evaluate explanation of field data (CrUX), user engagement metrics, and mobile performance ranking factors.",
    expectedObservables: [
      "answer presence",
      "core metrics list (LCP, CLS, INP)",
      "web.dev / official documentation citations",
      "distinct cited domains"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Google Core Web Vitals and Page Experience documentation.",
    expectedEntityAnchors: ["Core Web Vitals", "LCP", "INP", "CLS", "web.dev"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-032",
    experimentId: "EXP-001",
    category: "EXPLANATORY",
    query: "How do generative engines handle contradictory factual claims retrieved from different web sources?",
    intent: "Measure explanation of multi-perspective synthesis, consensus weighting, and epistemic uncertainty markers.",
    expectedObservables: [
      "answer presence",
      "synthesis strategy explanation (presenting multiple views, source authority weighting)",
      "visible uncertainty or qualification phrases",
      "response structure"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Multi-document summarization and conflict resolution in RAG.",
    expectedEntityAnchors: ["contradictory sources", "consensus weighting", "source authority"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },

  // =========================================================================
  // CATEGORY 3: COMPARISON (Q-033 to Q-048)
  // =========================================================================
  {
    id: "Q-033",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "What are the structural differences between JSON-LD and Microdata for implementing Schema.org structured data?",
    intent: "Evaluate comparative table/list structure, technical accuracy, and source selection for markup formats.",
    expectedObservables: [
      "answer presence",
      "structured comparative points (script separation vs inline HTML attributes)",
      "W3C and Google Search Central citations",
      "citation rendering format"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "W3C JSON-LD vs HTML5 Microdata specification comparison.",
    expectedEntityAnchors: ["JSON-LD", "Microdata", "Schema.org", "W3C"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-034",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "How does Server-Side Rendering compare to Static Site Generation regarding search crawler ingestion efficiency?",
    intent: "Compare web rendering architectures for TTFB, server compute overhead, and crawler indexation velocity.",
    expectedObservables: [
      "answer presence",
      "balanced trade-off analysis (pre-rendered build vs dynamic request rendering)",
      "developer documentation citations",
      "response structure"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Web performance and crawler ingestion comparison.",
    expectedEntityAnchors: ["SSR", "SSG", "TTFB", "crawler ingestion"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-035",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "What is the difference between BM25 lexical ranking and dense vector semantic retrieval in modern search systems?",
    intent: "Examine comparative depth on exact term matching, vocabulary mismatch problem, and compute cost.",
    expectedObservables: [
      "answer presence",
      "term frequency/IDF vs semantic embedding comparison",
      "computational trade-off analysis",
      "information retrieval citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Classic IR BM25 vs dense bi-encoder vector retrieval.",
    expectedEntityAnchors: ["BM25", "dense vector retrieval", "lexical vs semantic", "inverted index"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-036",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "How do noindex meta tags differ from robots.txt Disallow directives in search indexation management?",
    intent: "Evaluate critical technical distinction: crawling prohibition vs indexing prevention.",
    expectedObservables: [
      "answer presence",
      "explicit distinction that Disallow does not prevent URL indexation if linked externally",
      "official search engine documentation citations",
      "claim association"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Core technical SEO concept frequently misunderstood by webmasters.",
    expectedEntityAnchors: ["noindex", "robots.txt Disallow", "indexing prevention"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-037",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "What are the technical trade-offs between monolithic CMS platforms and headless CMS architectures for enterprise SEO?",
    intent: "Assess balanced comparative evaluation of API rendering complexity, metadata management, and performance.",
    expectedObservables: [
      "answer presence",
      "balanced pros and cons structure",
      "enterprise technical SEO citations",
      "distinct cited domains"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Enterprise content architecture comparison.",
    expectedEntityAnchors: ["monolithic CMS", "headless CMS", "enterprise SEO"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-038",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "How do traditional web search SERP snippets compare to generative AI summary overviews in user interaction?",
    intent: "Measure comparative analysis of click-through patterns, zero-click behavior, and attribution visibility.",
    expectedObservables: [
      "answer presence",
      "direct answer vs organic list comparison",
      "industry research citations",
      "neutrality of perspective"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Evolution from classic blue links to generative AI overviews.",
    expectedEntityAnchors: ["SERP snippet", "generative AI overview", "zero-click search"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-039",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "What is the difference between absolute canonical URLs and relative canonical URLs in web implementation?",
    intent: "Test technical best practice comparison for canonical link declaration robustness.",
    expectedObservables: [
      "answer presence",
      "risk analysis of protocol/domain inheritance in relative URLs",
      "RFC 5988 / Search Central citations",
      "citation rendering format"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Search engine recommendation to use absolute canonical URLs.",
    expectedEntityAnchors: ["absolute canonical URL", "relative canonical URL", "RFC 8288"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-040",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "How does an inverted index compare to an HNSW graph index in vector and search databases?",
    intent: "Evaluate database architecture comparison between keyword posting lists and approximate nearest neighbor graphs.",
    expectedObservables: [
      "answer presence",
      "structural comparison (posting lists vs proximity graphs)",
      "complexity and search latency analysis",
      "computer science documentation citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Search indexing structures: Lucene inverted index vs HNSW ANN graphs.",
    expectedEntityAnchors: ["inverted index", "HNSW graph", "approximate nearest neighbor", "vector database"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-041",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "What are the operational differences between 301 permanent redirects and 302 temporary redirects for search engines?",
    intent: "Compare PageRank/link equity transfer, indexing URL replacement, and caching behavior.",
    expectedObservables: [
      "answer presence",
      "canonical URL replacement timeline comparison",
      "HTTP specification and search engine documentation citations",
      "claim association"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Canonical URL handling across redirect types.",
    expectedEntityAnchors: ["HTTP 301", "HTTP 302", "link equity", "canonical replacement"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-042",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "How do standard XML sitemaps compare to RSS/Atom feeds for search engine content discovery?",
    intent: "Evaluate comparative utility of bulk URL inventories vs real-time freshness update feeds.",
    expectedObservables: [
      "answer presence",
      "comparative analysis (bulk index coverage vs incremental freshness discovery)",
      "Google Search Central citations",
      "distinct cited domains"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Search engine crawling discovery mechanisms.",
    expectedEntityAnchors: ["XML sitemap", "RSS feed", "Atom feed", "content discovery"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-043",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "What is the difference between Schema.org Rich Results and standard organic search rankings?",
    intent: "Compare visual SERP enhancements, structured data eligibility, and standard ranking algorithm factors.",
    expectedObservables: [
      "answer presence",
      "distinction between visual SERP features and organic position ranking",
      "search documentation citations",
      "response length"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Rich snippet visual enhancement vs core algorithmic ranking.",
    expectedEntityAnchors: ["Rich Results", "organic rankings", "Schema.org", "SERP features"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-044",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "How does client-side JavaScript execution cost compare between mobile search bots and desktop search crawlers?",
    intent: "Assess technical comparison of mobile user-agent viewport rendering, CPU throttling, and resource allocation.",
    expectedObservables: [
      "answer presence",
      "mobile-first indexing context",
      "resource constraints discussion",
      "technical SEO engineering citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Crawler rendering budgets and mobile-first indexing constraints.",
    expectedEntityAnchors: ["JavaScript execution cost", "mobile search bot", "desktop crawler", "WRS"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-045",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "What are the structural and functional differences between Open Graph protocol metadata and Schema.org structured data?",
    intent: "Compare social sharing card rendering with semantic entity graph machine-readability.",
    expectedObservables: [
      "answer presence",
      "social card preview vs search engine semantic graph comparison",
      "ogp.me and schema.org citations",
      "citation rendering format"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Open Graph Protocol (Facebook/social) vs Schema.org (search/semantic).",
    expectedEntityAnchors: ["Open Graph", "Schema.org", "social meta tags", "semantic entity"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-046",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "How does exact keyword matching compare to neural query expansion in modern retrieval systems?",
    intent: "Evaluate comparative trade-offs between precision, recall, and semantic drift in search engines.",
    expectedObservables: [
      "answer presence",
      "precision vs recall trade-off explanation",
      "vocabulary mismatch resolution vs semantic hallucination risk",
      "information retrieval literature citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Lexical precision vs neural semantic recall.",
    expectedEntityAnchors: ["exact keyword matching", "query expansion", "precision and recall"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-047",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "What is the difference between HTTP/2 multiplexing and HTTP/1.1 pipelining for web crawling efficiency?",
    intent: "Compare network protocol concurrency, head-of-line blocking, and crawler connection overhead.",
    expectedObservables: [
      "answer presence",
      "TCP connection reuse and head-of-line blocking comparison",
      "RFC 9113 (HTTP/2) citation",
      "claim association"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "HTTP/2 protocol impact on search engine crawling throughput.",
    expectedEntityAnchors: ["HTTP/2 multiplexing", "HTTP/1.1 pipelining", "head-of-line blocking", "RFC 9113"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-048",
    experimentId: "EXP-001",
    category: "COMPARISON",
    query: "How do edge rendering architectures compare to origin server rendering for global search engine performance?",
    intent: "Assess comparative analysis of CDN edge compute latency, cache invalidation complexity, and dynamic routing.",
    expectedObservables: [
      "answer presence",
      "edge vs origin latency comparison (TTFB, geo-distribution)",
      "cache management trade-offs",
      "cloud computing documentation citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Edge computing (Cloudflare Workers, Vercel Edge) vs central origin servers.",
    expectedEntityAnchors: ["edge rendering", "origin server", "CDN", "TTFB"],
    temporalSensitivity: "MODERATE_DRIFT"
  },

  // =========================================================================
  // CATEGORY 4: ENTITY (Q-049 to Q-064)
  // =========================================================================
  {
    id: "Q-049",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "Who founded the World Wide Web Consortium (W3C) and what is its primary governance mission?",
    intent: "Test entity recognition, historical founder identification, and official organizational mission extraction.",
    expectedObservables: [
      "answer presence",
      "founder naming (Tim Berners-Lee)",
      "official w3.org domain citation",
      "governance mission description"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Founded in 1994 at MIT LCS.",
    expectedEntityAnchors: ["Tim Berners-Lee", "World Wide Web Consortium", "W3C", "1994"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-050",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is Schema.org and which major search engine organizations originally founded it in 2011?",
    intent: "Verify multi-entity association and historical founding cohort identification.",
    expectedObservables: [
      "answer presence",
      "founding company list (Google, Microsoft, Yahoo!, Yandex)",
      "official schema.org citation",
      "founding year attribution (2011)"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Launched on June 2, 2011 by Google, Microsoft, Yahoo! (later joined by Yandex).",
    expectedEntityAnchors: ["Schema.org", "Google", "Microsoft", "Yahoo!", "Yandex", "2011"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-051",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is Wikidata and how does it relate to the Wikimedia Foundation knowledge graph ecosystem?",
    intent: "Test knowledge base entity extraction, collaborative editing model, and Wikidata item identifier concepts.",
    expectedObservables: [
      "answer presence",
      "Wikimedia Foundation organizational relationship",
      "wikidata.org official citation",
      "structured data / CC0 licensing mention"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Free, collaborative, multilingual, secondary database launched by Wikimedia Deutschland in 2012.",
    expectedEntityAnchors: ["Wikidata", "Wikimedia Foundation", "knowledge base", "QID"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-052",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the Google Knowledge Graph and when was it officially introduced by Google?",
    intent: "Evaluate entity recognition, historical launch date, and 'things not strings' philosophical framing.",
    expectedObservables: [
      "answer presence",
      "official announcement date (May 16, 2012)",
      "official Google blog citation",
      "'things not strings' concept mention"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Official announcement by Singhal (2012).",
    expectedEntityAnchors: ["Google Knowledge Graph", "2012", "things not strings"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-053",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the Internet Engineering Task Force (IETF) and how does it develop and publish RFC standards?",
    intent: "Examine standards body entity extraction, working group process, and RFC lifecycle.",
    expectedObservables: [
      "answer presence",
      "consensus and running code philosophy",
      "ietf.org official citation",
      "RFC document stages mention"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Open international community of network designers and operators.",
    expectedEntityAnchors: ["IETF", "Internet Engineering Task Force", "RFC", "rough consensus"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-054",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the National Institute of Standards and Technology (NIST) and what is its role in cybersecurity standards?",
    intent: "Test federal agency entity identification, CSF framework attribution, and official government domain citation.",
    expectedObservables: [
      "answer presence",
      "agency role and Cybersecurity Framework (NIST CSF) mention",
      "official nist.gov citation",
      "citation position"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "US Department of Commerce physical sciences laboratory and standards agency.",
    expectedEntityAnchors: ["NIST", "Cybersecurity Framework", "nist.gov"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-055",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the Apache Software Foundation and which open-source search engine technologies did it incubate?",
    intent: "Verify open-source foundation entity recognition and project attribution (Lucene, Solr, Nutch).",
    expectedObservables: [
      "answer presence",
      "key project names (Lucene, Solr, Nutch, Tika)",
      "apache.org official citation",
      "distinct cited domains"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Apache Lucene core search library and related ecosystem.",
    expectedEntityAnchors: ["Apache Software Foundation", "Apache Lucene", "Solr", "Nutch"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-056",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the Mozilla Developer Network (MDN Web Docs) and which organization maintains its documentation?",
    intent: "Evaluate web documentation platform entity extraction, stewardship, and official domain citation.",
    expectedObservables: [
      "answer presence",
      "Mozilla Foundation / Mozilla Corporation stewardship",
      "developer.mozilla.org citation",
      "open web documentation role"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Official repository for web standards documentation.",
    expectedEntityAnchors: ["MDN Web Docs", "Mozilla", "developer.mozilla.org"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-057",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the International Organization for Standardization (ISO) and what does the ISO 8601 standard specify?",
    intent: "Test international standards federation entity extraction and specific standard scope (date/time representation).",
    expectedObservables: [
      "answer presence",
      "ISO organizational description",
      "ISO 8601 date and time formatting specification",
      "official iso.org citation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "ISO 8601 standard for representation of dates and times.",
    expectedEntityAnchors: ["ISO", "ISO 8601", "date and time representation", "iso.org"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-058",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the Dublin Core Metadata Initiative (DCMI) and how is its metadata element set used in digital indexing?",
    intent: "Evaluate digital library standards organization entity recognition and 15 core elements attribution.",
    expectedObservables: [
      "answer presence",
      "15 core Dublin Core metadata elements mention",
      "dublincore.org citation",
      "library/archival indexing role"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "ISO 15836 and NISO Z39.85 standard metadata set.",
    expectedEntityAnchors: ["Dublin Core", "DCMI", "metadata element set", "dublincore.org"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-059",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the Unicode Consortium and what is the role of UTF-8 encoding in global web character representation?",
    intent: "Test character encoding consortium entity recognition and UTF-8 universal web adoption.",
    expectedObservables: [
      "answer presence",
      "Unicode Consortium mission",
      "UTF-8 variable-width character encoding role",
      "unicode.org official citation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Universal character set and encoding standard for the web.",
    expectedEntityAnchors: ["Unicode Consortium", "UTF-8", "character encoding", "unicode.org"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-060",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the Open Archives Initiative (OAI) and what is the purpose of the OAI-PMH protocol in digital libraries?",
    intent: "Assess academic metadata harvesting protocol entity identification and interoperability scope.",
    expectedObservables: [
      "answer presence",
      "OAI-PMH metadata harvesting definition",
      "openarchives.org citation",
      "repository interoperability explanation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Open Archives Initiative Protocol for Metadata Harvesting.",
    expectedEntityAnchors: ["Open Archives Initiative", "OAI-PMH", "metadata harvesting"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-061",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is Common Crawl and how is its open web repository utilized in search and AI language model training?",
    intent: "Examine 501(c)(3) entity extraction, open web crawl dataset structure (WARC files), and research utilization.",
    expectedObservables: [
      "answer presence",
      "Common Crawl organization description",
      "WARC/WET file format mentions",
      "commoncrawl.org citation",
      "AI pretraining dataset role"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Nonprofit organization that crawls the web and provides open datasets.",
    expectedEntityAnchors: ["Common Crawl", "open crawl data", "WARC", "commoncrawl.org"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-062",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the Internet Assigned Numbers Authority (IANA) and which global registries does it maintain?",
    intent: "Test core internet governance entity extraction (IP addresses, AS numbers, root DNS zone, protocol parameters).",
    expectedObservables: [
      "answer presence",
      "core registries (IP allocations, DNS root zone, protocol numbers)",
      "iana.org citation",
      "relationship with ICANN"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Operated by Public Technical Identifiers (PTI), an affiliate of ICANN.",
    expectedEntityAnchors: ["IANA", "ICANN", "DNS root zone", "protocol registries", "iana.org"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-063",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the Association for Computing Machinery (ACM) and what primary search and information retrieval conferences does it organize?",
    intent: "Evaluate academic society entity recognition and top IR conference identification (SIGIR, CIKM, WSDM).",
    expectedObservables: [
      "answer presence",
      "ACM organization description",
      "key conferences list (SIGIR, CIKM, WSDM)",
      "acm.org or SIGIR citation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Leading educational and scientific computing society.",
    expectedEntityAnchors: ["ACM", "SIGIR", "information retrieval conference", "acm.org"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-064",
    experimentId: "EXP-001",
    category: "ENTITY",
    query: "What is the Linux Foundation and what role does it play in open web, networking, and cloud native infrastructure?",
    intent: "Test nonprofit open-source entity extraction, project hosting (CNCF, OpenSSL, NodeJS), and governance role.",
    expectedObservables: [
      "answer presence",
      "Linux Foundation overview",
      "sub-foundations and projects (CNCF, OpenSSF)",
      "linuxfoundation.org official citation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Nonprofit consortium dedicated to fostering open technology projects.",
    expectedEntityAnchors: ["Linux Foundation", "CNCF", "open source infrastructure", "linuxfoundation.org"],
    temporalSensitivity: "STATIC"
  },

  // =========================================================================
  // CATEGORY 5: TECHNICAL (Q-065 to Q-080)
  // =========================================================================
  {
    id: "Q-065",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "How should a web developer implement a valid Schema.org Organization entity graph using JSON-LD?",
    intent: "Evaluate code snippet generation, JSON-LD syntax validity, and required Schema.org properties.",
    expectedObservables: [
      "answer presence",
      "valid JSON-LD code snippet",
      "core properties (@context, @type, @id, name, url, logo)",
      "Schema.org / Google Search Central citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Technical implementation guide for structured organization data.",
    expectedEntityAnchors: ["JSON-LD", "Organization", "Schema.org", "@context"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-066",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "What is the correct syntax for declaring an XML sitemap location within a robots.txt file?",
    intent: "Test exact directive syntax retrieval and case-sensitivity rules from RFC 9309.",
    expectedObservables: [
      "answer presence",
      "exact directive syntax (Sitemap: https://example.com/sitemap.xml)",
      "RFC 9309 citation",
      "absolute URL requirement mention"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "RFC 9309 Section 2.3 Sitemap directive.",
    expectedEntityAnchors: ["Sitemap: ", "robots.txt", "RFC 9309", "absolute URL"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-067",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "How do you configure reverse DNS lookup to verify legitimate Googlebot crawler requests?",
    intent: "Assess step-by-step procedural extraction for bot authentication (rDNS + forward DNS verification).",
    expectedObservables: [
      "answer presence",
      "two-step procedure: host/dig -x for PTR record, then forward lookup",
      "googlebot.com / google.com domain verification rules",
      "Google Search Central developer documentation citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Official verification procedure to prevent crawler spoofing.",
    expectedEntityAnchors: ["reverse DNS", "PTR record", "Googlebot verification", "forward DNS"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-068",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "What are the required and recommended properties for a valid Schema.org Article entity according to Google Search Central guidelines?",
    intent: "Verify technical documentation extraction for Rich Results eligibility criteria.",
    expectedObservables: [
      "answer presence",
      "required properties (headline, image, datePublished, author)",
      "Google Search Central citations",
      "structured list presentation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Google Search Central Article structured data documentation.",
    expectedEntityAnchors: ["Article", "headline", "datePublished", "author", "Google Search Central"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-069",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "How does the HTTP Vary: Accept-Encoding response header assist web crawlers with compressed assets?",
    intent: "Evaluate network caching header explanation and crawler content negotiation handling.",
    expectedObservables: [
      "answer presence",
      "cache key differentiation (gzip, br, identity)",
      "RFC 9110 citation",
      "crawler bandwidth optimization explanation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "RFC 9110 Section 12.5.5 Vary header.",
    expectedEntityAnchors: ["Vary: Accept-Encoding", "gzip", "Brotli", "RFC 9110"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-070",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "What is the recommended robots.txt directive syntax for disallowing specific URL query parameters while allowing clean paths?",
    intent: "Test wild-card pattern matching syntax in robots.txt according to RFC 9309.",
    expectedObservables: [
      "answer presence",
      "wildcard syntax examples (e.g., Disallow: /*?*sort=)",
      "RFC 9309 pattern matching citations",
      "developer guide citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "RFC 9309 Section 2.2.2 pattern matching with wildcard * and end-of-string $.",
    expectedEntityAnchors: ["robots.txt wildcard", "URL parameters", "RFC 9309"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-071",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "How do you correctly nest a PostalAddress object inside a Schema.org LocalBusiness JSON-LD markup?",
    intent: "Evaluate nested JSON-LD schema syntax generation and property correctness.",
    expectedObservables: [
      "answer presence",
      "valid nested JSON-LD code snippet",
      "correct address properties (streetAddress, addressLocality, addressRegion, postalCode, addressCountry)",
      "Schema.org citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Standard nested structured data implementation.",
    expectedEntityAnchors: ["LocalBusiness", "PostalAddress", "JSON-LD", "nested schema"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-072",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "What HTTP response status code should be served when a web page is permanently deleted with no intended replacement?",
    intent: "Verify technical HTTP status code recommendation (410 Gone vs 404 Not Found).",
    expectedObservables: [
      "answer presence",
      "HTTP 410 Gone recommendation",
      "comparison with HTTP 404",
      "RFC 9110 / Google Search Central citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "RFC 9110 Section 15.5.11 (410 Gone) signals permanent removal to crawlers faster than 404.",
    expectedEntityAnchors: ["HTTP 410 Gone", "HTTP 404", "RFC 9110", "permanent deletion"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-073",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "How do you configure hreflang link tags to handle bidirectional language and region targeting across multilingual pages?",
    intent: "Test international SEO syntax generation and reciprocal confirmation link rules.",
    expectedObservables: [
      "answer presence",
      "bidirectional reciprocity requirement explanation",
      "HTML link tag examples with rel=\"alternate\" and hreflang",
      "Search Central citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Google Search Central localized versions with hreflang.",
    expectedEntityAnchors: ["hreflang", "rel=alternate", "bidirectional linking", "international SEO"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-074",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "What is the proper implementation of the rel=canonical tag when dealing with a paginated content series?",
    intent: "Assess canonicalization best practice retrieval (self-referential canonical per page vs view-all).",
    expectedObservables: [
      "answer presence",
      "self-referential canonical recommendation for paginated components",
      "warning against pointing all paginated pages to page 1",
      "Google Search Central citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Paginated content canonicalization best practices.",
    expectedEntityAnchors: ["rel=canonical", "paginated content", "self-referential canonical"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-075",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "How can a web server configure Content-Security-Policy (CSP) headers without blocking search crawler validation tools?",
    intent: "Evaluate security header configuration advice and headless bot rendering considerations.",
    expectedObservables: [
      "answer presence",
      "CSP directives analysis (script-src, frame-ancestors, connect-src)",
      "impact on crawler JavaScript rendering engines",
      "MDN / W3C CSP citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "W3C Content Security Policy Level 3.",
    expectedEntityAnchors: ["Content-Security-Policy", "CSP", "search crawler", "headless browser"],
    temporalSensitivity: "MODERATE_DRIFT"
  },
  {
    id: "Q-076",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "What is the correct W3C date/time format for specifying the lastmod element in an XML sitemap?",
    intent: "Verify date formatting precision retrieval for XML sitemaps protocol.",
    expectedObservables: [
      "answer presence",
      "W3C Datetime / ISO 8601 formatting (YYYY-MM-DD or YYYY-MM-DDThh:mm:ss+00:00)",
      "sitemaps.org protocol citation",
      "claim association"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Sitemaps protocol XML schema specifies W3C Datetime format.",
    expectedEntityAnchors: ["lastmod", "W3C Datetime", "ISO 8601", "sitemaps.org"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-077",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "How do you implement Schema.org BreadcrumbList structured data to represent hierarchical site navigation in JSON-LD?",
    intent: "Evaluate hierarchical array syntax generation and ListItem position index numbering.",
    expectedObservables: [
      "answer presence",
      "valid JSON-LD code snippet with BreadcrumbList and itemListElement array",
      "position property starting at 1",
      "Schema.org / Google Search Central citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Google Search Central Breadcrumb structured data specification.",
    expectedEntityAnchors: ["BreadcrumbList", "ListItem", "itemListElement", "JSON-LD"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-078",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "What are the technical constraints and purpose of the Google-Extended robots.txt user-agent token?",
    intent: "Verify AI crawler control token extraction, scope limitations, and non-impact on search indexation.",
    expectedObservables: [
      "answer presence",
      "explicit distinction: blocks Gemini/Vertex AI training, does not block Google Search indexing",
      "Google Search Central documentation citation",
      "distinct cited domains"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Google-Extended documentation for AI training exclusion.",
    expectedEntityAnchors: ["Google-Extended", "robots.txt", "AI training", "Google Search index"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-079",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "How do you configure an HTTP 503 Service Unavailable response with a Retry-After header for planned server maintenance?",
    intent: "Evaluate server header syntax generation and crawler backoff schedule configuration.",
    expectedObservables: [
      "answer presence",
      "HTTP 503 status code explanation",
      "Retry-After syntax in seconds or HTTP-date (RFC 9110)",
      "crawler preservation advice (prevents de-indexing)"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "RFC 9110 Section 15.6.4 (503 Service Unavailable) and Section 10.2.3 (Retry-After).",
    expectedEntityAnchors: ["HTTP 503", "Retry-After", "server maintenance", "RFC 9110"],
    temporalSensitivity: "STATIC"
  },
  {
    id: "Q-080",
    experimentId: "EXP-001",
    category: "TECHNICAL",
    query: "What is the technical operational difference between index,follow and noindex,follow in the X-Robots-Tag HTTP header?",
    intent: "Test indexation vs link-graph traversal directive distinction extraction.",
    expectedObservables: [
      "answer presence",
      "explanation that noindex,follow prevents indexing while allowing link discovery/traversal",
      "Google Search Central / RFC citations",
      "citation rendering format"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Standard robots metadata directive combination semantics.",
    expectedEntityAnchors: ["noindex,follow", "index,follow", "X-Robots-Tag", "link graph"],
    temporalSensitivity: "STATIC"
  },

  // =========================================================================
  // CATEGORY 6: CURRENT_INFORMATION (Q-081 to Q-096)
  // =========================================================================
  {
    id: "Q-081",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "What is the current Stage status of the Temporal proposal in the TC39 ECMAScript standardization process?",
    intent: "Test tracking of active TC39 web standards committee proposals and stage progression freshness.",
    expectedObservables: [
      "answer presence",
      "current TC39 Stage number",
      "TC39 / GitHub repository citations",
      "temporal freshness",
      "proposal champion notes"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active TC39 proposal tracking standards evolution.",
    expectedEntityAnchors: ["TC39", "Temporal proposal", "ECMAScript Stage", "standards track"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-082",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "What is the current release status and version number of the Schema.org vocabulary?",
    intent: "Assess real-time tracking of active vocabulary version releases on schema.org.",
    expectedObservables: [
      "answer presence",
      "current release version number",
      "schema.org official release notes citation",
      "citation recency"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Living vocabulary release tracking on schema.org/docs/releases.html.",
    expectedEntityAnchors: ["Schema.org release", "vocabulary version", "schema.org/docs/releases.html"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-083",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "How do official Google Search Central guidelines address the indexation and quality evaluation of AI-generated content?",
    intent: "Evaluate freshness of search engine policy documentation regarding programmatic and generative content.",
    expectedObservables: [
      "answer presence",
      "E-E-A-T and helpful content criteria mention",
      "Google Search Central documentation citations",
      "policy recency"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active search engine guidance on AI content evaluation.",
    expectedEntityAnchors: ["AI-generated content", "Google Search Central", "E-E-A-T", "quality guidelines"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-084",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "What is the active browser architecture status and implementation approach for third-party cookie restrictions across major web browsers?",
    intent: "Measure currency of web platform privacy changes, partitioned cookies (CHIPS), and browser implementation roadmaps.",
    expectedObservables: [
      "answer presence",
      "current browser status (Chrome, Safari, Firefox)",
      "Privacy Sandbox / W3C citations",
      "temporal freshness"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Evolving cross-browser cookie partitioning and privacy policies.",
    expectedEntityAnchors: ["third-party cookies", "Privacy Sandbox", "CHIPS", "browser privacy"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-085",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "What is the current operational support and rendering architecture for Partial Prerendering (PPR) in the Next.js App Router?",
    intent: "Evaluate framework architecture freshness and technical documentation citations for hybrid rendering features.",
    expectedObservables: [
      "answer presence",
      "current experimental/stable status of PPR",
      "official nextjs.org documentation citations",
      "distinct cited domains"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active framework rendering feature transition in Next.js App Router.",
    expectedEntityAnchors: ["Partial Prerendering", "PPR", "Next.js App Router", "hybrid rendering"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-086",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "What is the current deployment and browser support status of the HTTP/3 protocol across public web traffic?",
    intent: "Test retrieval of active networking telemetry, browser compatibility tables, and IETF protocol adoption statistics.",
    expectedObservables: [
      "answer presence",
      "adoption telemetry percentages",
      "Can I Use / Cloudflare / W3Techs citations",
      "temporal freshness"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Evolving internet protocol adoption statistics across public web traffic.",
    expectedEntityAnchors: ["HTTP/3", "QUIC", "browser support", "protocol adoption"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-087",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "What metrics currently constitute Google Core Web Vitals and what are their respective recommended performance thresholds?",
    intent: "Assess retrieval of active Core Web Vitals metric set (LCP, CLS, INP) and official 75th percentile thresholds.",
    expectedObservables: [
      "answer presence",
      "current metric list (LCP, CLS, INP)",
      "numeric threshold values",
      "web.dev / Google Search Central citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Official active Core Web Vitals performance benchmarks.",
    expectedEntityAnchors: ["Core Web Vitals", "INP", "LCP", "CLS", "web.dev"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-088",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "Which user-agent tokens are officially documented by AI search providers to distinguish search indexation crawlers from model training scrapers?",
    intent: "Test currency of AI crawler identification tokens (e.g., OAI-SearchBot vs GPTBot, PerplexityBot, ClaudeBot).",
    expectedObservables: [
      "answer presence",
      "specific crawler token differentiation",
      "official AI provider documentation citations",
      "distinction between search indexing and model training"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active AI search crawler tokens documented by AI providers.",
    expectedEntityAnchors: ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "robots.txt"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-089",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "What is the current development status and structural drafting approach of the W3C Web Content Accessibility Guidelines 3.0 (WCAG 3)?",
    intent: "Evaluate tracking of active W3C working drafts, Project Silver restructuring, and evolving accessibility models.",
    expectedObservables: [
      "answer presence",
      "W3C Working Draft status",
      "conformance model changes (outcomes vs success criteria)",
      "w3.org citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active W3C Working Draft for next-generation accessibility standards.",
    expectedEntityAnchors: ["WCAG 3.0", "Project Silver", "W3C Working Draft", "accessibility guidelines"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-090",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "How do major web platforms and content networks document robots.txt directives to prevent automated AI scraping while preserving search visibility?",
    intent: "Assess synthesized guidance regarding crawler differentiation, voluntary compliance, and emerging scraper policies.",
    expectedObservables: [
      "answer presence",
      "directive examples for specific bots",
      "distinction between search and training bots",
      "industry documentation citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active conventions for differentiating search crawlers from AI scrapers.",
    expectedEntityAnchors: ["robots.txt", "AI scraping opt-out", "search visibility", "crawler governance"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-091",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "What is the current specification status of the ECMAScript Type Annotations proposal within TC39?",
    intent: "Test tracking of active language proposals shaping the convergence of JavaScript and TypeScript syntax.",
    expectedObservables: [
      "answer presence",
      "current TC39 Stage of Type Annotations proposal",
      "TC39 repository citations",
      "syntax scope explanation"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active TC39 Stage tracking for types as comments proposal.",
    expectedEntityAnchors: ["TC39", "Type Annotations proposal", "ECMAScript", "types as comments"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-092",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "Which Schema.org structured data types are currently eligible for rich results in Google Search desktop and mobile results?",
    intent: "Measure accuracy in reporting active Google Search rich result features and documentation changes.",
    expectedObservables: [
      "answer presence",
      "active rich result types list",
      "Google Search Central documentation citations",
      "eligibility restrictions"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active Google Search Central Rich Results documentation.",
    expectedEntityAnchors: ["Schema.org", "Google Search Central", "Rich Results eligibility", "structured data features"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-093",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "How do scholarly publishing platforms and search repositories currently implement persistent identifier (PID) metadata graphs for automated research citation?",
    intent: "Evaluate scholarly infrastructure currency, automated citation graphs, and Crossref/DataCite PID schema adoption.",
    expectedObservables: [
      "answer presence",
      "persistent identifier types (DOI, ROR, ORCID)",
      "metadata graph linking explanation",
      "Crossref / DataCite citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active scholarly publishing persistent identifier graphs.",
    expectedEntityAnchors: ["persistent identifiers", "PID", "DOI", "Crossref", "citation graphs"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-094",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "How do search engines and major AI providers currently distribute verified IP address ranges for automated crawler authentication?",
    intent: "Test retrieval of active machine-readable IP feed infrastructure (Google, Bing, OpenAI published JSON lists) versus rDNS.",
    expectedObservables: [
      "answer presence",
      "published JSON IP feed mechanisms",
      "developer documentation citations",
      "comparison with reverse DNS"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active JSON endpoints published by search engines and AI labs for bot verification.",
    expectedEntityAnchors: ["crawler IP ranges", "published IP feeds", "Googlebot IP ranges", "bot authentication"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-095",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "How do digital publishers implement Schema.org and HTTP metadata to declare subscription paywalls and machine-access licensing terms for web crawlers?",
    intent: "Verify technical implementation of active paywall markup (isAccessibleForFree) and machine-access reservation declarations.",
    expectedObservables: [
      "answer presence",
      "isAccessibleForFree and cssSelector markup",
      "W3C / TDM reservation protocols",
      "publisher documentation citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active publisher content licensing and paywall structured metadata.",
    expectedEntityAnchors: ["isAccessibleForFree", "paywalled content", "TDM reservation", "Schema.org"],
    temporalSensitivity: "HIGH_FRESHNESS"
  },
  {
    id: "Q-096",
    experimentId: "EXP-001",
    category: "CURRENT_INFORMATION",
    query: "What is the current cross-runtime baseline support for the WinterCG Common Web APIs across server-side JavaScript runtimes?",
    intent: "Test tracking of active runtime interoperability standards across Node.js, Deno, Bun, and edge environments.",
    expectedObservables: [
      "answer presence",
      "WinterCG standards initiative description",
      "supported web API primitives (fetch, streams, crypto)",
      "runtime documentation citations"
    ],
    systems: [...CANONICAL_AI_SEARCH_SYSTEMS],
    status: "APPROVED",
    notes: "Active WinterCG baseline specifications across server runtimes.",
    expectedEntityAnchors: ["WinterCG", "server-side JavaScript", "Common Web APIs", "cross-runtime interoperability"],
    temporalSensitivity: "HIGH_FRESHNESS"
  }
];


// Calculate category counts
const categoryCounts: Record<string, number> = {
  FACTUAL: 0,
  EXPLANATORY: 0,
  COMPARISON: 0,
  ENTITY: 0,
  TECHNICAL: 0,
  CURRENT_INFORMATION: 0,
};

for (const q of queries) {
  categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
}

const registryMetadata: QueryRegistryMetadata = {
  experimentId: "EXP-001",
  protocolVersion: "1.0",
  registryVersion: "1.0",
  canonicalSystems: CANONICAL_AI_SEARCH_SYSTEMS,
  categories: categoryCounts as any,
  totalQueries: queries.length,
  status: "APPROVED",
  createdAt: "2026-09-25T00:00:00Z",
  updatedAt: "2026-09-25T00:00:00Z",
  queries: queries
};

const outputDir = path.join(process.cwd(), "evidence", "exp-001", "registry");
fs.mkdirSync(outputDir, { recursive: true });

const targetFile = path.join(outputDir, "queries.json");
fs.writeFileSync(targetFile, JSON.stringify(registryMetadata, null, 2), "utf-8");

console.log("Successfully generated:", targetFile);
console.log("Total queries:", queries.length);
console.log("Category breakdown:", categoryCounts);
