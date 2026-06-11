import { jsPDF } from "jspdf";

export interface ActionStep {
  title: string;
  instructions: string;
  example?: string | null;
  warning?: string | null;
}

export interface ActionPhase {
  number: number;
  title: string;
  description: string;
  estimatedTime: string;
  steps: ActionStep[];
}

export interface ActionGuide {
  candidateName: string;
  targetRole: string;
  totalSteps: number;
  estimatedTime: string;
  phases: ActionPhase[];
}

// ── Colors ────────────────────────────────────────────────────────────────────

const C = {
  white:   [255, 255, 255] as [number, number, number],
  black:   [15,  15,  20]  as [number, number, number],
  navy:    [18,  18,  35]  as [number, number, number],
  teal:    [16,  185, 129] as [number, number, number],
  orange:  [249, 115, 22]  as [number, number, number],
  blue:    [14,  165, 233] as [number, number, number],
  purple:  [139, 92,  246] as [number, number, number],
  gray:    [120, 120, 140] as [number, number, number],
  lgray:   [220, 220, 230] as [number, number, number],
  xlight:  [245, 245, 250] as [number, number, number],
  warn:    [255, 237, 213] as [number, number, number],
  warnTxt: [154, 52,  18]  as [number, number, number],
  exBg:    [240, 253, 244] as [number, number, number],
  exTxt:   [21,  128, 61]  as [number, number, number],
};

const PHASE_COLORS: [number, number, number][] = [
  [239, 68,  68],   // Phase 1 — red
  [249, 115, 22],   // Phase 2 — orange
  [16,  185, 129],  // Phase 3 — teal
  [14,  165, 233],  // Phase 4 — blue
  [139, 92,  246],  // Phase 5 — purple
];

const PW = 210;
const PH = 297;
const ML = 14;
const MR = 14;
const CW = PW - ML - MR;

function rgb(doc: jsPDF, type: "fill" | "text" | "draw", color: [number, number, number]) {
  if (type === "fill") doc.setFillColor(...color);
  else if (type === "text") doc.setTextColor(...color);
  else doc.setDrawColor(...color);
}

function addFooter(doc: jsPDF, pageNum: number, total: number, candidateName: string) {
  doc.setFillColor(18, 18, 35);
  doc.rect(0, PH - 10, PW, 10, "F");
  doc.setFontSize(6.5);
  rgb(doc, "text", C.gray);
  doc.text("Shyam Pro Services — LinkedIn Optimisation Step-by-Step Action Guide", ML, PH - 3.5);
  doc.text(`Page ${pageNum} of ${total}`, PW - MR, PH - 3.5, { align: "right" });
  if (candidateName) {
    rgb(doc, "text", C.teal);
    doc.text(`Candidate: ${candidateName}`, PW / 2, PH - 3.5, { align: "center" });
  }
}

function addPageHeader(doc: jsPDF) {
  doc.setFillColor(18, 18, 35);
  doc.rect(0, 0, PW, 8, "F");
  doc.setFontSize(6.5);
  rgb(doc, "text", C.teal);
  doc.text("Shyam Pro Services", ML, 5.5);
  rgb(doc, "text", C.gray);
  doc.text("LinkedIn Optimisation Step-by-Step Action Guide", PW - MR, 5.5, { align: "right" });
}

function checkBreak(doc: jsPDF, y: number, needed: number, pages: { count: number }, candidateName: string, total: number): number {
  if (y + needed > PH - 14) {
    addFooter(doc, pages.count, total, candidateName);
    doc.addPage();
    pages.count += 1;
    addPageHeader(doc);
    return 14;
  }
  return y;
}

function wrapLines(doc: jsPDF, text: string, maxW: number): string[] {
  return doc.splitTextToSize(text, maxW);
}

// ── COVER PAGE ────────────────────────────────────────────────────────────────

