import { GUIDES, getGuideById } from "../data/guides";
import { CANONICAL_SOURCES, getSourceById } from "../data/sources";
import { validateContentGraph, isIndexable } from "../lib/content-utils";

console.log("=== GUI-002 AUDIT SCRIPT ===");

const guide = getGuideById("GUI-002");
if (!guide) {
  throw new Error("GUI-002 not found!");
}

console.log("1. Title:", guide.title);
console.log("2. Status:", guide.status);
console.log("3. isIndexable:", isIndexable(guide.status));
console.log("4. readTime / readingTime:", guide.readTime, "/", guide.readingTime);
console.log("5. Difficulty Level:", guide.difficultyLevel);
console.log("6. Category:", guide.category);
console.log("7. Topics:", guide.topics);
console.log("8. Target Systems:", guide.targetSystems);
console.log("9. Prerequisites Count:", guide.prerequisites?.length);
console.log("10. Steps Count:", guide.steps?.length);

guide.steps?.forEach((step) => {
  console.log(`   Step ${step.stepNumber}: ${step.title} (Code Snippet: ${step.codeSnippet?.language ? "YES (" + step.codeSnippet.language + ")" : "NO"})`);
});

const bodyWords = guide.body?.trim().split(/\s+/).filter(Boolean).length || 0;
let stepWords = 0;
guide.steps?.forEach((s) => {
  stepWords += s.title.split(/\s+/).filter(Boolean).length;
  stepWords += s.description.split(/\s+/).filter(Boolean).length;
});
const totalWords = bodyWords + stepWords;

console.log("11. Word Count Breakdown:");
console.log("    - Body Words:", bodyWords);
console.log("    - Step Words:", stepWords);
console.log("    - Total Guide Words:", totalWords);

// Section verification
const sections = guide.body?.split(/\n(?=[0-9]+\. )/) || [];
console.log("12. Sections Count:", sections.length);
sections.forEach((sec, idx) => {
  const heading = sec.trim().split("\n")[0];
  console.log(`    Section ${idx + 1}: ${heading}`);
});

// Sources verification
console.log("13. Source IDs:", guide.sourceIds);
guide.sourceIds?.forEach((srcId) => {
  const src = getSourceById(srcId);
  console.log(`    - ${srcId}: ${src?.title} (${src?.url}) [${src?.verificationStatus}]`);
});

// Related Research
console.log("14. Related Research IDs:", guide.relatedResearchIds);
console.log("    Entity References:", JSON.stringify(guide.entityReferences));

// Graph validation
const graphResult = validateContentGraph();
console.log("15. Graph Validation Valid:", graphResult.isValid);
console.log("    Errors:", graphResult.errors);
console.log("    Warnings:", graphResult.warnings);

// Forbidden systems scan
const forbidden = ["You.com", "SearchGPT", "Phind", "Genspark", "dixith.com"];
const foundForbidden: string[] = [];
for (const term of forbidden) {
  if (guide.body?.toLowerCase().includes(term.toLowerCase())) {
    foundForbidden.push(term);
  }
}
console.log("16. Forbidden Terms Detected in GUI-002:", foundForbidden.length > 0 ? foundForbidden : "NONE (CLEAN)");

// Canonical systems check
const canonicalSystems = [
  "Google AI Overview",
  "ChatGPT",
  "Perplexity",
  "Claude",
  "Gemini",
  "Microsoft Copilot",
];
const missingCanonical: string[] = [];
for (const sys of canonicalSystems) {
  if (!guide.body?.includes(sys)) {
    missingCanonical.push(sys);
  }
}
console.log("17. Canonical Systems in Body:", missingCanonical.length === 0 ? "ALL 6 PRESENT" : `MISSING: ${missingCanonical.join(", ")}`);

// Example.com placeholder check
const usesExampleDotCom = guide.body?.includes("https://example.com");
console.log("18. Uses https://example.com placeholder:", usesExampleDotCom);

// Non-guarantee notice check
const hasNonGuarantee = guide.body?.includes("CRITICAL NON-GUARANTEE NOTICE");
console.log("19. Has Non-Guarantee Notice:", hasNonGuarantee);

// EXP-014 IN_REVIEW check
const hasExp014InReview = guide.body?.includes("IN_REVIEW") && guide.body?.includes("EXP-014");
console.log("20. Mentions EXP-014 with IN_REVIEW notice:", hasExp014InReview);
