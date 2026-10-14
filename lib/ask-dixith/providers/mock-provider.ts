/**
 * DIXITH Phase 8M — Mock Grounded Provider for Offline Testing
 *
 * Deterministic mock provider that implements AnswerGenerationProvider.
 * Strictly used for automated test suites to verify contract conformance,
 * validation behavior, and error handling without external API calls or credits.
 */

import {
  AnswerGenerationProvider,
  AnswerGenerationRequest,
  AnswerGenerationResponse,
  AskDixithProviderErrorType,
} from "@/data/ask-dixith-types";

export type MockProviderBehavior =
  | "SUCCESS"
  | "MALFORMED_RESPONSE"
  | "UNKNOWN_SOURCE"
  | "UNPUBLISHED_SOURCE"
  | "TIMEOUT"
  | "PROVIDER_ERROR"
  | "SUPPORTED_CLAIMS"
  | "PARTIALLY_SUPPORTED_CLAIMS"
  | "UNSUPPORTED_CLAIMS"
  | "UNCITED_CLAIMS"
  | "MIXED_SUPPORT";

export class MockGroundedProvider implements AnswerGenerationProvider {
  readonly name = "mock-grounded-provider";

  private behavior: MockProviderBehavior;
  private readonly modelVersion = "mock-grounded-v1";

  constructor(behavior: MockProviderBehavior = "SUCCESS") {
    this.behavior = behavior;
  }

