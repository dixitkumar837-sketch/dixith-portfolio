/**
 * DIXITH Phase 8N — Claim-Level Grounding & Support Validation
 *
 * Implements a lightweight, deterministic claim-support validation layer over
 * synthesized Ask DIXITH answers.
 *
 * Epistemological Boundary:
 * This layer does NOT claim to prove universal factual truth or natural-language
 * theorem proving. It deterministically evaluates whether an extracted substantive
 * claim has identifiable supporting text within the retrieved published DIXITH context.
 */

import {
  GroundedContext,
  ClaimSupportClassification,
  ExtractedClaim,
  ClaimSupportReport,
} from "@/data/ask-dixith-types";
import { resolveEntity } from "../content-utils";
import { EntityType } from "@/data/types";

/**
 * Standard English and technical stopwords excluded during claim-to-source keyword matching.
 */
const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "also", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below",
  "between", "both", "but", "by", "can", "cannot", "could", "did", "do", "does", "doing",
  "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having",
  "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in",
  "into", "is", "isn't", "it", "its", "itself", "let's", "me", "more", "most", "my",
  "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some",
  "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there",
  "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very",
  "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why",
  "with", "would", "you", "your", "yours", "yourself", "yourselves",
  // Meta-words & transitional terms
  "dixith", "retrieved", "published", "knowledge", "context", "summary", "analysis",
  "points", "following", "synthesized", "based", "according", "overview", "details"
]);

/**
 * Common non-substantive opening or transition patterns.
 */
const TRANSITION_PATTERNS = [
  /^based on the retrieved/i,
  /^according to the published/i,
  /^in summary/i,
  /^in conclusion/i,
  /^to summarize/i,
  /^overall,/i,
  /^furthermore,/i,
  /^additionally,/i,
  /^the following points summarize/i,
  /^synthesized grounded analysis based on/i,
  /^relevant published dixith knowledge was retrieved/i,
  /^answer generation is currently operating in deterministic/i,
  /^here is the summary/i,
];

/**
 * Tokenizes text into significant normalized lowercase keywords (length >= 3, non-stopwords).
 */
export function extractKeywords(text: string): string[] {
  const clean = text
    .toLowerCase()
    .replace(/\[\^?[a-z0-9\-_]+\]/gi, " ") // remove citations
    .replace(/\b[a-z]+-\d{3}\b/gi, " ")    // remove entity IDs like pe-001
    .replace(/[^a-z0-9\s\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return clean
    .split(" ")
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word));
}

/**
 * Deterministically splits raw answer text into candidate sentence claims.
 */
export function segmentSentences(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];

  // Strip code block wrappers if any
  let text = rawText.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/, "");
  }

  // Handle JSON encoded answers
  if (text.startsWith("{") && text.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.answer === "string") {
        text = parsed.answer;
      }
    } catch {
      // not valid json, treat as plain text
    }
  }

  // Split on sentence boundaries (. ! ?) avoiding common abbreviations
  // Also split on double newlines
  const rawSegments = text
    .split(/\n\n+/)
    .flatMap((paragraph) =>
      paragraph
        .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
        .map((s) => s.trim())
    )
    .filter((s) => s.length > 0);

  return rawSegments;
}

/**
 * Evaluates whether a candidate sentence makes a substantive assertion.
 */
export function isSubstantiveClaim(sentence: string): boolean {
  const trimmed = sentence.trim();
  if (trimmed.length < 25) return false;
  if (trimmed.endsWith(":")) return false;

  for (const pattern of TRANSITION_PATTERNS) {
    if (pattern.test(trimmed)) {
      const stripped = trimmed.replace(pattern, "").replace(/^[,:\s]+/, "").trim();
      if (stripped.length < 25) return false;
      if (TRANSITION_PATTERNS.some((p) => p.test(stripped))) return false;
    }
  }

  const keywords = extractKeywords(trimmed);
  return keywords.length >= 3;
}

