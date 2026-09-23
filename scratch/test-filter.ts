import { searchContent } from "../lib/search";
import { filterLexicalCandidates, evaluateLexicalQuality } from "../lib/search/lexical-quality";
import { EVALUATION_DATASET } from "../lib/semantic/evaluation-dataset";

console.log("=== Testing Lexical Quality Gate on Evaluation Dataset ===\n");

for (const item of EVALUATION_DATASET) {
  const raw = searchContent(item.query);
  const filtered = filterLexicalCandidates(raw, item.query);
  console.log(`${item.id} [${item.category}] "${item.query}"`);
  console.log(`  Raw: [${raw.map((r) => r.id).join(", ")}]`);
  console.log(`  Filtered: [${filtered.map((r) => r.id).join(", ")}]`);
  if (item.category === "negative_distractor") {
    if (filtered.length === 0) {
      console.log(`  ✓ SUCCESS: Negative query completely rejected!`);
    } else {
      console.error(`  ✗ FAIL: Negative query leaked: ${filtered.map((r) => r.id).join(", ")}`);
    }
  } else {
    const hasExpected = item.expectedEntityIds?.some((id) =>
      filtered.some((f) => f.id === id)
    );
    if (hasExpected) {
      console.log(`  ✓ SUCCESS: Expected entity retained!`);
    } else {
      console.error(`  ✗ FAIL: Expected entity lost! Expected: ${item.expectedEntityIds?.join(", ")}`);
    }
  }
}
