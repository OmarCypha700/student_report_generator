import * as XLSX from "xlsx";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

export const MODES = {
  PRIMARY: "PRIMARY",
  JHS: "JHS",
  SHS: "SHS",
};

/**
 * Expected spreadsheet layout (rows are 0-indexed):
 *
 *  Row 0 │ roll_number │ student_name │ English (CORE) │      │ Math (CORE) │      │ …
 *  Row 1 │             │              │  class_score   │ exam_score │ class_score │ exam_score │ …
 *  Row 2+│      1      │  Yoa Mark    │      30        │    50  │     25      │   60  │ …
 *
 *  • Subject names span two columns each (merged cells in Excel).
 *    SheetJS reads only the first cell of a merged region; the second is "".
 *  • Sub-headers must be exactly "class_score" / "exam_score" (case-insensitive).
 *  • For JHS / SHS: subject names must include "(CORE)" or "(ELECTIVE)".
 *  • For PRIMARY: the markers are allowed but ignored.
 */
const REQUIRED_FIRST_ROW = ["roll_number", "student_name"];
const EXPECTED_SUBHEADERS = ["class_score", "exam_score"];

const MAX_CLASS_SCORE = 30;
const MAX_EXAM_SCORE  = 70;

// ─────────────────────────────────────────────
// GRADING HELPERS
// ─────────────────────────────────────────────

/** Primary: 1–6 scale, based on total out of 100. */
function gradePrimary(score) {
  if (score >= 80) return { grade: 1, remark: "Excellent" };
  if (score >= 70) return { grade: 2, remark: "Very Good" };
  if (score >= 60) return { grade: 3, remark: "Good" };
  if (score >= 50) return { grade: 4, remark: "Credit" };
  if (score >= 45) return { grade: 5, remark: "Pass" };
  return { grade: 6, remark: "Fail" };
}

/** JHS / BECE: 1–9 scale. */
function gradeBECE(score) {
  if (score >= 80) return { grade: 1, remark: "Excellent" };
  if (score >= 75) return { grade: 2, remark: "Very Good" };
  if (score >= 70) return { grade: 3, remark: "Good" };
  if (score >= 65) return { grade: 4, remark: "Credit" };
  if (score >= 60) return { grade: 5, remark: "Average" };
  if (score >= 55) return { grade: 6, remark: "Pass" };
  if (score >= 40) return { grade: 7, remark: "Weak Pass" };
  if (score >= 35) return { grade: 8, remark: "Fail" };
  return { grade: 9, remark: "Fail" };
}

/** SHS / WASSCE: A1–F9 scale. */
function gradeWASSCE(score) {
  if (score >= 80) return { grade: "A1", points: 1, remark: "Excellent" };
  if (score >= 75) return { grade: "B2", points: 2, remark: "Very Good" };
  if (score >= 70) return { grade: "B3", points: 3, remark: "Good" };
  if (score >= 65) return { grade: "C4", points: 4, remark: "Credit" };
  if (score >= 60) return { grade: "C5", points: 5, remark: "Credit" };
  if (score >= 55) return { grade: "C6", points: 6, remark: "Pass" };
  if (score >= 50) return { grade: "D7", points: 7, remark: "Weak Pass" };
  if (score >= 45) return { grade: "E8", points: 8, remark: "Fail" };
  return { grade: "F9", points: 9, remark: "Fail" };
}

function addSuffix(n) {
  if (n >= 10 && n <= 20) return `${n}th`;
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'}`;
}


// ─────────────────────────────────────────────
// SUBJECT EXTRACTION
// ─────────────────────────────────────────────

