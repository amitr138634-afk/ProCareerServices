import { jsPDF } from "jspdf";
import { OPTIMIZATION_STEPS } from "./steps";

interface ReportData {
  profileData: Record<string, string>;
  stepResponses: Record<string, string>;
  todos: { action: string; completed: boolean }[];
}

const TEAL   = [16, 185, 129]  as [number, number, number];
const BLUE   = [14, 165, 233]  as [number, number, number];
const PURPLE = [139, 92, 246]  as [number, number, number];
const DARK   = [7, 7, 26]      as [number, number, number];
const WHITE  = [255, 255, 255] as [number, number, number];
const GRAY   = [160, 160, 185] as [number, number, number];
const LGRAY  = [230, 230, 240] as [number, number, number];

const PW = 210; // A4 width mm
const PH = 297; // A4 height mm
const ML = 18;  // margin left
const MR = 18;  // margin right
const CW = PW - ML - MR; // content width

function addFooter(doc: jsPDF, pageNum: number, total: number) {
  doc.setFillColor(...DARK);
  doc.rect(0, PH - 12, PW, 12, "F");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text("Shyam Pro Services — LinkedIn Profile Optimization Report", ML, PH - 4);
  doc.text(`Page ${pageNum} of ${total}`, PW - MR, PH - 4, { align: "right" });
}

