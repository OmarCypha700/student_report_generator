import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  // Page Layout
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },

  // Header Styles
  header: {
    marginBottom: 25,
    borderBottom: "3px solid #2563eb",
    paddingBottom: 15,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },

  logo: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },

  headerText: {
    textAlign: "center",
  },

  schoolName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },

  reportTitle: {
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "bold",
  },

  reportSubtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },

  // Student Information Section
  studentInfoSection: {
    marginBottom: 20,
    backgroundColor: "#f3f4f6",
    padding: 5,
    borderRadius: 4,
  },

  studentInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },

  infoItem: {
    width: "48%",
    marginBottom: 8,
  },

  infoLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  infoValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },

  // Table Styles
  table: {
    marginTop: 15,
    marginBottom: 20,
  },

  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  tableHeader: {
    backgroundColor: "#2563eb",
    color: "white",
    fontWeight: "bold",
    paddingVertical: 10,
    borderBottom: "none",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
    fontSize: 9,
    textAlign: "center",
  },

  tableCellLeft: {
    flex: 1,
    paddingHorizontal: 4,
    fontSize: 9,
    textAlign: "left",
  },

  subjectName: {
    fontWeight: "bold",
    color: "#374151",
    textTransform: "capitalize",
  },

  gradeCell: {
    fontWeight: "bold",
  },

  // Grading Scale
  gradingScale: {
    marginTop: 25,
    padding: 12,
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    border: "1px solid #fbbf24",
  },

  gradingScaleTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 6,
  },

  gradingScaleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  gradeItem: {
    fontSize: 8,
    color: "#78350f",
    width: "48%",
  },


  // Signature & Comment Section
  commentSection: {
    marginTop: 15,
    padding: 10,
  },

  commentBox: {
    width: "100%",
    borderTop: "1px solid #9ca3af",
    paddingTop: 5,
  },

  commentLabel: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "left",
  },

  signatureSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },  

  signatureBox: {
    width: "45%",
    borderTop: "1px solid #9ca3af",
    paddingTop: 5,
  },

  signatureLabel: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "left",
  },

    // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    paddingTop: 10,
    borderTop: "1px solid #e5e7eb",
  },

  // Divider
  divider: {
    borderBottom: "1px solid #e5e7eb",
    marginVertical: 10,
  },
});