  setBehavior(behavior: MockProviderBehavior): void {
    this.behavior = behavior;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateAnswer(
    request: AnswerGenerationRequest
  ): Promise<AnswerGenerationResponse> {
    const startTime = Date.now();

    switch (this.behavior) {
      case "MALFORMED_RESPONSE":
        return {
          answer: "Not valid JSON at all - plain non-JSON text",
          answerStatus: "ANSWERED",
          citedEntityIds: [],
          providerName: this.name,
          modelVersion: this.modelVersion,
          durationMs: Date.now() - startTime,
        };

      case "UNKNOWN_SOURCE":
        return {
          answer: JSON.stringify({
            answer: "This references an entity that was never retrieved.",
            sourceIds: ["NON-EXISTENT-SOURCE-999"],
            limitations: ["Testing unknown source rejection."],
          }),
          answerStatus: "ANSWERED",
          citedEntityIds: ["NON-EXISTENT-SOURCE-999"],
          providerName: this.name,
          modelVersion: this.modelVersion,
          durationMs: Date.now() - startTime,
        };

      case "UNPUBLISHED_SOURCE":
        return {
          answer: JSON.stringify({
            answer: "This references an unpublished research entity.",
            sourceIds: ["EXP-014"],
            limitations: ["Testing unpublished research rejection."],
          }),
          answerStatus: "ANSWERED",
          citedEntityIds: ["EXP-014"],
          providerName: this.name,
          modelVersion: this.modelVersion,
          durationMs: Date.now() - startTime,
        };

      case "TIMEOUT": {
        const err = new Error("Mock provider timed out.");
        (err as any).code = "PROVIDER_TIMEOUT" as AskDixithProviderErrorType;
        throw err;
      }

      case "PROVIDER_ERROR": {
        const err = new Error("Mock provider internal server error.");
        (err as any).code = "PROVIDER_UNAVAILABLE" as AskDixithProviderErrorType;
        throw err;
      }

      case "SUPPORTED_CLAIMS": {
        const validSourceId = request.groundedContext.items[0]?.entityId || "PE-001";
        let groundedAnswer = "";
        if (validSourceId === "PE-002") {
          groundedAnswer = `PE-002 establishes cross-border hreflang mapping matrices and reciprocal tag validation workflows [^PE-002]. The platform standardizes multi-regional canonicalization rules to prevent cross-language content cannibalization [^PE-002].`;
        } else if (validSourceId === "PE-003") {
          groundedAnswer = `PE-003 structures Product, Offer, and MerchantReturnPolicy Schema.org layers for retail platforms [^PE-003]. Catalog variant attribute modeling prepares e-commerce platforms for generative search engine discovery [^PE-003].`;
        } else {
          groundedAnswer = `PE-001 details clinical taxonomy hierarchies and Schema.org MedicalEntity configurations for diagnostic departments [^PE-001]. The architecture incorporates local business structured data and multi-location geographical signals [^PE-001].`;
        }

        const answerPayload = {
          answer: groundedAnswer,
          sourceIds: [validSourceId],
          limitations: ["Analysis bounded strictly by retrieved published context."],
        };

        return {
          answer: JSON.stringify(answerPayload),
          answerStatus: "ANSWERED",
          citedEntityIds: [validSourceId],
          providerName: this.name,
          modelVersion: this.modelVersion,
          durationMs: Date.now() - startTime,
        };
      }

      case "PARTIALLY_SUPPORTED_CLAIMS": {
        const validSourceId = request.groundedContext.items[0]?.entityId || "PE-001";
        const answerPayload = {
          answer: `PE-001 establishes clinical taxonomy hierarchies, but also implements automated robotic surgery protocols across all regional hospitals [^PE-001].`,
          sourceIds: [validSourceId],
          limitations: ["Claim extends beyond verified published documentation."],
        };

        return {
          answer: JSON.stringify(answerPayload),
          answerStatus: "ANSWERED",
          citedEntityIds: [validSourceId],
          providerName: this.name,
          modelVersion: this.modelVersion,
          durationMs: Date.now() - startTime,
        };
      }

      case "UNSUPPORTED_CLAIMS": {
        const validSourceId = request.groundedContext.items[0]?.entityId || "PE-001";
        const answerPayload = {
          answer: `PE-001 establishes an autonomous quantum cryptographic protocol for high-frequency algorithmic financial trading [^PE-001].`,
          sourceIds: [validSourceId],
          limitations: ["Claim lacks evidence in published DIXITH context."],
        };

        return {
          answer: JSON.stringify(answerPayload),
          answerStatus: "ANSWERED",
          citedEntityIds: [validSourceId],
          providerName: this.name,
          modelVersion: this.modelVersion,
          durationMs: Date.now() - startTime,
        };
      }

      case "UNCITED_CLAIMS": {
        const answerPayload = {
          answer: `Healthcare search architecture requires structuring clinical taxonomies and diagnostic imaging modalities without exception.`,
          sourceIds: [],
          limitations: ["Assertions lack inline citations."],
        };

        return {
          answer: JSON.stringify(answerPayload),
          answerStatus: "ANSWERED",
          citedEntityIds: [],
          providerName: this.name,
          modelVersion: this.modelVersion,
          durationMs: Date.now() - startTime,
        };
      }

      case "MIXED_SUPPORT": {
        const validSourceId = request.groundedContext.items[0]?.entityId || "PE-001";
        const mixedText = [
          `PE-001 focuses on structuring clinical service taxonomies across medical diagnostic departments [^PE-001].`,
          `PE-001 organizes medical schema frameworks while administering proprietary pharmaceutical trials [^PE-001].`,
          `PE-001 details deep space astrophysical telescope calibrations [^PE-001].`,
          `Search engine crawlers evaluate localized facility landing page hierarchies without delay.`
        ].join(" ");

        const answerPayload = {
          answer: mixedText,
          sourceIds: [validSourceId],
          limitations: ["Answer contains assertions with variable degrees of verifiable support."],
        };

        return {
          answer: JSON.stringify(answerPayload),
          answerStatus: "ANSWERED",
          citedEntityIds: [validSourceId],
          providerName: this.name,
          modelVersion: this.modelVersion,
          durationMs: Date.now() - startTime,
        };
      }

      case "SUCCESS":
      default: {
        // Return valid JSON citing the first available retrieved source ID
        const validSourceId = request.groundedContext.items[0]?.entityId || "PE-001";
        const answerPayload = {
          answer: `Synthesized grounded analysis based on published DIXITH knowledge for: "${request.query}".`,
          sourceIds: [validSourceId],
          limitations: ["Analysis bounded strictly by retrieved published context."],
        };

        return {
          answer: JSON.stringify(answerPayload),
          answerStatus: "ANSWERED",
          citedEntityIds: [validSourceId],
          providerName: this.name,
          modelVersion: this.modelVersion,
          durationMs: Date.now() - startTime,
        };
      }
    }
  }
}
