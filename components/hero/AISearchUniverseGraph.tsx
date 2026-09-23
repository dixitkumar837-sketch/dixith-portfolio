"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NodeData {
  id: string;
  label: string;
  sublabel?: string;
  category: "user" | "intent" | "knowledge" | "engine" | "answer";
  x: number; // 0 - 100 percentage
  y: number; // 0 - 100 percentage
  tier: number;
}

interface EdgeData {
  from: string;
  to: string;
}

export const AISearchUniverseGraph: React.FC<{ className?: string }> = ({
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Desktop Nodes (percentage coordinates across 640x480 canvas viewBox)
  const nodes: NodeData[] = [
    // Stage 1: User
    { id: "user", label: "USER", sublabel: "Human Discovery Demand", category: "user", x: 10, y: 50, tier: 1 },

    // Stage 2: Intent
    { id: "intent", label: "USER INTENT", sublabel: "Semantic Vector", category: "intent", x: 26, y: 50, tier: 2 },

    // Stage 3: Content / Entities / Authority
    { id: "entities", label: "ENTITIES", sublabel: "Knowledge Graph Node", category: "knowledge", x: 42, y: 24, tier: 3 },
    { id: "authority", label: "AUTHORITY", sublabel: "Citation Trust Signal", category: "knowledge", x: 42, y: 50, tier: 3 },
    { id: "content", label: "CONTENT", sublabel: "Structured Schema", category: "knowledge", x: 42, y: 76, tier: 3 },

    // Stage 4: Search Systems (Exactly the SIX validated systems)
    { id: "sys-google", label: "Google AI Overview", category: "engine", x: 70, y: 14, tier: 4 },
    { id: "sys-chatgpt", label: "ChatGPT", category: "engine", x: 70, y: 28, tier: 4 },
    { id: "sys-perplexity", label: "Perplexity", category: "engine", x: 70, y: 42, tier: 4 },
    { id: "sys-claude", label: "Claude", category: "engine", x: 70, y: 58, tier: 4 },
    { id: "sys-gemini", label: "Gemini", category: "engine", x: 70, y: 72, tier: 4 },
    { id: "sys-copilot", label: "Microsoft Copilot", category: "engine", x: 70, y: 86, tier: 4 },

    // Stage 5: Answers
    { id: "answers", label: "ANSWERS", sublabel: "Generative Recommendation", category: "answer", x: 92, y: 50, tier: 5 },
  ];

  // Graph Edges
  const edges: EdgeData[] = [
    // User -> Intent
    { from: "user", to: "intent" },

    // Intent -> Knowledge
    { from: "intent", to: "entities" },
    { from: "intent", to: "authority" },
    { from: "intent", to: "content" },

    // Knowledge cross-synapses
    { from: "entities", to: "authority" },
    { from: "authority", to: "content" },

    // Knowledge -> Engines
    { from: "entities", to: "sys-google" },
    { from: "entities", to: "sys-chatgpt" },
    { from: "authority", to: "sys-perplexity" },
    { from: "authority", to: "sys-claude" },
    { from: "content", to: "sys-gemini" },
    { from: "content", to: "sys-copilot" },

    // Engine cross-connections
    { from: "sys-google", to: "sys-perplexity" },
    { from: "sys-chatgpt", to: "sys-claude" },
    { from: "sys-gemini", to: "sys-copilot" },

    // Engines -> Answers
    { from: "sys-google", to: "answers" },
    { from: "sys-chatgpt", to: "answers" },
    { from: "sys-perplexity", to: "answers" },
    { from: "sys-claude", to: "answers" },
    { from: "sys-gemini", to: "answers" },
    { from: "sys-copilot", to: "answers" },
  ];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    },
    [prefersReducedMotion]
  );

  const isEdgeHighlighted = (edge: EdgeData) => {
    if (!activeNode) return false;
    return edge.from === activeNode || edge.to === activeNode;
  };

  const getNodeCoords = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return { x: 0, y: 0 };

    // Subtle pointer parallax displacement (max 1.5% offset)
    if (!prefersReducedMotion && activeNode === null) {
      const offsetX = (mousePos.x - 50) * 0.02 * (node.tier - 3);
      const offsetY = (mousePos.y - 50) * 0.02 * (node.tier - 3);
      return { x: node.x + offsetX, y: node.y + offsetY };
    }

    return { x: node.x, y: node.y };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setActiveNode(null);
        setHoveredNode(null);
        setMousePos({ x: 50, y: 50 });
      }}
      className={cn(
        "relative w-full rounded-lg border border-brand-border/70 bg-gradient-to-br from-brand-bg-secondary/70 via-brand-surface/30 to-brand-bg/80 p-[20px] sm:p-[28px] overflow-hidden select-none transition-colors duration-300 group hover:border-brand-accent/40",
        className
      )}
      aria-label="AI Search Universe Knowledge Graph Visualization"
    >
      {/* Visual Header / Editorial Metadata */}
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-[14px] mb-[16px]">
        <div className="flex items-center gap-[8px]">
          <span className="w-[6px] h-[6px] rounded-full bg-brand-accent animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-brand-text-muted">
            AI SEARCH UNIVERSE · INFORMATION FLOW
          </span>
        </div>
        <div className="font-mono text-[11px] text-brand-accent/90 tracking-wider">
          6 VALIDATED SYSTEMS
        </div>
      </div>

      {/* Desktop & Tablet SVG Graph View */}
      <div className="hidden sm:block relative w-full aspect-[16/10] max-h-[460px]">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Subtle Gradient for Active Edge Highlighting */}
            <linearGradient id="edgeActiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.8" />
            </linearGradient>

            {/* Subtle Node Aura Filter */}
            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Graph Connection Edges */}
          {edges.map((edge) => {
            const start = getNodeCoords(edge.from);
            const end = getNodeCoords(edge.to);
            const active = isEdgeHighlighted(edge);

            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={active ? "url(#edgeActiveGrad)" : "#1E293B"}
                strokeWidth={active ? "0.6" : "0.3"}
                strokeDasharray={edge.from.startsWith("sys-") && edge.to.startsWith("sys-") ? "1 1" : undefined}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Graph Nodes */}
          {nodes.map((node) => {
            const pos = getNodeCoords(node.id);
            const isActive = activeNode === node.id;
            const isRelated =
              activeNode &&
              edges.some(
                (e) =>
                  (e.from === activeNode && e.to === node.id) ||
                  (e.to === activeNode && e.from === node.id)
              );

            const isPrimary = node.category === "user" || node.category === "answer";
            const isEngine = node.category === "engine";

            return (
              <g
                key={node.id}
                tabIndex={0}
                role="button"
                aria-label={`${node.label}${node.sublabel ? `: ${node.sublabel}` : ""}`}
                onMouseEnter={() => {
                  setActiveNode(node.id);
                  setHoveredNode(node);
                }}
                onFocus={() => {
                  setActiveNode(node.id);
                  setHoveredNode(node);
                }}
                onBlur={() => {
                  setActiveNode(null);
                  setHoveredNode(null);
                }}
                className="cursor-pointer focus:outline-none"
              >
                {/* Outer Target Circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isPrimary ? 3.5 : isEngine ? 2.2 : 2.8}
                  fill="transparent"
                  stroke={
                    isActive
                      ? "#3B82F6"
                      : isRelated
                      ? "#2563EB"
                      : isEngine
                      ? "#172033"
                      : "#1E293B"
                  }
                  strokeWidth={isActive ? "0.6" : "0.35"}
                  className="transition-all duration-200"
                />

                {/* Core Dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isPrimary ? 1.4 : isEngine ? 0.9 : 1.1}
                  fill={
                    isActive
                      ? "#F8FAFC"
                      : isRelated
                      ? "#3B82F6"
                      : isEngine
                      ? "#2563EB"
                      : "#CBD5E1"
                  }
                  filter={isActive ? "url(#nodeGlow)" : undefined}
                  className="transition-all duration-200"
                />

                {/* Technical Node Text Label */}
                <text
                  x={pos.x}
                  y={pos.y - (isPrimary ? 4.5 : 3.5)}
                  textAnchor="middle"
                  fill={
                    isActive
                      ? "#F8FAFC"
                      : isRelated
                      ? "#93C5FD"
                      : isEngine
                      ? "#94A3B8"
                      : "#CBD5E1"
                  }
                  fontSize={isPrimary ? "2.6" : isEngine ? "2.2" : "2.4"}
                  fontFamily="var(--font-jetbrains-mono), monospace"
                  fontWeight={isActive || isPrimary ? "600" : "400"}
                  className="transition-colors duration-200 pointer-events-none select-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Mobile Streamlined Representation (Graceful simplification) */}
      <div className="block sm:hidden space-y-[12px] py-[8px]">
        {/* Step 1: User */}
        <div className="flex items-center justify-between p-[10px] bg-brand-surface/70 border border-brand-border rounded-md">
          <span className="font-mono text-[10px] text-brand-accent font-semibold">STAGE 01</span>
          <span className="font-display text-[13px] font-bold text-brand-text-primary">USER DEMAND</span>
          <span className="font-mono text-[9px] text-brand-text-muted">Origin</span>
        </div>

        <div className="flex justify-center text-brand-accent/50 text-[10px]">↓</div>

        {/* Step 2: Intent */}
        <div className="flex items-center justify-between p-[10px] bg-brand-surface/70 border border-brand-border rounded-md">
          <span className="font-mono text-[10px] text-brand-accent font-semibold">STAGE 02</span>
          <span className="font-display text-[13px] font-bold text-brand-text-primary">USER INTENT</span>
          <span className="font-mono text-[9px] text-brand-text-muted">Vector</span>
        </div>

        <div className="flex justify-center text-brand-accent/50 text-[10px]">↓</div>

        {/* Step 3: Grounding */}
        <div className="flex items-center justify-between p-[10px] bg-brand-surface/70 border border-brand-border rounded-md">
          <span className="font-mono text-[10px] text-brand-accent font-semibold">STAGE 03</span>
          <span className="font-display text-[13px] font-bold text-brand-text-primary">CONTENT / ENTITY / AUTHORITY</span>
          <span className="font-mono text-[9px] text-brand-text-muted">Knowledge</span>
        </div>

        <div className="flex justify-center text-brand-accent/50 text-[10px]">↓</div>

        {/* Step 4: The 6 AI Search Systems */}
        <div className="p-[12px] bg-brand-surface/90 border border-brand-accent/40 rounded-md space-y-[8px]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-brand-accent font-semibold">STAGE 04 · SEARCH SYSTEMS</span>
            <span className="font-mono text-[9px] text-brand-success font-medium">6 Validated</span>
          </div>
          <div className="grid grid-cols-2 gap-[6px]">
            {[
              "Google AI Overview",
              "ChatGPT",
              "Perplexity",
              "Claude",
              "Gemini",
              "Microsoft Copilot",
            ].map((name) => (
              <div
                key={name}
                className="bg-brand-bg px-[8px] py-[5px] rounded border border-brand-border text-[11px] font-mono text-brand-text-secondary text-center"
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center text-brand-accent/50 text-[10px]">↓</div>

        {/* Step 5: Answers */}
        <div className="flex items-center justify-between p-[10px] bg-brand-accent/15 border border-brand-accent/40 rounded-md">
          <span className="font-mono text-[10px] text-brand-accent font-semibold">STAGE 05</span>
          <span className="font-display text-[13px] font-bold text-brand-text-primary">ANSWERS & CITATIONS</span>
          <span className="font-mono text-[9px] text-brand-text-secondary">Synthesis</span>
        </div>
      </div>

      {/* Graph Footer Status / Active Inspection Bar */}
      <div className="border-t border-brand-border/60 pt-[12px] mt-[12px] flex items-center justify-between text-[11px] font-mono">
        <div className="text-brand-text-muted truncate max-w-[260px] sm:max-w-none">
          {hoveredNode ? (
            <span className="text-brand-text-primary">
              <strong className="text-brand-accent">{hoveredNode.label}</strong>
              {hoveredNode.sublabel && ` — ${hoveredNode.sublabel}`}
            </span>
          ) : (
            <span>HOVER NODE TO TRACE KNOWLEDGE RETRIEVAL PATHS</span>
          )}
        </div>
        <span className="hidden sm:inline text-brand-text-muted">STATUS: VERIFIED PIPELINE</span>
      </div>

      {/* Server-Rendered Semantic Structure for Screen Readers, Search Bots & AI Crawlers */}
      <div className="sr-only">
        <p className="font-semibold">AI Search Universe Information Retrieval Architecture</p>
        <p>A 5-stage semantic pipeline modeling how search is transitioning to generative discovery:</p>
        <ol>
          <li>Stage 1: User (Human Discovery Demand)</li>
          <li>Stage 2: User Intent (Semantic Query Vector)</li>
          <li>Stage 3: Grounding (Content, Entities, Authority, Structured Content Schema)</li>
          <li>Stage 4: Search Systems (Active benchmark evaluation across Google AI Overview, ChatGPT, Perplexity, Claude, Gemini, and Microsoft Copilot)</li>
          <li>Stage 5: Answers (Generative Synthesis and Direct Citation Recommendations)</li>
        </ol>
      </div>
    </div>
  );
};
