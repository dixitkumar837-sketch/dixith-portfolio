import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "404 — Knowledge Node Not Found",
  description: "The requested search path or document node could not be resolved.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-[96px]">
      <Container>
        <div className="max-w-xl mx-auto text-center space-y-[24px]">
          <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-brand-accent">
            HTTP 404 · RESOLUTION ERROR
          </div>

          <h1 className="font-display text-[44px] sm:text-[56px] font-bold text-brand-text-primary tracking-tight leading-none">
            NODE NOT FOUND
          </h1>

          <p className="text-[16px] text-brand-text-secondary leading-relaxed font-sans">
            The requested URI path or entity document does not exist within the current research index.
          </p>

          <div className="pt-[12px]">
            <Button
              href="/"
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="w-4 h-4" />}
              iconPosition="left"
            >
              Return to Knowledge Graph
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