/**
 * Parses the two-row header structure into subject descriptors.
 *
 * Each subject occupies two adjacent columns:
 *   column N   → subject name (e.g. "English (CORE)")   in row 0
 *   column N+1 → empty (merged cell tail)               in row 0
 *   column N   → "class_score"                          in row 1
 *   column N+1 → "exam_score"                           in row 1
 *
 * @param {string[]} headerRow   Row 0 as a string array
 * @param {string[]} subRow      Row 1 as a string array
 * @param {string}   mode        One of MODES.*
 * @returns {{
 *   subjects: Array<{
 *     name: string,         // display name without CORE/ELECTIVE suffix
 *     rawName: string,      // original cell text
 *     isCore: boolean|null, // true=core, false=elective, null=unspecified
 *     classCol: number,     // 0-based column index for class score
 *     examCol: number,      // 0-based column index for exam score
 *   }>,
 *   errors: string[]
 * }}
 */
export function extractSubjects(headerRow, subRow, mode) {
  const errors   = [];
  const subjects = [];

  // Subjects start at col 2 and each occupies exactly 2 columns
  for (let col = 2; col < headerRow.length; col += 2) {
    const rawName = headerRow[col]?.toString().trim();

    // Skip blank cells (can appear at the end of the row)
    if (!rawName) continue;

    // Validate sub-headers
    const sub1 = subRow[col]?.toString().trim().toLowerCase();
    const sub2 = subRow[col + 1]?.toString().trim().toLowerCase();

    if (sub1 !== EXPECTED_SUBHEADERS[0] || sub2 !== EXPECTED_SUBHEADERS[1]) {
      errors.push(
        `Subject "${rawName}" (column ${col + 1}): ` +
        `sub-headers must be "class_score" then "exam_score", ` +
        `but found "${sub1 || "(empty)"}" and "${sub2 || "(empty)"}".`
      );
      continue;
    }

    // Parse CORE / ELECTIVE markers
    const isCoreTagged     = /\(CORE\)/i.test(rawName);
    const isElectiveTagged = /\(ELECTIVE\)/i.test(rawName);

    // PRIMARY mode: markers are allowed in the file but have no effect
    const isCore =
      mode === MODES.PRIMARY
        ? null
        : isCoreTagged
        ? true
        : isElectiveTagged
        ? false
        : null;

    const cleanName = rawName.replace(/\s*\((CORE|ELECTIVE)\)\s*/i, "").trim();

    subjects.push({
      name: cleanName,
      rawName,
      isCore,
      classCol: col,
      examCol:  col + 1,
    });
  }

  if (subjects.length === 0) {
    errors.push(
      "No subject columns detected. " +
      "Row 1 must contain subject names starting at column C, " +
      'and row 2 must have "class_score" / "exam_score" beneath each one.'
    );
  }

  return { subjects, errors };
}

// ─────────────────────────────────────────────
// AGGREGATE CALCULATION
// ─────────────────────────────────────────────

/**
 * @param {Array<{ isCore: boolean|null, points: number }>} results
 * @param {string} mode
 * @returns {number|null}
 */
function calculateAggregate(results, mode) {
  if (mode === MODES.PRIMARY) return null;

  const cores     = results.filter((r) => r.isCore === true);
  // const electives = results.filter((r) => r.isCore !== true);
  const electives = results.filter((r) => r.isCore !== true);


  if (mode === MODES.JHS) {
    if (cores.length < 4) return null;
    const bestElectives = [...electives]
      .sort((a, b) => a.points - b.points)
      .slice(0, 2);
    return (
      cores.reduce((t, s) => t + s.points, 0) +
      bestElectives.reduce((t, s) => t + s.points, 0)
    );
  }

  if (mode === MODES.SHS) {
    if (cores.length < 3) return null;
    const bestElectives = [...electives]
      .sort((a, b) => a.points - b.points)
      .slice(0, 3);
    return (
      cores.reduce((t, s) => t + s.points, 0) +
      bestElectives.reduce((t, s) => t + s.points, 0)
    );
  }

  return null;
}

// ─────────────────────────────────────────────
// VALIDATION HELPERS
// ─────────────────────────────────────────────

/**
 * Checks that row 0 starts with the two required identifier columns.
 * @param {string[]} headerRow
 * @returns {string|null}
 */
