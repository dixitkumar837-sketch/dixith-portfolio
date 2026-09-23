import { SourceEntity } from "./types";

/**
 * Canonical Source Entity Registry
 * Provenance tracking and citation verification for DIXITH research and articles.
 */
export const CANONICAL_SOURCES: Record<string, SourceEntity> = {
  "SRC-001": {
    id: "SRC-001",
    title: "Schema.org Specifications",
    url: "https://schema.org",
    publisher: "W3C Schema.org Community Group",
    sourceType: "STANDARD_SPEC",
    verificationStatus: "VERIFIED",
    accessedDate: "2026-03-22",
  },
  "SRC-002": {
    id: "SRC-002",
    title: "Google Search Central: Structured Data Documentation",
    url: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data",
    publisher: "Google Developers",
    sourceType: "OFFICIAL_DOCUMENTATION",
    verificationStatus: "VERIFIED",
    accessedDate: "2026-03-22",
  },
  "SRC-003": {
    id: "SRC-003",
    title: "OpenAI: GPTBot Web Crawler Documentation",
    url: "https://platform.openai.com/docs/gptbot",
    publisher: "OpenAI",
    sourceType: "OFFICIAL_DOCUMENTATION",
    verificationStatus: "VERIFIED",
    accessedDate: "2026-03-22",
  },
  "SRC-004": {
    id: "SRC-004",
    title: "Anthropic: ClaudeBot Web Crawler Documentation",
    url: "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-it",
    publisher: "Anthropic",
    sourceType: "OFFICIAL_DOCUMENTATION",
    verificationStatus: "VERIFIED",
    accessedDate: "2026-03-22",
  },
};

export function getAllSources(): SourceEntity[] {
  return Object.values(CANONICAL_SOURCES);
}

export function getSourceById(id: string): SourceEntity | undefined {
  return CANONICAL_SOURCES[id];
}
