"use server";

/**
 * DIXITH Phase 8M — Ask DIXITH Server Action
 *
 * Server-side entrypoint for the /ask-dixith research console.
 * Strictly decoupled from client components: credentials, provider SDKs,
 * and authorization headers are never bundled or exposed to the browser.
 */

import { executeAskDixithPipeline } from "@/lib/ask-dixith/pipeline";
import { AskDixithAnswer } from "@/data/ask-dixith-types";

export async function askDixithAction(query: string): Promise<AskDixithAnswer> {
  return await executeAskDixithPipeline(query);
}
