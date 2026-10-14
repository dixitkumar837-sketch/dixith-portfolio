import { getGuideById } from "../data/guides";
import { validateContentGraph, isIndexable } from "../lib/content-utils";

const g = getGuideById("GUI-001");
if (!g) {
  console.error("GUI-001 not found!");
  process.exit(1);
}

const bodyWords = (g.body || "").trim().split(/\s+/).filter(Boolean).length;
const stepsWords = (g.steps || [])
  .map((s) => s.title + " " + s.description + " " + (s.codeSnippet?.code || ""))
  .join(" ")
  .trim()
  .split(/\s+/)
  .filter(Boolean).length;
const totalWords = bodyWords + stepsWords;

console.log("GUI-001 Content Inspection:");
console.log("- Title:", g.title);
console.log("- Status:", g.status);
console.log("- isIndexable:", isIndexable(g.status));
console.log("- Read Time:", g.readTime);
console.log("- Body Words:", bodyWords);
console.log("- Steps Words (including snippets):", stepsWords);
console.log("- Total Word Count:", totalWords);
console.log("- Steps Count:", g.steps?.length);
console.log("- Code Snippets Count:", g.steps?.filter((s) => s.codeSnippet).length);
console.log("- Sources:", g.sourceIds);
console.log("- Topics:", g.topics);
console.log("- Entity References:", g.entityReferences);

const validation = validateContentGraph();
console.log("\nKnowledge Graph Validation:");
console.log("- Valid:", validation.isValid);
console.log("- Errors:", validation.errors);
console.log("- Warnings:", validation.warnings);
