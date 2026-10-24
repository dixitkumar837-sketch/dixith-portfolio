/**
 * DIXITH Phase 8M / 8M.1 — Ask DIXITH Answer Generation Pipeline
 *
 * Source-of-Truth Invariant:
 * Published DIXITH content is the authoritative knowledge boundary. Provider output is treated
 * as untrusted synthesis and must pass server-side grounding and citation validation before being
 * surfaced as an Ask DIXITH answer.
 *
 * Fail-Closed Invariant:
 * If provider output cannot be validated against the retrieved published context, the generated
 * response is rejected and the system returns a deterministic grounded fallback.
 *
 * Orchestrates the end-to-end grounded question answering pipeline:
 *   1. Query Sanitization (validateAskDixithQuery)
 *   2. Intent Classification (classifyIntent)
 *   3. Published-Only Retrieval (retrieveKnowledge)
 *   4. Public Graph Expansion (publicOnly: true)
 *   5. Context Budgeting (max 8,000 characters)
 *   6. Gating Check (NO_RELEVANT_CONTENT / INSUFFICIENT_EVIDENCE skip LLM)
 *   7. Grounded Provider Synthesis (OpenAI-compatible / Mock)
 *   8. Post-Generation Citation & Security Validation (validateProviderAnswer)
 *   9. Fail-Closed Error Handling & Provenance Assembly
 */

import {
  validateAskDixithQuery,
  retrieveKnowledge,
  buildSourceCitations,
  resolveEvidenceState,
  resolveAnswerStatus,
  classifyIntent,
} from "./retrieval";
import {
  validateProviderAnswer,
  GROUNDING_SYSTEM_INSTRUCTIONS,
} from "./grounding";
import { evaluateClaimSupport } from "./claims";
import { OpenAiCompatibleProvider } from "./providers/openai-compatible";
import { getRelatedContent, resolveEntity } from "../content-utils";
import { isIndexable, EntityType } from "../../data/types";
import {
  AskDixithAnswer,
  AskDixithOptions,
  AskDixithSource,
  AskDixithSearchableEntityType,
  AnswerGenerationProvider,
  AskDixithProviderErrorType,
  GroundedContext,
} from "../../data/ask-dixith-types";

export interface PipelineOptions extends AskDixithOptions {
  provider?: AnswerGenerationProvider;
}

/**
 * Executes the complete Ask DIXITH pipeline.
 */
