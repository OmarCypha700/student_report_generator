"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import ReportDocument from "./pdf/ReportDocument";

/**
 * Renders a PDF download button for student report cards.
 *
 * @param {{ students: object[], subjects: object[], school: object, className: string, mode: string }} props
 */
export default function PDFReportDownload({ students, subjects, school, className, mode }) {
  const [renderError, setRenderError] = useState(null);

  if (!students || students.length === 0) return null;

  if (!school?.name?.trim()) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
        <AlertCircle className="mx-auto mb-2 text-yellow-600" size={24} />
        <p className="text-sm font-medium text-yellow-800">
          Please enter the school name before generating a PDF.
        </p>
      </div>
    );
  }

  const fileName = `${(className || "class").replace(/\s+/g, "_").toLowerCase()}_report_cards_${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  const document = (
    <ReportDocument
      students={students}
      subjects={subjects}
      school={school}
      className={className}
      mode={mode}
    />
  );

  return (
    <div className="space-y-3">
      <PDFDownloadLink
        document={document}
        fileName={fileName}
        className="block w-full"
      >
        {({ loading, error: pdfError }) => {
          // Capture render errors via state to keep the render pure
          const hasError = pdfError || renderError;

          if (hasError) {
            return (
              <button
                disabled
                className="w-full bg-red-100 text-red-700 py-4 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2 border-2 border-red-200"
              >
                <AlertCircle size={20} />
                Error generating PDF
              </button>
            );
          }

          return (
            <button
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg ${
                loading
                  ? "bg-gray-300 text-gray-600 cursor-wait"
                  : "bg-white hover:bg-blue-50 text-blue-600 hover:shadow-xl"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Generating PDF…
                </>
              ) : (
                <>
                  <Download size={24} />
                  Download PDF Reports
                </>
              )}
            </button>
          );
        }}
      </PDFDownloadLink>

      <p className="text-xs text-white text-center">
        📄 {students.length} report card{students.length !== 1 ? "s" : ""} will be generated
      </p>
    </div>
  );
}