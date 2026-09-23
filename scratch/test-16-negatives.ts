import { searchContent } from "../lib/search";
import { filterLexicalCandidates } from "../lib/search/lexical-quality";

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

let failedCount = 0;

for (const q of expandedNegatives) {
  const raw = searchContent(q);
  const filtered = filterLexicalCandidates(raw, q);
  if (filtered.length > 0) {
    console.error(`✗ FAIL: Leaked query "${q}" -> ${filtered.map((r) => r.id).join(", ")}`);
    failedCount++;
  } else {
    console.log(`✓ REJECTED (Raw was ${raw.length}): "${q}"`);
  }
}

if (failedCount === 0) {
  console.log(`\nALL 16 NEGATIVE QUERIES SUCCESSFULLY REJECTED (0% False Positives)!`);
} else {
  console.error(`\n${failedCount} queries leaked!`);
}
