import { buildSearchIndex, tokenizeQuery, normalizeText, expandQueryTokens, DIXITH_TAXONOMY_ALIASES } from "../lib/search";
import { EVALUATION_DATASET } from "../lib/semantic/evaluation-dataset";

// Standard set of generic conversational / function words
const GENERIC_CONVERSATIONAL_TOKENS = new Set([
  "how", "what", "where", "when", "why", "who", "which",
  "is", "are", "was", "were", "be", "been", "being",
  "the", "a", "an",
  "to", "for", "of", "in", "on", "at", "by", "with", "from", "about",
  "into", "through", "during", "before", "after", "above", "below",
  "up", "down", "out", "off", "over", "under",
  "can", "could", "do", "does", "did", "have", "has", "had",
  "would", "should", "will", "shall", "may", "might", "must",
  "and", "or", "but", "so", "if", "then", "not", "no", "nor",
  "too", "very", "just", "best", "good", "better", "great",
  "high", "low", "new", "old", "many", "much", "more", "most",
  "some", "any", "each", "every", "all", "both", "few", "other",
  "such", "own", "same", "than"
]);

// Explicit domain terms that MUST NEVER be treated as generic
const PROTECTED_DOMAIN_TERMS = new Set([
  "seo", "aeo", "geo", "rag", "eeat", "hreflang", "jsonld", "schema",
  "taxonomy", "crawl", "crawler", "crawling", "index", "indexing",
  "indexation", "sitemap", "entity", "entities", "search", "retrieval",
  "chunking", "vector", "embedding", "llm", "discovery", "structured",
  "data", "canonical", "catalog", "ecommerce", "healthcare", "clinical",
  "medical", "merchant", "offer", "product", "products", "dixith"
]);

const docs = buildSearchIndex();

for (const item of EVALUATION_DATASET) {
  const rawTokens = tokenizeQuery(item.query);
  const substantiveTokens = rawTokens.filter((t) => {
    if (PROTECTED_DOMAIN_TERMS.has(t)) return true;
    return !GENERIC_CONVERSATIONAL_TOKENS.has(t);
  });

  console.log(`\n${item.id} [${item.category}] "${item.query}"`);
  console.log(`  Substantive query tokens (${substantiveTokens.length}): [${substantiveTokens.join(", ")}]`);

  for (const doc of docs) {
    const docFullText = normalizeText([
      doc.title,
      doc.summary,
      ...doc.topics,
      ...doc.headings,
      doc.content,
      ...doc.sources,
      ...doc.relatedEntityTitles
    ].join(" "));

    const matchedSubstantive = substantiveTokens.filter((t) => {
      const wholeWord = new RegExp(`\\b${t}\\b`, "i");
      const prefix = t.length >= 3 ? new RegExp(`\\b${t}`, "i") : null;
      return wholeWord.test(docFullText) || (prefix && prefix.test(docFullText));
    });

    const ratio = substantiveTokens.length > 0
      ? matchedSubstantive.length / substantiveTokens.length
      : 0;

    if (matchedSubstantive.length > 0) {
      console.log(`    ${doc.id}: matched ${matchedSubstantive.length}/${substantiveTokens.length} (${(ratio * 100).toFixed(0)}%) -> [${matchedSubstantive.join(", ")}]`);
    } else {
      console.log(`    ${doc.id}: matched 0/${substantiveTokens.length} (0%) -> REJECTED`);
    }
  }
}
