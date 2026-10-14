/**
 * DIXITH Phase 8L — Ask DIXITH UI Demo Adapter
 *
 * Local deterministic adapter for demonstrating the /ask-dixith interface
 * using verified published retrieval.
 *
 * CRITICAL DISCIPLINE:
 * - This module does NOT call or pretend to be an LLM.
 * - It does NOT invent conclusions, statistics, citations, or research findings.
 * - It draws strictly from published DIXITH content (currently PE-001, PE-002, PE-003).
 * - Research studies (EXP-012..014) and guides remain excluded until published.
 * - Provider integration is strictly deferred to Phase 8M.
 */

import {
  validateAskDixithQuery,
  retrieveKnowledge,
  buildSourceCitations,
  resolveEvidenceState,
  resolveAnswerStatus,
} from "./retrieval";
import { getRelatedContent, resolveEntity } from "../content-utils";
import { isIndexable, EntityType } from "../../data/types";
import {
  AskDixithAnswer,
  AskDixithOptions,
  AskDixithSource,
  AskDixithSearchableEntityType,
} from "../../data/ask-dixith-types";

/**
 * Executes local deterministic retrieval and constructs a structured demo answer.
 *
 * Flow:
 *   Question
 *     ↓
 *   validateAskDixithQuery()
 *     ↓
 *   retrieveKnowledge() [Keyword / Semantic / Hybrid]
 *     ↓
 *   GroundedContext (PUBLISHED items only)
 *     ↓
 *   Deterministic UI Demo Answer Construction
 */
export async function executeAskDixithDemo(
  rawQuery: string,
  options?: AskDixithOptions
): Promise<AskDixithAnswer> {
  const validation = validateAskDixithQuery(rawQuery);
  if (!validation.valid) {
    throw new Error(validation.errors.join(" ") || "Invalid query.");
  }

  const queryText = validation.sanitizedQuery;
  const startTime = Date.now();

  // Retrieve published knowledge
  const context = await retrieveKnowledge(
    {
      text: queryText,
      retrievalMode: options?.retrievalMode ?? "HYBRID",
    },
    options
  );

  const retrievalDurationMs = Date.now() - startTime;
  const answerStatus = resolveAnswerStatus(context);
  const sources = buildSourceCitations(context);
  const evidenceState = resolveEvidenceState(context);

  // Resolve public related content from top sources
  const relatedContent: AskDixithSource[] = [];
  const seenIds = new Set<string>(sources.map((s) => s.entityId));

  for (const item of context.items.slice(0, 3)) {
    const relatedItems = getRelatedContent(item.entityType as EntityType, item.entityId, {
      publicOnly: true,
    });

    for (const rel of relatedItems) {
      if (!seenIds.has(rel.targetId)) {
        seenIds.add(rel.targetId);
        const entity = resolveEntity(rel.targetType, rel.targetId) as any;
        if (entity && isIndexable(entity.status)) {
          relatedContent.push({
            entityId: rel.targetId,
            entityType: rel.targetType as AskDixithSearchableEntityType,
            title: entity.title || rel.targetId,
            href: `/${rel.targetType}/${entity.slug || rel.targetId}`,
            excerpt: entity.summary || entity.overview || "",
            relevance: `Related to ${item.entityId}`,
            sourceIds: entity.sourceIds,
            topicIds: entity.topics,
            retrievalSignal: "relationship",
          });
        }
      }
    }
  }

  // Construct honest deterministic answer text
  let answerText = "";
  const limitations = [...evidenceState.limitations];

  limitations.push(
    "DIXITH research studies (EXP-012..014) and implementation guides are currently in review/draft and remain excluded from public retrieval."
  );

  switch (answerStatus) {
    case "ANSWERED":
      answerText = `Relevant published DIXITH knowledge was retrieved. The future answer-generation layer (Phase 8M) will synthesize this material into a grounded response. Currently, ${context.items.length} published entities provide authoritative technical context for this inquiry: ${sources.map((s) => s.title).join(", ")}.`;
      break;

    case "PARTIALLY_SUPPORTED":
      answerText = `Relevant published DIXITH knowledge was found with partial coverage. The future answer-generation layer (Phase 8M) will synthesize this material into a grounded response. Currently, 1 published entity provides relevant context for this query: ${sources[0]?.title || "Published experience"}.`;
      break;

    case "INSUFFICIENT_EVIDENCE":
      answerText = `I don't have enough published evidence in the DIXITH knowledge base to answer that confidently. The platform currently hosts published technical experience in healthcare clinical systems, enterprise e-commerce platforms, and international search architectures, but does not yet contain published findings addressing this query.`;
      break;

    case "NO_RELEVANT_CONTENT":
    default:
      answerText = `I couldn't find relevant published material in the DIXITH knowledge base for this question.`;
      break;
  }

  return {
    requestId: `ask-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    query: queryText,
    intent: context.intent,
    answer: answerText,
    answerStatus,
    retrievalMode: context.retrievalMode,
    sources,
    evidenceState,
    limitations,
    relatedContent,
    generatedAt: new Date().toISOString(),
    modelProvider: null, // Explicitly null: no LLM in Phase 8L
    modelVersion: null,
    groundingMetadata: {
      retrievedEntityIds: context.items.map((i) => i.entityId),
      selectedEntityIds: sources.map((s) => s.entityId),
      retrievalDurationMs,
      generationDurationMs: 0,
      contentVersion: "phase-8l-demo-v1",
      embeddingModel: "MiniLM-L6-v2-local",
    },
  };
}