function addPageHeader(doc: jsPDF) {
  doc.setFillColor(...DARK);
  doc.rect(0, 0, PW, 10, "F");
  doc.setFontSize(7);
  doc.setTextColor(...TEAL);
  doc.text("Shyam Pro Services", ML, 6.5);
  doc.setTextColor(...GRAY);
  doc.text((process.env.NEXT_PUBLIC_SITE_URL || "localhost:3000").replace(/https?:\/\//, ""), PW - MR, 6.5, { align: "right" });
}

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineH: number): number {
  const lines = doc.splitTextToSize(text, maxW);
  doc.text(lines, x, y);
  return y + lines.length * lineH;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number, pages: { count: number }): number {
  if (y + needed > PH - 20) {
    doc.addPage();
    pages.count += 1;
    addPageHeader(doc);
    return 18;
  }
  return y;
}

export async function generateProfileReport(data: ReportData): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const name    = data.profileData["linkedin-url"] || "";
  const target  = data.profileData["target-position"] || "Target Role";
  const skills  = data.profileData["competencies"] || "";
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // ── COVER PAGE ──────────────────────────────────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, PW, PH, "F");

  // Gradient bar top
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, PW / 3, 3, "F");
  doc.setFillColor(...BLUE);
  doc.rect(PW / 3, 0, PW / 3, 3, "F");
  doc.setFillColor(...PURPLE);
  doc.rect((PW / 3) * 2, 0, PW / 3, 3, "F");

  // Logo area
  doc.setFontSize(9);
  doc.setTextColor(...TEAL);
  doc.text("SHYAM", ML, 22);
  doc.setTextColor(...BLUE);
  doc.text("PRO", ML + 14, 22);
  doc.setTextColor(...PURPLE);
  doc.text("SERVICES", ML + 22, 22);

  // Badge
  doc.setFillColor(16, 185, 129, 0.15);
  doc.roundedRect(ML, 32, 70, 7, 2, 2, "F");
  doc.setFontSize(7);
  doc.setTextColor(...TEAL);
  doc.text("● LINKEDIN OPTIMIZATION REPORT", ML + 4, 36.5);

  // Title
  doc.setFontSize(26);
  doc.setTextColor(...WHITE);
  doc.text("LinkedIn Profile", ML, 58);
  doc.setFontSize(26);
  doc.setTextColor(...TEAL);
  doc.text("Optimization Report", ML, 70);

  // Divider
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.5);
  doc.line(ML, 76, ML + 80, 76);

  // Meta
  doc.setFontSize(10);
  doc.setTextColor(...GRAY);
  doc.text("Generated on", ML, 86);
  doc.setTextColor(...WHITE);
  doc.text(dateStr, ML, 92);

  if (target) {
    doc.setFontSize(10);
    doc.setTextColor(...GRAY);
    doc.text("Target Role", ML, 102);
    doc.setTextColor(...TEAL);
    doc.text(target, ML, 108);
  }

  if (skills) {
    doc.setFontSize(10);
    doc.setTextColor(...GRAY);
    doc.text("Key Competencies", ML, 120);
    doc.setFontSize(9);
    doc.setTextColor(...WHITE);
    const skillLines = doc.splitTextToSize(skills, CW);
    doc.text(skillLines, ML, 126);
  }

  // Sections summary box
  doc.setFillColor(255, 255, 255, 0.04);
  doc.roundedRect(ML, 155, CW, 50, 3, 3, "F");
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, 155, CW, 50, 3, 3, "S");

  doc.setFontSize(8);
  doc.setTextColor(...TEAL);
  doc.text("WHAT'S INSIDE", ML + 6, 163);

  const sections = [
    "✓  Headline · Profile Photo · Banner",
    "✓  Achievements · Spelling & Grammar · Resume Match",
    "✓  About / Summary · Experience · Skills",
    "✓  Recommendations · Age Strategy",
    "✓  Personalized Action Items for every section",
  ];
  doc.setFontSize(8.5);
  doc.setTextColor(...WHITE);
  sections.forEach((s, i) => doc.text(s, ML + 6, 171 + i * 7));

  // Footer bar
  doc.setFillColor(16, 185, 129, 0.1);
  doc.rect(0, PH - 20, PW, 20, "F");
  doc.setFontSize(8);
  doc.setTextColor(...TEAL);
  doc.text("Shyam Pro Services", PW / 2, PH - 10, { align: "center" });
  doc.setTextColor(...GRAY);
  doc.text("Confidential — prepared exclusively for you", PW / 2, PH - 5, { align: "right" });

  // ── SECTION PAGES ───────────────────────────────────────────────────────
  const pages = { count: 1 };

  // Only sections that have AI responses
  const sectionSteps = OPTIMIZATION_STEPS.filter(
    (s) => data.stepResponses[s.id] || data.profileData[s.id]
  );

  for (let si = 0; si < sectionSteps.length; si++) {
    const step = sectionSteps[si];
    const userInput  = data.profileData[step.id] || "";
    const aiResponse = data.stepResponses[step.id] || "";

    doc.addPage();
    pages.count += 1;
    addPageHeader(doc);

    let y = 18;

    // Section number pill
    doc.setFillColor(...TEAL);
    doc.roundedRect(ML, y, 8, 5, 1.5, 1.5, "F");
    doc.setFontSize(7);
    doc.setTextColor(...DARK);
    doc.text(String(si + 1).padStart(2, "0"), ML + 2.2, y + 3.5);

    // Section label
    doc.setFontSize(14);
    doc.setTextColor(...WHITE);
    doc.text(step.label, ML + 11, y + 4);

    y += 10;

    // Teal underline
    doc.setDrawColor(...TEAL);
    doc.setLineWidth(0.4);
    doc.line(ML, y, ML + CW * 0.4, y);
    y += 6;

    // Your input box
    if (userInput) {
      doc.setFillColor(20, 20, 45);
      doc.roundedRect(ML, y, CW, 6, 1.5, 1.5, "F");
      doc.setFontSize(7);
      doc.setTextColor(...TEAL);
      doc.text("YOUR INPUT", ML + 3, y + 4);
      y += 9;

      doc.setFontSize(9);
      doc.setTextColor(...LGRAY);
      y = wrapText(doc, userInput, ML + 2, y, CW - 4, 5);
      y += 5;
    }

    // AI recommendation
    if (aiResponse) {
      y = checkPageBreak(doc, y, 20, pages);

      doc.setFillColor(16, 185, 129, 0.08);
      doc.roundedRect(ML, y, CW, 7, 1.5, 1.5, "F");
      doc.setFontSize(7);
      doc.setTextColor(...TEAL);
      doc.text("AI RECOMMENDATION", ML + 3, y + 4.5);
      y += 10;

      // Render response line by line, handling TODOs specially
      const lines = aiResponse.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) { y += 3; continue; }

        y = checkPageBreak(doc, y, 8, pages);

        if (trimmed.startsWith("TODO:")) {
          // TODO pill
          doc.setFillColor(...PURPLE);
          doc.roundedRect(ML, y - 3.5, 3, 3, 0.5, 0.5, "F");
          doc.setFontSize(8.5);
          doc.setTextColor(...PURPLE);
          const todoText = trimmed.replace("TODO:", "Action:").trim();
          const wrapped = doc.splitTextToSize(todoText, CW - 6);
          doc.text(wrapped, ML + 5, y);
          y += wrapped.length * 5 + 1;
        } else if (/^\d+\./.test(trimmed) || trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
          // Bullet / numbered list
          doc.setFontSize(8.5);
          doc.setTextColor(...WHITE);
          const wrapped = doc.splitTextToSize(trimmed, CW - 4);
          doc.text(wrapped, ML + 3, y);
          y += wrapped.length * 5 + 1;
        } else if (trimmed.endsWith(":") || /^[A-Z\s]+$/.test(trimmed)) {
          // Sub-header
          doc.setFontSize(9);
          doc.setTextColor(...BLUE);
          doc.text(trimmed, ML, y);
          y += 5.5;
        } else {
          // Regular paragraph
          doc.setFontSize(8.5);
          doc.setTextColor(...LGRAY);
          const wrapped = doc.splitTextToSize(trimmed, CW);
          doc.text(wrapped, ML, y);
          y += wrapped.length * 5 + 1;
        }
      }
    }

    addFooter(doc, pages.count, pages.count); // we'll fix total at end
  }

  // ── ACTION ITEMS PAGE ──────────────────────────────────────────────────
  if (data.todos.length > 0) {
    doc.addPage();
    pages.count += 1;
    addPageHeader(doc);

    let y = 20;

    doc.setFontSize(16);
    doc.setTextColor(...WHITE);
    doc.text("Your Action Items", ML, y);
    y += 3;
    doc.setDrawColor(...TEAL);
    doc.setLineWidth(0.5);
    doc.line(ML, y, ML + 60, y);
    y += 8;

    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text("Work through these to maximise your LinkedIn profile impact.", ML, y);
    y += 10;

    const pending   = data.todos.filter((t) => !t.completed);
    const completed = data.todos.filter((t) =>  t.completed);

    const renderTodos = (items: typeof data.todos, done: boolean) => {
      items.forEach((todo, i) => {
        y = checkPageBreak(doc, y, 12, pages);

        const idx = i + 1;
        // Row background alternating
        if (i % 2 === 0) {
          doc.setFillColor(20, 20, 45);
          doc.roundedRect(ML, y - 4, CW, 9, 1, 1, "F");
        }

        // Checkbox
        if (done) {
          doc.setFillColor(...TEAL);
          doc.roundedRect(ML + 2, y - 3, 4, 4, 0.8, 0.8, "F");
          doc.setFontSize(6);
          doc.setTextColor(...DARK);
          doc.text("✓", ML + 3, y - 0.2);
        } else {
          doc.setDrawColor(...TEAL);
          doc.setLineWidth(0.4);
          doc.roundedRect(ML + 2, y - 3, 4, 4, 0.8, 0.8, "S");
          doc.setFontSize(7);
          doc.setTextColor(...TEAL);
          doc.text(String(idx), ML + 3.2, y - 0.2);
        }

        doc.setFontSize(8.5);
        doc.setTextColor(done ? GRAY[0] : WHITE[0], done ? GRAY[1] : WHITE[1], done ? GRAY[2] : WHITE[2]);
        const wrapped = doc.splitTextToSize(todo.action, CW - 12);
        doc.text(wrapped, ML + 9, y);
        y += Math.max(wrapped.length * 4.5, 7) + 2;
      });
    };

    if (pending.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(...TEAL);
      doc.text(`PENDING  (${pending.length})`, ML, y);
      y += 6;
      renderTodos(pending, false);
    }

    if (completed.length > 0) {
      y += 4;
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      doc.text(`COMPLETED  (${completed.length})`, ML, y);
      y += 6;
      renderTodos(completed, true);
    }

    addFooter(doc, pages.count, pages.count);
  }

  // Fix total page count in all footers (re-draw them with correct total)
  const total = pages.count;
  for (let p = 2; p <= total; p++) {
    doc.setPage(p);
    addFooter(doc, p, total);
  }

  // ── SAVE ────────────────────────────────────────────────────────────────
  const filename = `Shyam Pro Services_LinkedIn_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
