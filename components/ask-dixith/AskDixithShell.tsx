"use client";

import React, { useReducer } from "react";
import { AskDixithInput } from "./AskDixithInput";
import { AskDixithAnswerPanel } from "./AskDixithAnswerPanel";
import {
  askDixithReducer,
  INITIAL_UI_STATE,
} from "./AskDixithState";
import { askDixithAction } from "@/app/ask-dixith/actions";

interface AskDixithShellProps {
  initialQuery?: string;
}

export const AskDixithShell: React.FC<AskDixithShellProps> = ({
  initialQuery = "",
}) => {
  const [state, dispatch] = useReducer(askDixithReducer, {
    ...INITIAL_UI_STATE,
    query: initialQuery,
  });

  const handleSubmit = async (query: string) => {
    dispatch({ type: "SUBMIT", query });

    try {
      const result = await askDixithAction(query);
      dispatch({ type: "RESOLVE", answer: result });
    } catch (err: any) {
      dispatch({
        type: "REJECT",
        error: err?.message || "Failed to retrieve published DIXITH knowledge.",
      });
    }
  };

  const handleRetry = () => {
    if (state.query) {
      handleSubmit(state.query);
    } else {
      dispatch({ type: "RESET" });
    }
  };

  return (
    <div className="space-y-8 max-w-[960px] mx-auto w-full">
      <AskDixithInput
        onSubmit={handleSubmit}
        isSubmitting={state.status === "SUBMITTING"}
        initialQuery={state.query}
      />
      <AskDixithAnswerPanel state={state} onRetry={handleRetry} />
    </div>
  );
};
