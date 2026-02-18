import * as XLSX from "xlsx";

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT SUBJECT LISTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Subject definitions per mode.
 * For JHS and SHS the display name must include "(CORE)" or "(ELECTIVE)" so the
 * processor can distinguish them for aggregate calculation.
 * For PRIMARY the names are plain — no markers required (or expected).
 */
const SUBJECTS_BY_MODE = {
  PRIMARY: [
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "RME",
    "ICT",
    "French",
    "Twi",
    "BDT",
  ],
  JHS: [
    "English (CORE)",
    "Mathematics (CORE)",
    "Science (CORE)",
    "Social Studies (CORE)",
    "RME (ELECTIVE)",
    "ICT (ELECTIVE)",
    "French (ELECTIVE)",
    "Twi (ELECTIVE)",
    "BDT (ELECTIVE)",
  ],
  SHS: [
    "English (CORE)",
    "Mathematics (CORE)",
    "Science (CORE)",
    "Social Studies (CORE)",
    "Biology (ELECTIVE)",
    "Chemistry (ELECTIVE)",
    "Physics (ELECTIVE)",
    "Economics (ELECTIVE)",
    "Geography (ELECTIVE)",
    "French (ELECTIVE)",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates and immediately downloads an Excel template for the given mode.
 *
 * Layout:
 *   Row 1  │ roll_number │ student_name │ <Subject A> (merged) │ <Subject B> (merged) │ …
 *   Row 2  │             │              │ class_score │ exam_score │ class_score │ exam_score │ …
 *   Row 3+ │ sample data …
 *
 * @param {"PRIMARY"|"JHS"|"SHS"} [mode="PRIMARY"]
 * @returns {Promise<true>}
 * @throws {Error}
 */
export async function generateTemplate(mode = "PRIMARY") {
  try {
    const subjects = SUBJECTS_BY_MODE[mode] ?? SUBJECTS_BY_MODE.PRIMARY;

    // ── Build row arrays ──────────────────────────────────────────────────────

    // Row 0: identifier columns + subject names (each name in the ODD column,
    //        the EVEN column is left blank — it will be part of the merge).
    const headerRow = ["roll_number", "student_name"];
    for (const subject of subjects) {
      headerRow.push(subject); // merged cell will cover this col + next
      headerRow.push("");      // blank — swallowed by the merge
    }

    // Row 1: blank for the two id columns + "class_score" / "exam_score" pairs
    const subRow = ["", ""];
    for (let i = 0; i < subjects.length; i++) {
      subRow.push("class_score");
      subRow.push("exam_score");
    }

    // Rows 2–6: five sample students with realistic scores
    const sampleNames = [
      [1, "John Doe"],
      [2, "Jane Smith"],
      [3, "Bob Johnson"],
      [4, "Alice Williams"],
      [5, "Charlie Brown"],
    ];

    const dataRows = sampleNames.map(([roll, name]) => {
      const row = [roll, name];
      for (let i = 0; i < subjects.length; i++) {
        row.push(randomInt(18, 30)); // class score  (0–30)
        row.push(randomInt(45, 70)); // exam score   (0–70)
      }
      return row;
    });

    // ── Assemble sheet ────────────────────────────────────────────────────────

    const allRows  = [headerRow, subRow, ...dataRows];
    const sheet    = XLSX.utils.aoa_to_sheet(allRows);

    // ── Merge subject-name cells (each spans 2 columns in row 0) ─────────────
    const merges = [];
    for (let s = 0; s < subjects.length; s++) {
      const col = 2 + s * 2; // 0-based
      merges.push({
        s: { r: 0, c: col },
        e: { r: 0, c: col + 1 },
      });
    }
    sheet["!merges"] = merges;

    // ── Column widths ─────────────────────────────────────────────────────────
    const colWidths = [
      { wch: 13 }, // roll_number
      { wch: 22 }, // student_name
    ];
    for (let i = 0; i < subjects.length; i++) {
      colWidths.push({ wch: 14 }); // class_score
      colWidths.push({ wch: 12 }); // exam_score
    }
    sheet["!cols"] = colWidths;

    // ── Instructions sheet ────────────────────────────────────────────────────
    const instructionsSheet = buildInstructionsSheet(mode);

    // ── Workbook ──────────────────────────────────────────────────────────────
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Student Scores");
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

    XLSX.writeFile(
      workbook,
      `student_report_template_${mode.toLowerCase()}_${today()}.xlsx`
    );

    return true;
  } catch (error) {
    console.error("Error generating template:", error);
    throw new Error("Failed to generate template. Please try again.");
  }
}

/**
 * Validates that a 2-D array (from sheet_to_json with header:1) conforms
 * to the two-row header format expected by the processor.
 *
 * @param {Array<Array<any>>} rows
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateTemplate(rows) {
  const errors   = [];
  const warnings = [];

  if (!Array.isArray(rows) || rows.length < 3) {
    errors.push(
      "Template must have at least 3 rows: subject-name row, score-type row, and at least one data row."
    );
    return { valid: false, errors, warnings };
  }

  const headerRow = rows[0].map((c) => c?.toString().trim().toLowerCase());
  const subRow    = rows[1].map((c) => c?.toString().trim().toLowerCase());

  // Check identifier columns
  if (headerRow[0] !== "roll_number") {
    errors.push(`Column A, Row 1 must be "roll_number". Found: "${headerRow[0] || "(empty)"}".`);
  }
  if (headerRow[1] !== "student_name") {
    errors.push(`Column B, Row 1 must be "student_name". Found: "${headerRow[1] || "(empty)"}".`);
  }

  // Check subject pairs starting at col 2
  let subjectCount = 0;
  for (let col = 2; col < headerRow.length; col += 2) {
    const name = headerRow[col];
    if (!name) continue; // trailing blank

    const s1 = subRow[col];
    const s2 = subRow[col + 1];

    if (s1 !== "class_score") {
      errors.push(
        `Subject "${headerRow[col]}" (column ${col + 1}): ` +
        `expected "class_score" in row 2, found "${s1 || "(empty)"}".`
      );
    }
    if (s2 !== "exam_score") {
      errors.push(
        `Subject "${headerRow[col]}" (column ${col + 2}): ` +
        `expected "exam_score" in row 2, found "${s2 || "(empty)"}".`
      );
    }
    subjectCount++;
  }

  if (subjectCount === 0) {
    errors.push(
      "No subject columns found. Subject names should appear in row 1 starting at column C."
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** @param {"PRIMARY"|"JHS"|"SHS"} mode */
function buildInstructionsSheet(mode) {
  const modeDescriptions = {
    PRIMARY: "No grading markers required. Grades use a 1–6 scale.",
    JHS:
      'Subject names must include "(CORE)" or "(ELECTIVE)". ' +
      "Aggregate = 4 Core + 2 Best Electives (BECE 1–9 scale).",
    SHS:
      'Subject names must include "(CORE)" or "(ELECTIVE)". ' +
      "Aggregate = 3 Core + 3 Best Electives (WASSCE A1–F9 scale).",
  };

  const lines = [
    ["════════════════════════════════════════════════════════════════════════"],
    ["          STUDENT REPORT CARD GENERATOR — TEMPLATE INSTRUCTIONS"],
    [`                               MODE: ${mode}`],
    ["════════════════════════════════════════════════════════════════════════"],
    [""],
    ["MODE NOTES"],
    [`  ${modeDescriptions[mode] || ""}`],
    [""],
    ["════════════════════════════════════════════════════════════════════════"],
    ["FILE STRUCTURE"],
    ["════════════════════════════════════════════════════════════════════════"],
    [""],
    ["  Row 1 — Subject names"],
    ["    • Column A: roll_number  (do not rename)"],
    ["    • Column B: student_name (do not rename)"],
    ["    • Column C onwards: one subject name per pair of columns"],
    ['      e.g. "English (CORE)" spans columns C and D'],
    [""],
    ["  Row 2 — Score type labels"],
    ['    • Must alternate "class_score" / "exam_score" for every subject'],
    ["    • Leave columns A and B blank"],
    [""],
    ["  Row 3 onwards — Student data"],
    ["    • Column A: roll number (must be unique)"],
    ["    • Column B: student full name"],
    ["    • Remaining columns: class score then exam score for each subject"],
    [""],
    ["════════════════════════════════════════════════════════════════════════"],
    ["SCORE LIMITS"],
    ["════════════════════════════════════════════════════════════════════════"],
    [""],
    ["  class_score : 0 – 30  (values above 30 are capped at 30)"],
    ["  exam_score  : 0 – 70  (values above 70 are capped at 70)"],
    ["  total       : 0 – 100 (calculated automatically)"],
    [""],
    ["════════════════════════════════════════════════════════════════════════"],
    ["ADDING / REMOVING SUBJECTS"],
    ["════════════════════════════════════════════════════════════════════════"],
    [""],
    ["  • Insert two columns for each new subject (class_score + exam_score)."],
    ["  • Type the subject name in the first column of the pair (row 1)."],
    ["  • Type class_score in row 2 col 1 and exam_score in row 2 col 2."],
    mode !== "PRIMARY"
      ? ['  • Append " (CORE)" or " (ELECTIVE)" to the subject name.']
      : ["  • No (CORE)/(ELECTIVE) markers needed for PRIMARY mode."],
    [""],
    ["════════════════════════════════════════════════════════════════════════"],
    ["GRADING SCALES"],
    ["════════════════════════════════════════════════════════════════════════"],
    [""],
    ["  PRIMARY (1–6):"],
    ["    1 (80–100) Excellent  |  2 (70–79) Very Good  |  3 (60–69) Good"],
    ["    4 (50–59) Credit      |  5 (45–49) Pass        |  6 (0–44)  Fail"],
    [""],
    ["  JHS / BECE (1–9):"],
    ["    1 (90–100) Excellent  |  2 (80–89) Very Good  |  3 (70–79) Good"],
    ["    4 (60–69) Credit      |  5 (55–59) Average    |  6 (50–54) Pass"],
    ["    7 (40–49) Weak Pass   |  8 (35–39) Fail        |  9 (0–34)  Fail"],
    [""],
    ["  SHS / WASSCE:"],
    ["    A1 (75–100)  B2 (70–74)  B3 (65–69)  C4 (60–64)  C5 (55–59)"],
    ["    C6 (50–54)   D7 (45–49)  E8 (40–44)  F9 (0–39)"],
    [""],
    ["════════════════════════════════════════════════════════════════════════"],
    ["IMPORTANT"],
    ["════════════════════════════════════════════════════════════════════════"],
    [""],
    ["  ✓ Do NOT rename the roll_number or student_name columns."],
    ["  ✓ Delete the 5 sample rows before entering real student data."],
    ["  ✓ Roll numbers must be unique per student."],
    ["  ✓ Save as .xlsx or .xls — not .csv."],
    ["  ✓ Empty score cells are treated as 0."],
    [""],
    ["════════════════════════════════════════════════════════════════════════"],
  ];

  const sheet   = XLSX.utils.aoa_to_sheet(lines);
  sheet["!cols"] = [{ wch: 72 }];
  return sheet;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function today() {
  return new Date().toISOString().split("T")[0];
}
