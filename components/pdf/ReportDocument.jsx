import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { styles } from "@/components/pdf/PdfStyles";

export default function ReportDocument({
  students,
  subjects,
  school,
  className,
}) {
  const totalStudents = students?.length || 0;
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Validate required data
  if (!students || students.length === 0) {
    console.error("No students data provided to ReportDocument");
    return null;
  }

  if (!subjects || subjects.length === 0) {
    console.error("No subjects data provided to ReportDocument");
    return null;
  }

  return (
    <Document
      title={`${className || "Class"} Report Cards`}
      author={school?.name || "School"}
      subject="Student Academic Report Cards"
      creator="Student Report Generator"
      producer="Student Report Generator"
    >
      {students.map((student, index) => (
        <Page key={student.roll_number || index} size="A4" style={styles.page}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {school?.logo && (
                <Image src={school.logo} style={styles.logo} cache={false} />
              )}
              <View style={styles.headerText}>
                <Text style={styles.schoolName}>
                  {school?.name?.toUpperCase() || "School Name"}
                </Text>
                <View style={styles.headerText}>
                <Text style={styles.reportTitle}>Academic Report Card</Text>
                <Text style={styles.reportSubtitle}>
                  {className || "Academic Year"} {" |  "}
                  {`${school?.academic_year} Academic Year`}
                </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Student Information Section */}
          <View style={styles.studentInfoSection}>
            <View style={styles.studentInfoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>STUDENT NAME</Text>
                <Text style={styles.infoValue}>
                  {student.student_name || "N/A"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>ROLL NUMBER</Text>
                <Text style={styles.infoValue}>
                  {student.roll_number !== undefined &&
                  student.roll_number !== null
                    ? student.roll_number
                    : "N/A"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>CLASS</Text>
                <Text style={styles.infoValue}>{className || "—"}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>CLASS POSITION</Text>
                <Text style={styles.infoValue}>
                  {student.class_position || "N/A"} of {totalStudents}
                </Text>
              </View>

              {/* <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>TOTAL SCORE</Text>
                <Text style={styles.infoValue}>
                  {student.overall_total || 0} / {subjects.length * 100}
                </Text>
              </View> */}

              {/* <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>OVERALL GRADE</Text>
                <Text style={styles.infoValue}>
                  {student.overall_grade !== undefined &&
                  student.overall_grade !== null
                    ? student.overall_grade
                    : "N/A"}
                </Text>
              </View> */}
            </View>
          </View>

          {/* Academic Performance Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCellLeft, { flex: 1.5 }]}>SUBJECT</Text>
              <Text style={styles.tableCell}>CLASS</Text>
              <Text style={styles.tableCell}>EXAM</Text>
              <Text style={styles.tableCell}>TOTAL</Text>
              <Text style={styles.tableCell}>GRADE</Text>
              <Text style={[styles.tableCell, { flex: 1.2 }]}>REMARK</Text>
              <Text style={styles.tableCell}>POSITION</Text>
            </View>

            {/* Subject Rows */}
            {subjects.map((subject) => {
              const classScore = student[`${subject}_class`] || 0;
              const examScore = student[`${subject}_exam`] || 0;
              const total = student[`${subject}_total`] || 0;
              const grade =
                student[`${subject}_grade`] !== undefined
                  ? student[`${subject}_grade`]
                  : "N/A";
              const remark = student[`${subject}_remark`] || "—";
              const position = student[`${subject}_position`] || "—";

              return (
                <View key={subject} style={styles.tableRow}>
                  <Text
                    style={[
                      styles.tableCellLeft,
                      styles.subjectName,
                      { flex: 1.5 },
                    ]}
                  >
                    {subject.toUpperCase()}
                  </Text>
                  <Text style={styles.tableCell}>{classScore}</Text>
                  <Text style={styles.tableCell}>{examScore}</Text>
                  <Text style={[styles.tableCell, styles.gradeCell]}>
                    {total}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.gradeCell,
                      // { color: getGradeColor(grade) }
                    ]}
                  >
                    {grade}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.2 }]}>
                    {remark}
                  </Text>
                  <Text style={[styles.tableCell, styles.gradeCell]}>
                    {position}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Summary Section */}
          {/* <View style={styles.summarySection}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>TOTAL SCORE</Text>
                <Text style={styles.summaryValue}>
                  {student.overall_total || 0}
                </Text>
                <Text style={styles.summarySubtext}>
                  out of {subjects.length * 100}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>OVERALL GRADE</Text>
                <Text style={styles.summaryValue}>
                  {student.overall_grade !== undefined && student.overall_grade !== null 
                    ? student.overall_grade 
                    : 'N/A'}
                </Text>
                <Text style={styles.summarySubtext}>
                  Aggregate Score
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>CLASS POSITION</Text>
                <Text style={styles.summaryValue}>
                  {student.class_position || 'N/A'}
                </Text>
                <Text style={styles.summarySubtext}>
                  of {totalStudents} students
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>AVERAGE</Text>
                <Text style={styles.summaryValue}>
                  {subjects.length > 0 
                    ? ((student.overall_total || 0) / subjects.length).toFixed(1)
                    : '0.0'
                  }
                </Text>
                <Text style={styles.summarySubtext}>
                  per subject
                </Text>
              </View>
            </View>
          </View> */}

          {/* Grading Scale Reference */}
          {/* <View style={styles.gradingScale}>
            <Text style={styles.gradingScaleTitle}>Grading Scale Reference</Text>
            <View style={styles.gradingScaleGrid}>
              <Text style={styles.gradeItem}>1 (80-100): Excellent</Text>
              <Text style={styles.gradeItem}>2 (70-79): Very Good</Text>
              <Text style={styles.gradeItem}>3 (60-69): Good</Text>
              <Text style={styles.gradeItem}>4 (50-59): Credit</Text>
              <Text style={styles.gradeItem}>5 (45-49): Pass</Text>
              <Text style={styles.gradeItem}>6 (0-44): Fail</Text>
            </View>
          </View> */}

          {/* Signature Section */}
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

          {/* Footer */}
          <View style={styles.footer}>
            {/* <Text>
              Report generated on {currentDate} •{" "}
              {school?.name || "School Name"}
            </Text> */}
            <Text style={{ marginTop: 4 }}>
              Powered by Student Report Generator
            </Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}
