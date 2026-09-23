/**
 * DIXITH Semantic Retrieval Evaluation Dataset
 * Phase 8G.7: Semantic Retrieval Evaluation & Benchmarking
 *
 * Explicit, ground-truth evaluation queries for measuring the baseline retrieval
 * quality of the local vector search system.
 *
 * NOTE: This is an early engineering evaluation on the currently published DIXITH corpus
 * (3 published entities, 18 chunks), not a statistically representative benchmark.
 */

export type EvaluationCategory =
  | "exact_intent"
  | "conceptual_paraphrase"
  | "vocabulary_variation"
  | "negative_distractor";

export interface SemanticEvaluationQuery {
  id: string;
  query: string;
  category: EvaluationCategory;
  expectedEntityIds?: string[];
  expectedChunkIds?: string[];
  expectedRelevant: boolean;
  rationale: string;
}

export const EVALUATION_DATASET: SemanticEvaluationQuery[] = [
  // ----------------------------------------------------
  // Category A: Exact / Near-Exact Intent (6 Queries)
  // Queries closely aligned with the explicit focus and technical descriptions of published entities.
  // ----------------------------------------------------
  {
    id: "EXACT-001",
    query: "technical SEO and crawl optimization for international websites",
    category: "exact_intent",
    expectedEntityIds: ["PE-002"],
    expectedChunkIds: ["PE-002#overview#0", "PE-002#context#0"],
    expectedRelevant: true,
    rationale: "Matches core technical focus and title of PE-002 (International Search Architecture).",
  },
  {
    id: "EXACT-002",
    query: "clinical taxonomy and healthcare schema markup",
    category: "exact_intent",
    expectedEntityIds: ["PE-001"],
    expectedChunkIds: ["PE-001#overview#0", "PE-001#architecture#0"],
    expectedRelevant: true,
    rationale: "Matches core clinical modeling and schema focus of PE-001 (Healthcare Search Architecture).",
  },
  {
    id: "EXACT-003",
    query: "product catalog structured data for ecommerce search engines",
    category: "exact_intent",
    expectedEntityIds: ["PE-003"],
    expectedChunkIds: ["PE-003#overview#0", "PE-003#architecture#0"],
    expectedRelevant: true,
    rationale: "Matches e-commerce catalog information architecture and schema modeling in PE-003.",
  },
  {
    id: "EXACT-004",
    query: "cross-border hreflang mapping and reciprocal tag validation",
    category: "exact_intent",
    expectedEntityIds: ["PE-002"],
    expectedChunkIds: ["PE-002#architecture#0", "PE-002#implementation#0"],
    expectedRelevant: true,
    rationale: "Matches explicit hreflang reciprocal tag workflows documented in PE-002.",
  },
  {
    id: "EXACT-005",
    query: "medical entity disambiguation and diagnostic taxonomy hierarchy",
    category: "exact_intent",
    expectedEntityIds: ["PE-001"],
    expectedChunkIds: ["PE-001#architecture#0", "PE-001#implementation#0"],
    expectedRelevant: true,
    rationale: "Matches medical entity disambiguation and clinical hierarchy in PE-001.",
  },
  {
    id: "EXACT-006",
    query: "merchant return policy and product offer schema structured data",
    category: "exact_intent",
    expectedEntityIds: ["PE-003"],
    expectedChunkIds: ["PE-003#architecture#0", "PE-003#implementation#0"],
    expectedRelevant: true,
    rationale: "Matches Product, Offer, and MerchantReturnPolicy Schema.org implementation in PE-003.",
  },

  // ----------------------------------------------------
  // Category B: Conceptual Paraphrase (6 Queries)
  // Expresses the same underlying information need using alternative phrasing and conceptual synonyms.
  // ----------------------------------------------------
  {
    id: "PARA-001",
    query: "managing crawler budget and server latency for global platforms",
    category: "conceptual_paraphrase",
    expectedEntityIds: ["PE-002"],
    expectedRelevant: true,
    rationale: "Paraphrases crawl efficiency and international bot monitoring in PE-002.",
  },
  {
    id: "PARA-002",
    query: "organizing hospital department services and medical schema definitions",
    category: "conceptual_paraphrase",
    expectedEntityIds: ["PE-001"],
    expectedRelevant: true,
    rationale: "Paraphrases clinical department taxonomies and healthcare structured data in PE-001.",
  },
  {
    id: "PARA-003",
    query: "optimizing online retail listings for generative shopping engines",
    category: "conceptual_paraphrase",
    expectedEntityIds: ["PE-003"],
    expectedRelevant: true,
    rationale: "Paraphrases preparing retail product data for generative AI shopping engines in PE-003.",
  },
  {
    id: "PARA-004",
    query: "handling multi-language website duplication and country routing",
    category: "conceptual_paraphrase",
    expectedEntityIds: ["PE-002"],
    expectedRelevant: true,
    rationale: "Paraphrases cross-language canonicalization and multi-regional routing in PE-002.",
  },
  {
    id: "PARA-005",
    query: "connecting clinical lab testing concepts to knowledge graph entities",
    category: "conceptual_paraphrase",
    expectedEntityIds: ["PE-001"],
    expectedRelevant: true,
    rationale: "Paraphrases mapping diagnostic modalities to clinical knowledge concepts in PE-001.",
  },
  {
    id: "PARA-006",
    query: "product attribute feeds and client-side rendering audit for retail bots",
    category: "conceptual_paraphrase",
    expectedEntityIds: ["PE-003"],
    expectedRelevant: true,
    rationale: "Paraphrases merchant feed alignment and client-side rendering audits in PE-003.",
  },

  // ----------------------------------------------------
  // Category C: Vocabulary / Acronym Variation (6 Queries)
  // Short-form, acronym-heavy, or specialized vocabulary matching published concepts.
  // ----------------------------------------------------
  {
    id: "VOCAB-001",
    query: "hreflang cluster synchronization",
    category: "vocabulary_variation",
    expectedEntityIds: ["PE-002"],
    expectedRelevant: true,
    rationale: "Tests specialized technical terminology explicitly documented in PE-002.",
  },
  {
    id: "VOCAB-002",
    query: "Schema.org MedicalCondition and LocalBusiness",
    category: "vocabulary_variation",
    expectedEntityIds: ["PE-001"],
    expectedRelevant: true,
    rationale: "Tests specific Schema.org type names implemented in PE-001.",
  },
  {
    id: "VOCAB-003",
    query: "MerchantReturnPolicy JSON-LD",
    category: "vocabulary_variation",
    expectedEntityIds: ["PE-003"],
    expectedRelevant: true,
    rationale: "Tests specific JSON-LD schema entity implemented in PE-003.",
  },
  {
    id: "VOCAB-004",
    query: "XML sitemap index partitioning",
    category: "vocabulary_variation",
    expectedEntityIds: ["PE-002"],
    expectedRelevant: true,
    rationale: "Tests multi-regional sitemap index partitioning terminology from PE-002.",
  },
  {
    id: "VOCAB-005",
    query: "E-E-A-T clinical disambiguation",
    category: "vocabulary_variation",
    expectedEntityIds: ["PE-001"],
    expectedRelevant: true,
    rationale: "Tests E-E-A-T and clinical entity disambiguation terminology in PE-001.",
  },
  {
    id: "VOCAB-006",
    query: "e-commerce catalog information architecture",
    category: "vocabulary_variation",
    expectedEntityIds: ["PE-003"],
    expectedRelevant: true,
    rationale: "Tests catalog information architecture terminology in PE-003.",
  },

  // ----------------------------------------------------
  // Category D: Negative Distractors (6 Queries)
  // Queries clearly outside the published corpus that must NOT retrieve positive matches above threshold.
  // ----------------------------------------------------
  {
    id: "DISTRACT-001",
    query: "how to bake sourdough bread with whole wheat flour at high altitude",
    category: "negative_distractor",
    expectedEntityIds: [],
    expectedRelevant: false,
    rationale: "Culinary query completely disjoint from search engineering and SEO architecture.",
  },
  {
    id: "DISTRACT-002",
    query: "quantum entanglement in topological quantum computers",
    category: "negative_distractor",
    expectedEntityIds: [],
    expectedRelevant: false,
    rationale: "Theoretical physics query with zero conceptual overlap with the published corpus.",
  },
  {
    id: "DISTRACT-003",
    query: "best defensive football drills for youth training sessions",
    category: "negative_distractor",
    expectedEntityIds: [],
    expectedRelevant: false,
    rationale: "Sports conditioning query with zero relevance to digital search platforms.",
  },
  {
    id: "DISTRACT-004",
    query: "Python PyTorch tutorial for computer vision object detection",
    category: "negative_distractor",
    expectedEntityIds: [],
    expectedRelevant: false,
    rationale: "General deep learning CV tutorial disjoint from search schema and crawling architecture.",
  },
  {
    id: "DISTRACT-005",
    query: "how to replace a broken alternator belt in a Honda Civic",
    category: "negative_distractor",
    expectedEntityIds: [],
    expectedRelevant: false,
    rationale: "Automotive repair manual query with zero semantic relation to web search systems.",
  },
  {
    id: "DISTRACT-006",
    query: "history of Renaissance architecture in Florence Italy",
    category: "negative_distractor",
    expectedEntityIds: [],
    expectedRelevant: false,
    rationale: "Art and European history query completely unrelated to information retrieval architecture.",
  },
];