function validateFirstRow(headerRow) {
  for (let i = 0; i < REQUIRED_FIRST_ROW.length; i++) {
    if (headerRow[i]?.toLowerCase() !== REQUIRED_FIRST_ROW[i]) {
      return (
        `Row 1 must start with "${REQUIRED_FIRST_ROW[0]}" and "${REQUIRED_FIRST_ROW[1]}". ` +
        `Found: "${headerRow[0] || "(empty)"}", "${headerRow[1] || "(empty)"}".`
      );
    }
  }
  return null;
}

/**
 * Clamps a raw score to [0, max]. Non-numeric values → 0.
 * @param {*} raw
 * @param {number} max
 * @returns {number}
 */
function clampScore(raw, max) {
  const n = Number(raw);
  return isNaN(n) ? 0 : Math.min(max, Math.max(0, Math.round(n)));
}

// ─────────────────────────────────────────────
// SHARED SHEET READER
// ─────────────────────────────────────────────

/**
 * Reads the first sheet of an XLSX file into a 2-D array of rows.
 * Empty cells are filled with "" (defval) so column indices stay stable.
 *
 * @param {File} file
 * @returns {Promise<Array<Array<any>>>}
 */
async function readRows(file) {
  const buffer   = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
}

// ─────────────────────────────────────────────
// METADATA EXTRACTION  (preview — no scoring)
// ─────────────────────────────────────────────

/**
 * Reads only the two header rows and counts data rows.
 * Called immediately when the user selects a file, before they hit Submit.
 *
 * @param {File}   file
 * @param {string} [mode]
 * @returns {Promise<{
 *   totalStudents: number,
 *   subjects: Array,
 *   validationErrors: string[]
 * }>}
 */
export async function extractExcelMetadata(file, mode = MODES.PRIMARY) {
  const rows = await readRows(file);

  if (rows.length < 3) {
    throw new Error(
      "The file must have at least 3 rows: " +
      "a subject-name row, a score-type row, and at least one student row."
    );
  }

  const headerRow = rows[0].map((c) => c?.toString().trim());
  const subRow    = rows[1].map((c) => c?.toString().trim());

  const firstRowError = validateFirstRow(headerRow);
  if (firstRowError) throw new Error(firstRowError);

  const { subjects, errors } = extractSubjects(headerRow, subRow, mode);

  const dataRows = rows
    .slice(2)
    .filter((row) => row.some((cell) => cell !== "" && cell != null));

  return {
    totalStudents:    dataRows.length,
    subjects,
    validationErrors: errors,
  };
}

// ─────────────────────────────────────────────
// MAIN PROCESSOR
// ─────────────────────────────────────────────

/**
 * Fully processes the Excel file and returns structured student data.
 *
 * Each student is a flat object (keyed by subject.name for ReportDocument):
 * {
 *   student_name, roll_number,
 *   <name>_class, <name>_exam, <name>_total,
 *   <name>_grade, <name>_remark, <name>_position,
 *   overall_total, class_position, aggregate_score
 * }
 *
 * @param {File}   file
 * @param {(current: number, total: number) => void} [onProgress]
 * @param {string} [mode]
 * @returns {Promise<{
 *   students: object[],
 *   subjects: Array<{ name, rawName, isCore, classCol, examCol }>,
 *   validationErrors: string[]
 * }>}
 */
