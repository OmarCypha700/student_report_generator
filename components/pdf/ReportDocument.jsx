import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "@/components/pdf/PdfStyles";

/**
 * Generates one A4 PDF page per student.
 *
 * @param {{
 *   students: object[],
 *   subjects: Array<{ name: string, isCore: boolean|null }>,
 *   school: { name?: string, logo?: string, academic_year?: string },
 *   className?: string
 * }} props
 */
export default function ReportDocument({
  students,
  subjects,
  school,
  className,
  mode,
}) {
  // Guard: react-pdf renders in a worker where thrown errors are swallowed,
  // so return an empty Document rather than null to avoid a white screen.
  if (!students?.length || !subjects?.length) {
    return <Document />;
  }

  const totalStudents = students.length;

  return (
    <Document
      title={`${className || "Class"} Report Cards`}
      author={school?.name || "School"}
      subject="Student Academic Report Cards"
      creator="Student Report Generator"
      producer="Student Report Generator"
    >
      {students.map((student, index) => (
        <Page key={student.roll_number ?? index} size="A4" style={styles.page}>
          {/* ── Header ────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {school?.logo && (
                <Image src={school.logo} style={styles.logo} cache={false} />
              )}
              <View style={styles.headerText}>
                <Text style={styles.schoolName}>
                  {school?.name?.toUpperCase() ?? "SCHOOL NAME"}
                </Text>
                <Text style={styles.reportTitle}>Academic Report Card</Text>
                <Text style={styles.reportSubtitle}>
                  {className || "Academic Year"} | {school?.academic_year ?? ""}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Student Info ───────────────────────────────────────────── */}
          <View style={styles.studentInfoSection}>
            <View style={styles.studentInfoGrid}>
              <InfoCell
                label="STUDENT NAME"
                value={student.student_name || "N/A"}
              />
              <InfoCell
                label="ROLL NUMBER"
                value={
                  student.roll_number !== undefined &&
                  student.roll_number !== null
                    ? String(student.roll_number)
                    : "N/A"
                }
              />
              <InfoCell label="CLASS" value={className || "—"} />
              <InfoCell
                label="CLASS POSITION"
                value={
                  student.class_position != null
                    ? `${student.class_position} of ${totalStudents}`
                    : "N/A"
                }
              />
              {mode === "JHS" || mode === "SHS" ? (
                <InfoCell
                  label="AGGREGATE"
                  value={
                    student.aggregate_score !== undefined &&
                    student.aggregate_score !== null
                      ? String(student.aggregate_score)
                      : "N/A"
                  }
                />
              ) : null}
            </View>
          </View>

          {/* ── Academic Performance Table ─────────────────────────────── */}
          <View style={styles.table}>
            {/* Header row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCellLeft, { flex: 1.5 }]}>SUBJECT</Text>
              <Text style={styles.tableCell}>CLASS</Text>
              <Text style={styles.tableCell}>EXAM</Text>
              <Text style={styles.tableCell}>TOTAL</Text>
              {mode === "JHS" || mode === "SHS" ? (
                <Text style={styles.tableCell}>GRADE</Text>
              ) : null}
              <Text style={[styles.tableCell, { flex: 1.2 }]}>REMARK</Text>
              <Text style={styles.tableCell}>POSITION</Text>
            </View>

            {/* Subject rows */}
            {subjects.map((subject) => {
              const name = subject.name;
              const type =
                subject.isCore === true
                  ? "CORE"
                  : subject.isCore === false
                    ? "ELECTIVE"
                    : "";

              return (
                <View key={name} style={styles.tableRow}>
                  <Text
                    style={[
                      styles.tableCellLeft,
                      styles.subjectName,
                      { flex: 1.5 },
                    ]}
                  >
                    {type
                      ? `${name.toUpperCase()} (${type})`
                      : name.toUpperCase()}
                  </Text>
                  <Text style={styles.tableCell}>
                    {student[`${name}_class`] ?? 0}
                  </Text>
                  <Text style={styles.tableCell}>
                    {student[`${name}_exam`] ?? 0}
                  </Text>
                  <Text style={[styles.tableCell, styles.gradeCell]}>
                    {student[`${name}_total`] ?? 0}
                  </Text>
                  {mode === "JHS" || mode === "SHS" ? (
                    <Text style={[styles.tableCell, styles.gradeCell]}>
                      {student[`${name}_grade`] ?? "N/A"}
                    </Text>
                  ) : null}
                  <Text style={[styles.tableCell, { flex: 1.2 }]}>
                    {student[`${name}_remark`] ?? "—"}
                  </Text>
                  <Text style={[styles.tableCell, styles.gradeCell]}>
                    {student[`${name}_position`] ?? "—"}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* ── Signature Section ──────────────────────────────────────── */}
          <View>
            <View style={styles.commentSection}>
              <View style={styles.commentBox}>
                <Text style={styles.commentLabel}>Class Teacher's Comment</Text>
              </View>
            </View>
            <View style={styles.signatureSection}>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureLabel}>
                  Class Teacher's Signature
                </Text>
              </View>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureLabel}>
                  Headteacher's Signature
                </Text>
              </View>
            </View>
          </View>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={{ marginTop: 4 }}>
              Powered by https://studentreportgenerator.vercel.app
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}

// ─── Small helper to keep the JSX above tidy ──────────────────────────────────
function InfoCell({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}
