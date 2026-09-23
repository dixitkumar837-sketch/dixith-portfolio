import { buildSearchIndex, tokenizeQuery, normalizeText } from "../lib/search";

const docs = buildSearchIndex();
const distractors = [
  "how to bake sourdough bread with whole wheat flour at high altitude",
  "quantum entanglement in topological quantum computers",
  "best defensive football drills for youth training sessions",
  "Python PyTorch tutorial for computer vision object detection",
  "how to replace a broken alternator belt in a Honda Civic",
  "history of Renaissance architecture in Florence Italy"
];

for (const q of distractors) {
  const tokens = tokenizeQuery(q);
  console.log(`\nQuery: "${q}"`);
  console.log(`Tokens: [${tokens.join(", ")}]`);
  for (const doc of docs) {
    const matchedTokens: string[] = [];
    const fullText = normalizeText([
      doc.title,
      doc.summary,
      ...doc.topics,
      ...doc.headings,
      doc.content,
      ...doc.sources,
      ...doc.relatedEntityTitles
    ].join(" "));
    for (const token of tokens) {
      const wholeWord = new RegExp(`\\b${token}\\b`, "i");
      const prefix = token.length >= 3 ? new RegExp(`\\b${token}`, "i") : null;
      if (wholeWord.test(fullText) || (prefix && prefix.test(fullText))) {
        matchedTokens.push(token);
      }
    }
    if (matchedTokens.length > 0) {
      console.log(`  -> ${doc.id} (${doc.title}): matched [${matchedTokens.join(", ")}]`);
    }
  }
}
