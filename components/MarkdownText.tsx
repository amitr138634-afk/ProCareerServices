"use client";

import React from "react";

function inlineParse(text: string): React.ReactNode {
  // Handle **bold** inline
  const parts = text.split(/(\*\*[^*\n]+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function MarkdownText({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Empty line → spacing
    if (!trimmed) {
      nodes.push(<div key={i} className="h-1.5" />);
      continue;
    }

    // Horizontal rule
    if (trimmed === "---") {
      nodes.push(<hr key={i} className="border-white/8 my-2" />);
      continue;
    }

    // TODO: action items
    if (trimmed.startsWith("TODO:")) {
      const body = trimmed.slice(5).trim();
      nodes.push(
        <div
          key={i}
          className="flex items-start gap-2 my-1.5 px-3 py-2 rounded-lg bg-brand-teal/8 border border-brand-teal/15"
        >
          <span className="mt-0.5 flex-shrink-0 text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
            TODO
          </span>
          <span className="text-xs text-white/85 leading-relaxed">
            {inlineParse(body)}
          </span>
        </div>
      );
      continue;
    }

    // Standalone heading: entire line is **text** or **text:**
    if (/^\*\*[^*\n]+?\*\*:?\s*$/.test(trimmed)) {
      const heading = trimmed.replace(/^\*\*/, "").replace(/\*\*:?\s*$/, "");
      nodes.push(
        <p
          key={i}
          className="font-black text-white text-xs mt-3 mb-1 uppercase tracking-wide"
        >
          {heading}
        </p>
      );
      continue;
    }

    // Option headings: "Option A —", "Option B —", "Option C —"
    if (/^Option [A-Z] —/.test(trimmed)) {
      nodes.push(
        <p key={i} className="font-bold text-brand-teal text-xs mt-2 mb-0.5">
          {inlineParse(trimmed)}
        </p>
      );
      continue;
    }

    // Tier headings: "Tier 1 —", "Tier 2 —"
    if (/^Tier \d+ —/.test(trimmed)) {
      nodes.push(
        <p
          key={i}
          className="font-bold text-yellow-400/80 text-[11px] mt-2 mb-0.5 uppercase tracking-wide"
        >
          {trimmed}
        </p>
      );
      continue;
    }

    // ✓ check mark lines
    if (trimmed.startsWith("✓") || trimmed.startsWith("✓ ")) {
      const body = trimmed.replace(/^✓\s*/, "");
      nodes.push(
        <div key={i} className="flex items-start gap-2 py-0.5">
          <span className="mt-0.5 flex-shrink-0 text-brand-teal text-xs">✓</span>
          <span className="text-xs text-white/75 leading-relaxed flex-1">
            {inlineParse(body)}
          </span>
        </div>
      );
      continue;
    }

    // ✗ cross lines
    if (trimmed.startsWith("✗") || trimmed.startsWith("✗ ")) {
      const body = trimmed.replace(/^✗\s*/, "");
      nodes.push(
        <div key={i} className="flex items-start gap-2 py-0.5">
          <span className="mt-0.5 flex-shrink-0 text-red-400 text-xs">✗</span>
          <span className="text-xs text-white/75 leading-relaxed flex-1">
            {inlineParse(body)}
          </span>
        </div>
      );
      continue;
    }

    // + add lines
    if (trimmed.startsWith("+ ")) {
      const body = trimmed.slice(2);
      nodes.push(
        <div key={i} className="flex items-start gap-2 py-0.5">
          <span className="mt-0.5 flex-shrink-0 text-yellow-400 text-xs font-bold">+</span>
          <span className="text-xs text-white/75 leading-relaxed flex-1">
            {inlineParse(body)}
          </span>
        </div>
      );
      continue;
    }

    // Bullet lines: •, →, -, * (but not **heading**)
    if (
      (trimmed.startsWith("•") ||
        trimmed.startsWith("→") ||
        trimmed.startsWith("- ") ||
        trimmed.startsWith("* ")) &&
      !trimmed.startsWith("**")
    ) {
      const body = trimmed.replace(/^[•→\-\*]\s*/, "");
      nodes.push(
        <div key={i} className="flex items-start gap-2 py-0.5">
          <span className="mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-white/40" />
          <span className="text-xs text-white/75 leading-relaxed flex-1">
            {inlineParse(body)}
          </span>
        </div>
      );
      continue;
    }

    // Numbered list: "1.", "2.", etc.
    if (/^\d+\.\s/.test(trimmed)) {
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (numMatch) {
        nodes.push(
          <div key={i} className="flex items-start gap-2 py-0.5">
            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-white/8 text-white/50 text-[10px] font-bold flex items-center justify-center mt-0.5">
              {numMatch[1]}
            </span>
            <span className="text-xs text-white/75 leading-relaxed flex-1">
              {inlineParse(numMatch[2])}
            </span>
          </div>
        );
        continue;
      }
    }

    // Regular line
    nodes.push(
      <p key={i} className="text-xs text-white/75 leading-relaxed">
        {inlineParse(raw)}
      </p>
    );
  }

  return <div className={`space-y-0.5 ${className}`}>{nodes}</div>;
}
