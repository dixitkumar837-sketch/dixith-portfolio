import { ExperimentItem } from "./types";

export const LAB_EXPERIMENTS: ExperimentItem[] = [
  {
    id: "EXP-001",
    title: "SAME QUESTION / SIX SYSTEMS",
    status: "ACTIVE",
    systemsTested: [
      "Google AI Overview",
      "ChatGPT",
      "Perplexity",
      "Claude",
      "Gemini",
      "Microsoft Copilot",
    ],
    purpose: "Testing output divergence, citation sourcing, entity confidence, and answer structure across 6 major search engines using standardized query vectors.",
    slug: "same-question-six-systems",
  },
];
