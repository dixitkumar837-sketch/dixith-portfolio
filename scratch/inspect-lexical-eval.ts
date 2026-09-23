import { searchContent } from "../lib/search";
import { EVALUATION_DATASET } from "../lib/semantic/evaluation-dataset";

for (const item of EVALUATION_DATASET) {
  const res = searchContent(item.query);
  console.log(`${item.id} [${item.category}] "${item.query}"`);
  if (res.length === 0) {
    console.log("   (0 results)");
  }
  for (const r of res) {
    console.log(`   -> ${r.id} score=${r.score} fields=${JSON.stringify(r.matchedFields)}`);
  }
}
