// import { PDFDownloadLink } from '@react-pdf/renderer';
// import ReportDocument from '@/components/pdf/ReportDocument';

// export default function PDFReportDownload({ students, className }) {
//   return (
//     <PDFDownloadLink
//       document={<ReportDocument students={students} className={className} />}
//       fileName={`${className}_reports.pdf`}
//     >
//       {({ loading }) => (loading ? 'Generating PDF…' : 'Download PDF')}
//     </PDFDownloadLink>
//   );
// }


'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import ReportDocument from './pdf/ReportDocument';

export default function PDFReportDownload({ students, subjects, school, className }) {
  const [error, setError] = useState(null);

  if (!students || students.length === 0) {
    return null;
  }

  // Validate school name
  if (!school?.name || school.name.trim() === '') {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
        <AlertCircle className="mx-auto mb-2 text-yellow-600" size={24} />
        <p className="text-sm font-medium text-yellow-800">
          Please enter school name before generating PDF
        </p>
      </div>
    );
  }

  const fileName = `${className || 'class'}_report_cards_${new Date().toISOString().split('T')[0]}.pdf`;

  return (
    <div className="space-y-3">
      <PDFDownloadLink
        document={
          <ReportDocument
            students={students}
            subjects={subjects}
            school={school}
            className={className}
          />
        }
        fileName={fileName}
        className="block w-full"
        onError={(err) => {
          console.error('PDF generation error:', err);
          setError(err.message);
        }}
      >
        {({ loading, error: pdfError }) => {
          if (pdfError || error) {
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
                  ? 'bg-gray-300 text-gray-600 cursor-wait'
                  : 'bg-white hover:bg-blue-50 text-blue-600 hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Generating PDF...
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

      {/* Info message */}
      <div className="text-xs text-gray-600 text-center">
        <p>📄 {students.length} report card{students.length !== 1 ? 's' : ''} will be generated</p>
      </div>
    </div>
  );
}