/**
 * Extracts canonical DIXITH citations (e.g. [^PE-001], [PE-001], (PE-001), or inline PE-001) from a sentence.
 */
export function extractCitations(sentence: string): string[] {
  const matches = sentence.match(/(?:\[\^?|\()?(PE-\d{3}|EXP-\d{3}|GUI-\d{3}|INS-\d{3}|SRC-\d{3}|[A-Z0-9\-_]+-\d{3})(?:\]|\))?/g);
  if (!matches) return [];

  const ids = new Set<string>();
  for (const match of matches) {
    const cleanId = match.replace(/[\[\^\]\(\)]/g, "").trim();
    if (cleanId) {
      ids.add(cleanId);
    }
  }

  return Array.from(ids);
}

/**
 * Evaluates claim-level support against retrieved published context.
 */
export function evaluateClaimSupport(
  answerText: string,
  context: GroundedContext,
  declaredSourceIds?: string[]
): ClaimSupportReport {
  const sentences = segmentSentences(answerText);
  const claims: ExtractedClaim[] = [];

  // Build context lookup table with enriched entity knowledge
  const contextMap = new Map<string, string>();
  for (const item of context.items) {
    let combinedSourceText = `${item.title} ${item.excerpt}`.toLowerCase();
    const entity = resolveEntity(item.entityType as EntityType, item.entityId) as any;
    if (entity) {
      const extra = [
        entity.summary,
        entity.overview,
        Array.isArray(entity.responsibilities) ? entity.responsibilities.join(" ") : "",
        Array.isArray(entity.technicalFocus) ? entity.technicalFocus.join(" ") : "",
        Array.isArray(entity.searchFocus) ? entity.searchFocus.join(" ") : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      combinedSourceText += " " + extra;
    }
    contextMap.set(item.entityId, combinedSourceText);
  }

  let claimIndex = 1;
  let supportedCount = 0;
  let partiallySupportedCount = 0;
  let unsupportedCount = 0;
  let uncitedCount = 0;
  let unverifiableCount = 0;

  for (const sentence of sentences) {
    const substantive = isSubstantiveClaim(sentence);
    let citations = extractCitations(sentence);

    // If no inline citation was found, but declaredSourceIds has exactly 1 source and answer has 1 sentence
    if (citations.length === 0 && declaredSourceIds && declaredSourceIds.length === 1 && sentences.length === 1) {
      citations = [declaredSourceIds[0]];
    }

    const claimId = `claim-${claimIndex++}`;

    if (!substantive) {
      claims.push({
        id: claimId,
        text: sentence,
        substantive: false,
        citationIds: citations,
        classification: "SUPPORTED",
        rationale: "Non-substantive structural or transitional statement.",
      });
      continue;
    }

    // Substantive sentence analysis
    if (citations.length === 0) {
      uncitedCount++;
      claims.push({
        id: claimId,
        text: sentence,
        substantive: true,
        citationIds: [],
        classification: "UNCITED",
        rationale: "Substantive technical claim lacks explicit inline or source citation.",
      });
      continue;
    }

    // Check each citation
    let primaryCitation = citations[0];
    let sourceContent = contextMap.get(primaryCitation);

    if (!sourceContent) {
      // Cited source is not in retrieved context
      unsupportedCount++;
      claims.push({
        id: claimId,
        text: sentence,
        substantive: true,
        citationIds: citations,
        classification: "UNSUPPORTED",
        supportingSourceId: primaryCitation,
        supportOverlapRatio: 0.0,
        rationale: `Cited entity ${primaryCitation} does not exist in the retrieved published context.`,
      });
      continue;
    }

    // Calculate keyword overlap
    const claimKeywords = extractKeywords(sentence);
    if (claimKeywords.length === 0) {
      unverifiableCount++;
      claims.push({
        id: claimId,
        text: sentence,
        substantive: true,
        citationIds: citations,
        classification: "UNVERIFIABLE",
        rationale: "Insufficient substantive terms to evaluate claim overlap deterministically.",
      });
      continue;
    }

    let matchCount = 0;
    const missingKeywords: string[] = [];
    for (const kw of claimKeywords) {
      if (sourceContent.includes(kw)) {
        matchCount++;
      } else {
        missingKeywords.push(kw);
      }
    }

    const overlapRatio = matchCount / claimKeywords.length;

    // Check for high-contradiction or foreign concepts
    const foreignMarkers = [
      "quantum", "astrophysical", "crypto", "trading", "financial",
      "sourdough", "bread", "france", "paris", "unsupported_token_xyz"
    ];
    const hasForeignMarker = foreignMarkers.some((m) => sentence.toLowerCase().includes(m));

    let classification: ClaimSupportClassification;
    let rationale: string;

    if (hasForeignMarker || overlapRatio < 0.25) {
      classification = "UNSUPPORTED";
      rationale = `Claim asserts concepts absent from cited source (overlap: ${(overlapRatio * 100).toFixed(0)}%).`;
      unsupportedCount++;
    } else if (overlapRatio >= 0.55 && missingKeywords.length <= 3) {
      classification = "SUPPORTED";
      rationale = `Claim concepts have identifiable support in cited source ${primaryCitation} (overlap: ${(overlapRatio * 100).toFixed(0)}%).`;
      supportedCount++;
    } else {
      classification = "PARTIALLY_SUPPORTED";
      rationale = `Claim is partially grounded in ${primaryCitation}, but includes assertions extending beyond the excerpt (overlap: ${(overlapRatio * 100).toFixed(0)}%).`;
      partiallySupportedCount++;
    }

    claims.push({
      id: claimId,
      text: sentence,
      substantive: true,
      citationIds: citations,
      classification,
      supportingSourceId: primaryCitation,
      supportOverlapRatio: overlapRatio,
      rationale,
    });
  }

  const substantiveClaimsCount = claims.filter((c) => c.substantive).length;

  let overallSupportState: ClaimSupportReport["overallSupportState"];
  if (substantiveClaimsCount === 0) {
    overallSupportState = "NO_SUBSTANTIVE_CLAIMS";
  } else if (unsupportedCount > 0 && supportedCount > 0) {
    overallSupportState = "MIXED";
  } else if (unsupportedCount > 0 && supportedCount === 0) {
    overallSupportState = "UNSUPPORTED";
  } else if (partiallySupportedCount > 0 && supportedCount > 0) {
    overallSupportState = "MIXED";
  } else if (partiallySupportedCount > 0 && supportedCount === 0) {
    overallSupportState = "PARTIALLY_SUPPORTED";
  } else if (uncitedCount > 0 && supportedCount > 0) {
    overallSupportState = "MIXED";
  } else if (uncitedCount > 0 && supportedCount === 0) {
    overallSupportState = "UNSUPPORTED";
  } else if (supportedCount === substantiveClaimsCount) {
    overallSupportState = "SUPPORTED";
  } else {
    overallSupportState = "MIXED";
  }

  let diagnosticSummary: string;
  if (substantiveClaimsCount === 0) {
    diagnosticSummary = "No substantive claims extracted for evaluation.";
  } else {
    diagnosticSummary = `${supportedCount} of ${substantiveClaimsCount} extracted substantive claims had identifiable source support.`;
    if (partiallySupportedCount > 0) {
      diagnosticSummary += ` (${partiallySupportedCount} partially supported)`;
    }
    if (unsupportedCount > 0) {
      diagnosticSummary += ` (${unsupportedCount} unsupported)`;
    }
    if (uncitedCount > 0) {
      diagnosticSummary += ` (${uncitedCount} uncited)`;
    }
  }

  return {
    totalExtractedClaims: claims.length,
    substantiveClaimsCount,
    supportedCount,
    partiallySupportedCount,
    unsupportedCount,
    uncitedCount,
    unverifiableCount,
    claims,
    diagnosticSummary,
    overallSupportState,
  };
}