function drawCover(doc: jsPDF, guide: ActionGuide, dateStr: string) {
  // Background
  doc.setFillColor(12, 12, 28);
  doc.rect(0, 0, PW, PH, "F");

  // Tri-color top bar
  doc.setFillColor(239, 68, 68);
  doc.rect(0, 0, PW / 3, 4, "F");
  doc.setFillColor(249, 115, 22);
  doc.rect(PW / 3, 0, PW / 3, 4, "F");
  doc.setFillColor(16, 185, 129);
  doc.rect((PW * 2) / 3, 0, PW / 3, 4, "F");

  // Brand name
  doc.setFontSize(22);
  rgb(doc, "text", C.white);
  doc.setFont("helvetica", "bold");
  doc.text("Shyam Pro Services", ML, 28);

  // Right header text
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  rgb(doc, "text", C.gray);
  doc.text("LinkedIn Optimisation Step-by-Step Action Guide", PW - MR, 18, { align: "right" });
  doc.text(dateStr, PW - MR, 24, { align: "right" });

  // Divider below brand
  rgb(doc, "draw", C.teal);
  doc.setLineWidth(0.4);
  doc.line(ML, 33, PW - MR, 33);

  // Candidate info row
  doc.setFontSize(9);
  rgb(doc, "text", C.lgray);
  doc.text("Candidate:", ML, 42);
  rgb(doc, "text", C.white);
  doc.setFont("helvetica", "bold");
  doc.text(guide.candidateName, ML + 22, 42);

  doc.setFont("helvetica", "normal");
  rgb(doc, "text", C.lgray);
  doc.text("Target Role:", ML + 80, 42);
  rgb(doc, "text", C.teal);
  doc.setFont("helvetica", "bold");
  const targetLines = doc.splitTextToSize(guide.targetRole, 60);
  doc.text(targetLines, ML + 105, 42);

  doc.setFont("helvetica", "normal");
  rgb(doc, "text", C.lgray);
  doc.text("Total Steps:", PW - MR - 45, 42);
  rgb(doc, "text", C.orange);
  doc.setFont("helvetica", "bold");
  doc.text(`${guide.totalSteps} | Est. Time: ${guide.estimatedTime}`, PW - MR - 22, 42, { align: "right" });

  // Intro text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  rgb(doc, "text", C.lgray);
  const intro = "This guide is organised into phases. Follow them in order. Each step tells you exactly what to click, what to type, and what the result should look like.";
  const introLines = doc.splitTextToSize(intro, CW);
  doc.text(introLines, ML, 54);

  // Phase table header
  let ty = 66;
  const cols = { phase: ML, title: ML + 24, steps: ML + 115, focus: ML + 135 };

  doc.setFillColor(18, 18, 35);
  doc.rect(ML - 2, ty - 5, CW + 4, 7, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  rgb(doc, "text", C.white);
  doc.text("Phase", cols.phase, ty);
  doc.text("Title", cols.title, ty);
  doc.text("Steps", cols.steps, ty);
  doc.text("Focus", cols.focus, ty);

  ty += 5;

  let stepOffset = 1;
  guide.phases.forEach((phase, i) => {
    const phaseColor = PHASE_COLORS[i] ?? C.teal;
    const stepCount = phase.steps.length;
    const rowH = 9;

    if (i % 2 === 0) {
      doc.setFillColor(22, 22, 40);
      doc.rect(ML - 2, ty - 4, CW + 4, rowH, "F");
    }

    // Phase badge
    doc.setFillColor(...phaseColor);
    doc.roundedRect(cols.phase - 1, ty - 3.5, 18, 5, 1, 1, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    rgb(doc, "text", C.white);
    doc.text(`Phase ${phase.number}`, cols.phase + 0.5, ty);

    // Title
    doc.setFontSize(8);
    rgb(doc, "text", phaseColor);
    doc.text(phase.title, cols.title, ty);

    // Steps range
    doc.setFont("helvetica", "normal");
    rgb(doc, "text", C.gray);
    doc.setFontSize(7.5);
    const stepEnd = stepOffset + stepCount - 1;
    doc.text(`Steps ${stepOffset}–${stepEnd}`, cols.steps, ty);
    stepOffset += stepCount;

    // Focus
    doc.text(phase.description, cols.focus, ty);

    ty += rowH;
  });

  // Bottom promo area
  const boxY = PH - 55;
  doc.setFillColor(16, 185, 129, 0.08);
  doc.roundedRect(ML, boxY, CW, 40, 3, 3, "F");
  rgb(doc, "draw", C.teal);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, boxY, CW, 40, 3, 3, "S");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  rgb(doc, "text", C.teal);
  doc.text("WHAT'S COVERED IN THIS GUIDE", ML + 5, boxY + 8);

  const bullets = [
    "Step-by-step instructions with exact text to copy/type",
    "Concrete examples tailored to your profile and target role",
    "Critical warnings to avoid common mistakes",
    "Final checklist before you apply",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  rgb(doc, "text", C.white);
  bullets.forEach((b, i) => doc.text(`✓  ${b}`, ML + 5, boxY + 17 + i * 6));

  // Footer note
  doc.setFontSize(6.5);
  rgb(doc, "text", C.gray);
  doc.text(`This document is confidential and prepared exclusively for ${guide.candidateName}.`, PW / 2, PH - 8, { align: "center" });
  doc.text("Shyam Pro Services — Helping Indian professionals land better opportunities through strategic career positioning.", PW / 2, PH - 4, { align: "center" });
}

// ── PHASE HEADER ──────────────────────────────────────────────────────────────

function drawPhaseHeader(doc: jsPDF, phase: ActionPhase, phaseColor: [number, number, number], y: number): number {
  const h = 14;
  doc.setFillColor(...C.navy);
  doc.rect(0, y, PW, h, "F");

  // Colored left stripe
  doc.setFillColor(...phaseColor);
  doc.rect(0, y, 5, h, "F");

  // Phase badge
  doc.setFillColor(...phaseColor);
  doc.roundedRect(ML, y + 2.5, 22, 6, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  rgb(doc, "text", C.white);
  doc.text(`■ PHASE ${phase.number}`, ML + 1.5, y + 6.8);

  // Phase title
  doc.setFontSize(11);
  rgb(doc, "text", C.white);
  doc.text(`— ${phase.title}`, ML + 26, y + 7.5);

  // Estimated time (right-aligned)
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  rgb(doc, "text", phaseColor);
  doc.text(`${phase.description} | Est. ${phase.estimatedTime}`, PW - MR, y + 7.5, { align: "right" });

  return y + h + 4;
}

// ── STEP CARD ─────────────────────────────────────────────────────────────────

function drawStep(
  doc: jsPDF,
  step: ActionStep,
  stepNum: number,
  y: number,
  pages: { count: number },
  candidateName: string,
  totalPages: number
): number {
  const pad = 3.5;
  const innerW = CW - pad * 2;

  // Estimate height needed
  const instrLines = wrapLines(doc, step.instructions.replace(/\\n/g, "\n"), innerW - 4);
  const exLines   = step.example  ? wrapLines(doc, step.example,  innerW - 6) : [];
  const warnLines = step.warning  ? wrapLines(doc, step.warning,  innerW - 8) : [];

  const titleH  = 8;
  const instrH  = instrLines.length * 4.8 + 4;
  const exH     = exLines.length  > 0 ? exLines.length  * 4.5 + 10 : 0;
  const warnH   = warnLines.length > 0 ? warnLines.length * 4.5 + 10 : 0;
  const totalH  = titleH + instrH + exH + warnH + 8;

  y = checkBreak(doc, y, totalH, pages, candidateName, totalPages);

  // Card background
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(ML, y, CW, totalH - 2, 2, 2, "F");
  rgb(doc, "draw", C.lgray);
  doc.setLineWidth(0.2);
  doc.roundedRect(ML, y, CW, totalH - 2, 2, 2, "S");

  let cy = y + pad + 1;

  // Step number badge
  doc.setFillColor(...C.navy);
  doc.roundedRect(ML + pad, cy - 2.5, 12, 5.5, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  rgb(doc, "text", C.white);
  doc.text(`Step ${stepNum}`, ML + pad + 1, cy + 1.5);

  // Step title
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  rgb(doc, "text", C.black);
  doc.text(step.title, ML + pad + 16, cy + 1.5);

  cy += titleH;

  // Instructions
  const rawInstr = step.instructions.replace(/\\n/g, "\n");
  const instrLinesSplit = rawInstr.split("\n").filter((l) => l.trim());
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  rgb(doc, "text", C.black);

  for (const line of instrLinesSplit) {
    const isNumbered = /^\d+\./.test(line.trim());
    const wrapped = wrapLines(doc, line.trim(), innerW - (isNumbered ? 2 : 0));
    y = checkBreak(doc, cy, wrapped.length * 4.8 + 2, pages, candidateName, totalPages);
    doc.text(wrapped, ML + pad + 2, cy);
    cy += wrapped.length * 4.8 + 1.5;
  }

  cy += 2;

  // EXAMPLE box
  if (step.example && exLines.length > 0) {
    cy = checkBreak(doc, cy, exH + 2, pages, candidateName, totalPages);

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(ML + pad, cy, innerW, exH - 1, 1.5, 1.5, "F");
    rgb(doc, "draw", [134, 239, 172]);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML + pad, cy, innerW, exH - 1, 1.5, 1.5, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    rgb(doc, "text", C.exTxt);
    doc.text("EXAMPLE", ML + pad + 3, cy + 4.5);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.8);
    rgb(doc, "text", [22, 101, 52]);
    doc.text(exLines, ML + pad + 3, cy + 9.5);
    cy += exH + 1;
  }

  // WARNING box
  if (step.warning && warnLines.length > 0) {
    cy = checkBreak(doc, cy, warnH + 2, pages, candidateName, totalPages);

    doc.setFillColor(255, 237, 213);
    doc.roundedRect(ML + pad, cy, innerW, warnH - 1, 1.5, 1.5, "F");

    // Orange left stripe
    doc.setFillColor(249, 115, 22);
    doc.rect(ML + pad, cy, 2.5, warnH - 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    rgb(doc, "text", C.warnTxt);
    doc.text(warnLines, ML + pad + 5, cy + 5);
    cy += warnH + 1;
  }

  return cy + 4;
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

export async function generateActionGuide(guide: ActionGuide): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // Recalculate totalSteps from actual data
  const actualTotal = guide.phases.reduce((sum, p) => sum + p.steps.length, 0);
  const safeGuide = { ...guide, totalSteps: actualTotal };

  // Estimate total pages (rough)
  const estTotalPages = 2 + safeGuide.phases.reduce((sum, p) => sum + Math.ceil(p.steps.length * 1.5), 0);

  // ── Cover
  drawCover(doc, safeGuide, dateStr);

  const pages = { count: 1 };
  let globalStep = 1;

  for (let pi = 0; pi < safeGuide.phases.length; pi++) {
    const phase = safeGuide.phases[pi];
    const phaseColor = PHASE_COLORS[pi] ?? C.teal;

    doc.addPage();
    pages.count += 1;
    addPageHeader(doc);

    let y = 12;
    y = drawPhaseHeader(doc, phase, phaseColor, y);

    for (const step of phase.steps) {
      y = drawStep(doc, step, globalStep, y, pages, safeGuide.candidateName, estTotalPages);
      globalStep += 1;
    }

    addFooter(doc, pages.count, estTotalPages, safeGuide.candidateName);
  }

  // Fix footers on all pages with correct total
  const trueTotal = pages.count;
  for (let p = 2; p <= trueTotal; p++) {
    doc.setPage(p);
    addFooter(doc, p, trueTotal, safeGuide.candidateName);
  }

  const safeName = safeGuide.candidateName.replace(/[^a-z0-9]/gi, "_");
  doc.save(`Shyam Pro Services_LinkedInStepByStep_${safeName}.pdf`);
}
