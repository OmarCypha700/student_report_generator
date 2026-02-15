import * as XLSX from 'xlsx';

export function getSubjectGrade(total) {
  if (total >= 80) return { grade: 1, remark: 'Excellent' };
  if (total >= 70) return { grade: 2, remark: 'Very Good' };
  if (total >= 60) return { grade: 3, remark: 'Good' };
  if (total >= 50) return { grade: 4, remark: 'Credit' };
  if (total >= 45) return { grade: 5, remark: 'Pass' };
  return { grade: 6, remark: 'Fail' };
}

function addSuffix(n) {
  if (n >= 10 && n <= 20) return `${n}th`;
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th'}`;
}

/* 🔹 Extract subjects dynamically */
function extractSubjects(row) {
  return Object.keys(row)
    .filter((key) => key.endsWith('_class'))
    .map((key) => key.replace('_class', ''));
}

export async function extractExcelMetadata(file) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, { dense: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { raw: true });

  if (!rows || rows.length === 0) {
    throw new Error("Excel file contains no data.");
  }

  // Detect subjects dynamically
  const firstRow = rows[0];
  const subjects = Object.keys(firstRow)
    .filter((key) => key.endsWith("_class"))
    .map((key) => key.replace("_class", ""));

  return {
    totalStudents: rows.length,
    subjects,
  };
}


export async function processExcelFile(file, onProgress) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, { dense: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { raw: true });

  if (!rows.length) return { students: [], subjects: [] };

  const subjects = extractSubjects(rows[0]);

  const students = rows.map((row, index) => {
    if (index % 50 === 0 && onProgress) {
      onProgress(index, rows.length);
    }

    const processed = { ...row };
    let overallTotal = 0;

    subjects.forEach((subject) => {
      const classScore = processed[`${subject}_class`] || 0;
      const examScore = processed[`${subject}_exam`] || 0;
      const total = classScore + examScore;
      const { grade, remark } = getSubjectGrade(total);

      processed[`${subject}_total`] = total;
      processed[`${subject}_grade`] = grade;
      processed[`${subject}_remark`] = remark;

      overallTotal += total;
    });

    processed.overall_total = overallTotal;
    return processed;
  });

  /* Class positions */
  [...students]
    .sort((a, b) => b.overall_total - a.overall_total)
    .forEach((s, i, arr) => {
      s.class_position = addSuffix(
        i > 0 && s.overall_total === arr[i - 1].overall_total ? arr[i - 1]._pos : i + 1
      );
      s._pos = i + 1;
    });

  /* Subject positions */
  subjects.forEach((subject) => {
    [...students]
      .sort((a, b) => b[`${subject}_total`] - a[`${subject}_total`])
      .forEach((s, i) => {
        s[`${subject}_position`] = addSuffix(i + 1);
      });
  });

  return { students, subjects };
}