export async function processExcelFile(
  file,
  onProgress,
  mode = MODES.PRIMARY
) {
  const rows = await readRows(file);

  if (rows.length < 3) {
    throw new Error(
      "The file must have at least 3 rows: " +
      "a subject-name row, a score-type row, and at least one student row."
    );
  }

  const headerRow = rows[0].map((c) => c?.toString().trim());
  const subRow    = rows[1].map((c) => c?.toString().trim());

  const firstRowError = validateFirstRow(headerRow);
  if (firstRowError) throw new Error(firstRowError);

  const { subjects, errors: subjectErrors } = extractSubjects(headerRow, subRow, mode);

  if (subjects.length === 0) {
    throw new Error(
      "No valid subject columns found. " +
      "Please check that row 1 has subject names starting at column C " +
      'and row 2 has "class_score" / "exam_score" under each one.'
    );
  }

  const validationErrors = [...subjectErrors];
  const dataRows = rows
    .slice(2)
    .filter((row) => row.some((cell) => cell !== "" && cell != null));

  if (dataRows.length === 0) {
    throw new Error("No student rows found below the two header rows.");
  }

  const students = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];

    // Col 0 = roll_number, Col 1 = student_name
    const rollNumber  = row[0];
    const studentName = row[1]?.toString().trim();

    if (!studentName) {
      validationErrors.push(`Data row ${i + 1}: missing student name — skipped.`);
      onProgress?.(i + 1, dataRows.length);
      continue;
    }

    if (rollNumber === "" || rollNumber == null) {
      validationErrors.push(
        `Data row ${i + 1} (${studentName}): missing roll number — skipped.`
      );
      onProgress?.(i + 1, dataRows.length);
      continue;
    }

    const student = {
      student_name: studentName,
      roll_number:  rollNumber,
    };

    let overallTotal = 0;
    const resultsMeta = [];

    for (const subject of subjects) {
      const classScore = clampScore(row[subject.classCol], MAX_CLASS_SCORE);
      const examScore  = clampScore(row[subject.examCol],  MAX_EXAM_SCORE);
      const total      = classScore + examScore;

      student[`${subject.name}_class`]  = classScore;
      student[`${subject.name}_exam`]   = examScore;
      student[`${subject.name}_total`]  = total;

      let grade  = "N/A";
      let remark = "—";
      let points = total;

      if (mode === MODES.PRIMARY) {
        ({ grade, remark } = gradePrimary(total));
      } else if (mode === MODES.JHS) {
        const r = gradeBECE(total);
        grade  = r.grade;
        remark = r.remark;
        points = r.grade; // BECE grade IS the aggregate point
      } else if (mode === MODES.SHS) {
        const r = gradeWASSCE(total);
        grade  = r.grade;
        remark = r.remark;
        points = r.points;
      }

      student[`${subject.name}_grade`]    = grade;
      student[`${subject.name}_remark`]   = remark;
      student[`${subject.name}_position`] = null; // set in ranking pass

      overallTotal += total;
      resultsMeta.push({ subjectName: subject.name, total, points, isCore: subject.isCore });
    }

    student.overall_total   = overallTotal;
    student.aggregate_score = calculateAggregate(resultsMeta, mode);
    student._resultsMeta    = resultsMeta;

    students.push(student);
    onProgress?.(i + 1, dataRows.length);
  }

  if (students.length === 0) {
    throw new Error("No valid student records were found in the file.");
  }

  // ── Class ranking: dense rank, descending by overall_total ─────────────────
  const byTotal = [...students].sort((a, b) => b.overall_total - a.overall_total);
  let classRank = 1;
  for (let i = 0; i < byTotal.length; i++) {
    if (i > 0 && byTotal[i].overall_total < byTotal[i - 1].overall_total) {
      classRank = addSuffix(i + 1);
    }
    byTotal[i].class_position = classRank;
  }

  // ── Per-subject ranking: dense rank, descending by subject total ───────────
  for (const subject of subjects) {
    const key = `${subject.name}_total`;
    const bySub = [...students].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));
    let subRank = 1;
    for (let i = 0; i < bySub.length; i++) {
      if (i > 0 && bySub[i][key] < bySub[i - 1][key]) subRank = i + 1;
      bySub[i][`${subject.name}_position`] = addSuffix(subRank);
    }
  }

  // ── Remove temporary field ─────────────────────────────────────────────────
  students.forEach((s) => delete s._resultsMeta);

  return { students, subjects, validationErrors };
}