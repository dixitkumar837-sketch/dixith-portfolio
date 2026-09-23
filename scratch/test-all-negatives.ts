import { buildSearchIndex, tokenizeQuery, normalizeText, searchContent } from "../lib/search";

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

const PROTECTED_DOMAIN_TERMS = new Set([
  "seo", "aeo", "geo", "rag", "eeat", "hreflang", "jsonld", "schema",
  "taxonomy", "crawl", "crawler", "crawling", "index", "indexing",
  "indexation", "sitemap", "entity", "entities", "search", "retrieval",
  "chunking", "vector", "embedding", "llm", "discovery", "structured",
  "data", "canonical", "catalog", "ecommerce", "healthcare", "clinical",
  "medical", "merchant", "offer", "product", "products", "dixith"
]);

const expandedNegatives = [
  "how to bake sourdough bread with whole wheat flour at high altitude",
  "quantum entanglement in topological quantum computers",
  "best defensive football drills for youth training sessions",
  "Python PyTorch tutorial for computer vision object detection",
  "how to replace a broken alternator belt in a Honda Civic",
  "history of Renaissance architecture in Florence Italy",
  "top attractions and hotels in Tokyo Japan for tourists",
  "organic gardening tips for growing tomatoes indoors",
  "guitar chords and tabs for Stairway to Heaven",
  "symptoms of acute appendicitis and emergency treatments",
  "how to fix plumbing leak under kitchen sink",
  "best dog food brands for golden retriever puppies",
  "how to file federal income tax return online",
  "cricket bowling techniques for fast bowlers",
  "history of the Roman Empire and Julius Caesar",
  "astronomy guide to viewing the Andromeda galaxy with binoculars"
];

const docs = buildSearchIndex();

for (const q of expandedNegatives) {
  const rawTokens = tokenizeQuery(q);
  const substantiveTokens = rawTokens.filter((t) => {
    if (PROTECTED_DOMAIN_TERMS.has(t)) return true;
    return !GENERIC_CONVERSATIONAL_TOKENS.has(t);
  });

  const lexicalResults = searchContent(q);
  console.log(`\nQuery: "${q}"`);
  console.log(`  Raw Lexical matches: ${lexicalResults.length}`);

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
    }
  }
}