export async function executeAskDixithPipeline(
  rawQuery: string,
  options?: PipelineOptions
): Promise<AskDixithAnswer> {
  const validation = validateAskDixithQuery(rawQuery);
  if (!validation.valid) {
    throw new Error(validation.errors.join(" ") || "Invalid query.");
  }

  const queryText = validation.sanitizedQuery;
  const startTime = Date.now();

  // ── Step 1: Published-Only Retrieval & Context Assembly ────────────────────
  let context: GroundedContext;
  const retrievalMode = options?.retrievalMode ?? "HYBRID";

  try {
    context = await retrieveKnowledge(
      {
        text: queryText,
        retrievalMode,
      },
      options
    );
  } catch {
    const retrievalDurationMs = Date.now() - startTime;
    return {
      requestId: `ask-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      query: queryText,
      intent: classifyIntent(queryText),
      answer:
        "A technical retrieval error occurred while accessing published DIXITH knowledge. Please try again or switch retrieval modes.",
      answerStatus: "RETRIEVAL_ERROR",
      retrievalMode,
      sources: [],
      evidenceState: {
        hasEmpiricalEvidence: false,
        researchPublished: false,
        limitations: ["Retrieval operation encountered a technical error."],
        quarantinedEvidenceExcluded: false,
        provenanceSummary: "No published evidence available due to retrieval error.",
      },
      limitations: ["Retrieval operation encountered a technical error."],
      relatedContent: [],
      generatedAt: new Date().toISOString(),
      modelProvider: null,
      modelVersion: null,
      groundingMetadata: {
        retrievedEntityIds: [],
        selectedEntityIds: [],
        retrievalDurationMs,
        generationDurationMs: 0,
        contentVersion: "phase-8m-v1",
      },
    };
  }

  const retrievalDurationMs = Date.now() - startTime;
  const answerStatus = resolveAnswerStatus(context);
  const sources = buildSourceCitations(context);
  const evidenceState = resolveEvidenceState(context);

  // ── Step 2: Public Graph Relationship Expansion ───────────────────────────
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

  const limitations = [...evidenceState.limitations];
  limitations.push(
    "DIXITH research studies (EXP-012..014) and implementation guides are currently in review/draft and remain excluded from public retrieval."
  );

  // ── Step 3: Gating Rules (Skip LLM for non-groundable queries) ─────────────
  // Rule: NO EVIDENCE = NO GENERATED CLAIMS
  if (answerStatus === "NO_RELEVANT_CONTENT") {
    return {
      requestId: `ask-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      query: queryText,
      intent: context.intent,
      answer: "I couldn't find relevant published material in the DIXITH knowledge base for this question.",
      answerStatus: "NO_RELEVANT_CONTENT",
      retrievalMode: context.retrievalMode,
      sources: [],
      evidenceState,
      limitations: ["No published DIXITH content matches this query."],
      relatedContent: [],
      generatedAt: new Date().toISOString(),
      modelProvider: null,
      modelVersion: null,
      groundingMetadata: {
        retrievedEntityIds: [],
        selectedEntityIds: [],
        retrievalDurationMs,
        generationDurationMs: 0,
        contentVersion: "phase-8m-v1",
      },
    };
  }

  if (answerStatus === "INSUFFICIENT_EVIDENCE") {
    return {
      requestId: `ask-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      query: queryText,
      intent: context.intent,
      answer:
        "I don't have enough published evidence in the DIXITH knowledge base to answer that confidently. The platform currently hosts published technical experience in healthcare clinical systems, enterprise e-commerce platforms, and international search architectures, but does not yet contain published findings addressing this query.",
      answerStatus: "INSUFFICIENT_EVIDENCE",
      retrievalMode: context.retrievalMode,
      sources,
      evidenceState,
      limitations,
      relatedContent,
      generatedAt: new Date().toISOString(),
      modelProvider: null,
      modelVersion: null,
      groundingMetadata: {
        retrievedEntityIds: context.items.map((i) => i.entityId),
        selectedEntityIds: sources.map((s) => s.entityId),
        retrievalDurationMs,
        generationDurationMs: 0,
        contentVersion: "phase-8m-v1",
      },
    };
  }

  // ── Step 4: Provider Selection & Execution ─────────────────────────────────
  const provider = options?.provider || new OpenAiCompatibleProvider();
  const providerAvailable = await provider.isAvailable();

  // If no provider API key configured: fail closed gracefully to deterministic retrieval
  if (!providerAvailable) {
    const demoAnswer =
      answerStatus === "ANSWERED"
        ? `Relevant published DIXITH knowledge was retrieved. Answer generation is currently operating in deterministic retrieval mode because provider credentials are not configured. Currently, ${context.items.length} published entities provide authoritative technical context: ${sources.map((s) => s.title).join(", ")}.`
        : `Relevant published DIXITH knowledge was found with partial coverage. Answer generation is currently operating in deterministic retrieval mode because provider credentials are not configured. Currently, 1 published entity provides relevant context: ${sources[0]?.title || "Published experience"}.`;

    return {
      requestId: `ask-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      query: queryText,
      intent: context.intent,
      answer: demoAnswer,
      answerStatus,
      retrievalMode: context.retrievalMode,
      sources,
      evidenceState,
      limitations: [
        ...limitations,
        "Answer generation provider is not configured (ASK_DIXITH_PROVIDER_API_KEY absent).",
      ],
      relatedContent,
      generatedAt: new Date().toISOString(),
      modelProvider: null,
      modelVersion: null,
      groundingMetadata: {
        retrievedEntityIds: context.items.map((i) => i.entityId),
        selectedEntityIds: sources.map((s) => s.entityId),
        retrievalDurationMs,
        generationDurationMs: 0,
        contentVersion: "phase-8m-v1",
      },
    };
  }

  // Provider is available: execute structured generation
  const genStartTime = Date.now();
  let providerResponse: any;
  let providerError: AskDixithProviderErrorType | null = null;

  try {
    providerResponse = await provider.generateAnswer({
      query: queryText,
      groundedContext: context,
      systemInstructions: GROUNDING_SYSTEM_INSTRUCTIONS,
      citeSources: true,
    });
  } catch (err: any) {
    providerError = (err?.code as AskDixithProviderErrorType) || "PROVIDER_UNAVAILABLE";
  }

  const generationDurationMs = Date.now() - genStartTime;

  // Handle provider failure (timeout, rate limit, unavailable)
  if (providerError || !providerResponse) {
    return {
      requestId: `ask-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      query: queryText,
      intent: context.intent,
      answer:
        "Answer generation is temporarily unavailable. The retrieved DIXITH sources are still available below.",
      answerStatus,
      retrievalMode: context.retrievalMode,
      sources,
      evidenceState,
      limitations: [
        ...limitations,
        `Provider generation failed with technical status: ${providerError || "PROVIDER_UNAVAILABLE"}.`,
      ],
      relatedContent,
      generatedAt: new Date().toISOString(),
      modelProvider: null,
      modelVersion: null,
      groundingMetadata: {
        retrievedEntityIds: context.items.map((i) => i.entityId),
        selectedEntityIds: sources.map((s) => s.entityId),
        retrievalDurationMs,
        generationDurationMs,
        contentVersion: "phase-8m-v1",
      },
    };
  }

  // ── Step 5: Server-Side Answer Validation ──────────────────────────────────
  const validationResult = validateProviderAnswer(providerResponse.answer, context);

  if (!validationResult.valid) {
    return {
      requestId: `ask-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      query: queryText,
      intent: context.intent,
      answer:
        "Answer generation is temporarily unavailable. The retrieved DIXITH sources are still available below.",
      answerStatus,
      retrievalMode: context.retrievalMode,
      sources,
      evidenceState,
      limitations: [
        ...limitations,
        `Provider output failed validation: ${validationResult.reason}`,
      ],
      relatedContent,
      generatedAt: new Date().toISOString(),
      modelProvider: null,
      modelVersion: null,
      groundingMetadata: {
        retrievedEntityIds: context.items.map((i) => i.entityId),
        selectedEntityIds: sources.map((s) => s.entityId),
        retrievalDurationMs,
        generationDurationMs,
        contentVersion: "phase-8m-v1",
      },
    };
  }

  // ── Step 6: Claim-Level Support Validation (Phase 8N) ─────────────────────
  const claimReport = evaluateClaimSupport(
    validationResult.answer,
    context,
    validationResult.citedEntityIds
  );

  // Success: Validated grounded answer
  const combinedLimitations = [
    ...limitations,
    ...(validationResult.limitations || []),
  ];

  if (claimReport.overallSupportState === "PARTIALLY_SUPPORTED" || claimReport.overallSupportState === "MIXED") {
    combinedLimitations.push(
      `Claim Support Diagnostic: ${claimReport.diagnosticSummary}`
    );
  }

  return {
    requestId: `ask-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    query: queryText,
    intent: context.intent,
    answer: validationResult.answer,
    answerStatus,
    retrievalMode: context.retrievalMode,
    sources,
    evidenceState,
    limitations: combinedLimitations,
    relatedContent,
    generatedAt: new Date().toISOString(),
    modelProvider: providerResponse.providerName,
    modelVersion: providerResponse.modelVersion,
    claimReport,
    groundingMetadata: {
      retrievedEntityIds: context.items.map((i) => i.entityId),
      selectedEntityIds: validationResult.citedEntityIds.length > 0
        ? validationResult.citedEntityIds
        : sources.map((s) => s.entityId),
      retrievalDurationMs,
      generationDurationMs,
      contentVersion: "phase-8n-v1",
    },
  };
}
