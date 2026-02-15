"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  School,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  FileWarning,
} from "lucide-react";
import { processExcelFile, extractExcelMetadata } from "@/utils/excelProcessor";
import PDFReportDownload from "@/components/PDFReportDownload";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export default function ReportGenerator() {
  const [school, setSchool] = useState({
    name: "",
    academic_year: "",
    logo: null,
  });
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isProcessed, setIsProcessed] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);


  const validateFile = useCallback((file) => {
    const errors = [];

    if (!file) {
      errors.push("No file selected");
      return errors;
    }

    if (!ALLOWED_EXCEL_TYPES.includes(file.type)) {
      errors.push(
        "Invalid file type. Please upload an Excel file (.xlsx or .xls)",
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    return errors;
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileErrors = validateFile(file);
    if (fileErrors.length > 0) {
      setError(fileErrors.join(". "));
      return;
    }

    setUploadedFile(file);
    setError("");
    setValidationErrors([]);
    setStudents([]);
    setSubjects([]);
    setProgress(0);
    setIsProcessed(false);

    try {
      setLoading(true);

      // Extract class name from filename
      const filename = file.name.replace(/\.(xlsx|xls|csv)$/i, "");
      const formattedClass = filename.toUpperCase().replace(/[_-]/g, " ");
      setClassName(formattedClass);

      // Extract metadata only
      const meta = await extractExcelMetadata(file);

      setSubjects(meta.subjects);
      setStudents(new Array(meta.totalStudents).fill({}));
      // Placeholder array to show count only
    } catch (err) {
      setError(
        err.message || "Unable to read Excel file. Please check format.",
      );
      setUploadedFile(null);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async () => {
  setError("");

  if (!uploadedFile) {
    setError("Please upload an Excel file first.");
    return;
  }

  if (!school.name || !school.academic_year) {
    setError("Please complete school information.");
    return;
  }

  try {
    setLoading(true);
    setProgress(0);
    setValidationErrors([]);

    const result = await processExcelFile(uploadedFile, (current, total) => {
      setProgress(Math.round((current / total) * 100));
    });

    if (!result.students || result.students.length === 0) {
      throw new Error("No valid student data found in the file.");
    }

    if (result.validationErrors?.length > 0) {
      setValidationErrors(result.validationErrors);
    }

    setStudents(result.students);
    setSubjects(result.subjects);
    setProgress(100);
    setIsProcessed(true);

  } catch (err) {
    setError(
      err.message || "Error processing file. Please check template format."
    );
    setStudents([]);
    setSubjects([]);
    setIsProcessed(false);
  } finally {
    setLoading(false);
  }
};

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert("Please upload a valid image file (JPG, PNG)");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      alert(`Image size exceeds ${MAX_LOGO_SIZE / 1024 / 1024}MB limit`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSchool((prev) => ({ ...prev, logo: reader.result }));
    };
    reader.onerror = () => {
      alert("Error reading image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

const handleSchoolChange = (field, value) => {
  setSchool((prev) => ({ ...prev, [field]: value }));
  setError("");
};

  const handleResetClick = () => {
    setShowResetDialog(true);
  };

  const confirmReset = () => {
    setStudents([]);
    setSubjects([]);
    setClassName("");
    setUploadedFile(null);
    setError("");
    setProgress(0);
    setValidationErrors([]);
    setSchool({ name: "", academic_year: "", logo: null });
    setIsProcessed(false);

    setShowResetDialog(false);
  };

  const cancelReset = () => {
    setShowResetDialog(false);
  };

  const getProgressColor = () => {
    if (error) return "bg-red-600";
    if (progress === 100) return "bg-green-600";
    return "bg-blue-600";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
          Generate Student Reports
        </h1>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
          Upload your Excel file and add school details to create professional
          report cards
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Panel - Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* School Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <School className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  School Information
                </h2>
                <p className="text-xs md:text-sm text-gray-500">
                  Customize your report cards
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  School Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your school name"
                  value={school.name}
                  onChange={(e) => handleSchoolChange("name", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  required
                />

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter academic year (e.g., 2023/2024)"
                  value={school.academic_year || ""}
                  onChange={(e) =>
                    setSchool((prev) => ({
                      ...prev,
                      academic_year: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  School Logo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  {school.logo ? (
                    <div className="relative w-20 h-20 md:w-24 md:h-24 border-2 border-gray-300 rounded-xl overflow-hidden shadow-md">
                      <img
                        src={school.logo}
                        alt="School logo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setSchool((prev) => ({ ...prev, logo: null }))
                        }
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                        title="Remove logo"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
                      <ImageIcon className="text-gray-400" size={32} />
                    </div>
                  )}

                  <label className="cursor-pointer">
                    <span className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all inline-flex items-center gap-2 border border-gray-300">
                      <Upload size={18} />
                      {school.logo ? "Change Logo" : "Upload Logo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info size={12} />
                  Recommended: Square image, max 2MB (JPG, PNG, or WebP)
                </p>
              </div>
            </div>
          </div>

          {/* File Upload Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Student Data
                </h2>
                <p className="text-xs md:text-sm text-gray-500">
                  Upload your Excel file
                </p>
              </div>
            </div>

            {!uploadedFile ? (
              <div>
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 md:p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
                    <Upload
                      className="mx-auto mb-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                      size={48}
                    />
                    <p className="text-base md:text-lg font-semibold text-gray-700 mb-2">
                      Click to upload Excel file
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">
                      Supports .xlsx and .xls files (max 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="text-blue-600" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  {!loading && students.length === 0 && !error && (
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        setError("");
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors ml-2"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {loading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-blue-600">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="font-medium">
                        Processing file... {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${getProgressColor()} h-3 rounded-full transition-all duration-300 ease-out`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <AlertCircle
                      className="text-red-600 flex-shrink-0 mt-0.5"
                      size={20}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-red-900 mb-1">
                        Error Processing File
                      </p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {validationErrors.length > 0 && !error && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <FileWarning
                        className="text-yellow-600 flex-shrink-0 mt-0.5"
                        size={20}
                      />
                      <div>
                        <p className="font-semibold text-yellow-900">
                          Validation Warnings
                        </p>
                        <p className="text-sm text-yellow-700 mb-2">
                          Some issues were found but processing continued:
                        </p>
                        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                          {validationErrors.slice(0, 5).map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                          {validationErrors.length > 5 && (
                            <li className="font-semibold">
                              ... and {validationErrors.length - 5} more
                              warnings
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {students.length > 0 && !loading && (
                  <div className="flex items-start gap-3 bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <CheckCircle
                      className="text-green-600 flex-shrink-0 mt-0.5"
                      size={20}
                    />
                    <div>
                      <p className="font-semibold text-green-900">
                        File Processed Successfully!
                      </p>
                      <p className="text-sm text-green-700">
                        {students.length} student
                        {students.length !== 1 ? "s" : ""} • {subjects.length}{" "}
                        subject{subjects.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div>
              <button
                className="bg-gradient-to-br from-blue-600 to-purple-600 border border-gray-300 rounded-lg text-xl font-bold text-white py-2 px-4 mt-4 transition-colors"
                onClick={handleSubmit}
                disabled={loading || !uploadedFile}
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Summary & Actions */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white sticky top-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Info size={20} />
              Summary
            </h3>

            <div className="space-y-4">
              <SummaryItem label="School Name" value={school.name?.toUpperCase() || "—"} />
              <SummaryItem label="Class Name" value={className || "—"} />
              <SummaryItem
                label="Total Students"
                value={students.length || "0"}
              />
              <SummaryItem
                label="Subjects"
                value={uploadedFile ? subjects.length : "0"}
              />
            </div>

            {isProcessed && students.length > 0 && (
              <>
                <div className="border-t border-white/20 my-6" />
                <div>
                  <p className="text-sm text-blue-100 mb-2">Top Performer</p>
                  <p
                    className="font-bold text-lg mb-1 truncate"
                    title={students[0]?.student_name}
                  >
                    {students[0]?.student_name}
                  </p>
                  {/* <p className="text-sm text-blue-100">
                    {students[0]?.overall_total} / {subjects.length * 100}{" "}
                    points
                  </p> */}
                </div>
              </>
            )}

            {isProcessed && students.length > 0 && (
              <>
                <div className="border-t border-white/20 my-6" />
                <div className="space-y-3">
                  <PDFReportDownload
                    students={students}
                    subjects={subjects}
                    school={school}
                    className={className}
                  />

                  <button
                    onClick={handleResetClick}
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur text-white py-3 rounded-xl font-medium transition-all border border-white/30"
                  >
                    Start Over
                  </button>
                </div>
              </>
            )}

            {showResetDialog && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Confirm Reset
                  </h3>

                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to start over? All current data will
                    be lost.
                  </p>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={cancelReset}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={confirmReset}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                    >
                      Yes, Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Tips Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
              <Info size={20} className="text-blue-600" />
              Quick Tips
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <TipItem number="1" text="Fill in your school name and logo" />
              <TipItem
                number="2"
                text="Upload Excel file with student scores"
              />
              <TipItem number="3" text="Review the summary and download PDF" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function SummaryItem({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-blue-100 text-sm">{label}:</span>
      <span className="font-semibold text-base truncate ml-2" title={value}>
        {value}
      </span>
    </div>
  );
}

function TipItem({ number, text }) {
  return (
    <li className="flex gap-3">
      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
        {number}
      </span>
      <span>{text}</span>
    </li>
  );
}
