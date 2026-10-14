/**
 * DIXITH Phase 8L — Ask DIXITH Client State Machine Contract & Reducer
 *
 * Explicit state machine governing the /ask-dixith research console.
 *
 * State Transitions:
 *   IDLE
 *     ↓
 *   SUBMITTING
 *     ↓
 *   ANSWERED | PARTIALLY_SUPPORTED | INSUFFICIENT_EVIDENCE | NO_RELEVANT_CONTENT
 *     │
 *     └── (Any retrieval failure) ──> ERROR
 *
 * Invariant: No persistent chat history. Each question replaces the previous result.
 */

import { AskDixithAnswer } from "@/data/ask-dixith-types";

export type AskDixithClientStatus =
  | "IDLE"
  | "SUBMITTING"
  | "ANSWERED"
  | "PARTIALLY_SUPPORTED"
  | "INSUFFICIENT_EVIDENCE"
  | "NO_RELEVANT_CONTENT"
  | "ERROR";

export interface AskDixithUIState {
  status: AskDixithClientStatus;
  query: string;
  answer: AskDixithAnswer | null;
  error: string | null;
  submittedAt: string | null;
}

export type AskDixithAction =
  | { type: "SUBMIT"; query: string }
  | { type: "RESOLVE"; answer: AskDixithAnswer }
  | { type: "REJECT"; error: string }
  | { type: "RESET" };

export const INITIAL_UI_STATE: AskDixithUIState = {
  status: "IDLE",
  query: "",
  answer: null,
  error: null,
  submittedAt: null,
};

export function askDixithReducer(
  state: AskDixithUIState,
  action: AskDixithAction
): AskDixithUIState {
  switch (action.type) {
    case "SUBMIT":
      return {
        ...state,
        status: "SUBMITTING",
        query: action.query,
        error: null,
        submittedAt: new Date().toISOString(),
      };

    case "RESOLVE":
      return {
        ...state,
        status:
          action.answer.answerStatus === "RETRIEVAL_ERROR"
            ? "ERROR"
            : action.answer.answerStatus,
        answer: action.answer,
        error:
          action.answer.answerStatus === "RETRIEVAL_ERROR"
            ? "Retrieval operation failed."
            : null,
      };

    case "REJECT":
      return {
        ...state,
        status: "ERROR",
        error: action.error,
        answer: null,
      };

    case "RESET":
      return INITIAL_UI_STATE;

    default:
      return state;
  }
}
