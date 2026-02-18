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
import {
  processExcelFile,
  extractExcelMetadata,
  MODES,
} from "@/utils/excelProcessor";
import PDFReportDownload from "@/components/PDFReportDownload";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const INITIAL_SCHOOL = { name: "", academic_year: "", logo: null };

export default function ReportGenerator() {
  const [school, setSchool] = useState(INITIAL_SCHOOL);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewCount, setPreviewCount] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isProcessed, setIsProcessed] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [mode, setMode] = useState(MODES.PRIMARY);

  // ─── File validation ───────────────────────────────────────────────────────
  const validateFile = useCallback((file) => {
    if (!file) return "No file selected.";
    if (!ALLOWED_EXCEL_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload an Excel file (.xlsx or .xls).";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds the ${MAX_FILE_SIZE / 1024 / 1024} MB limit.`;
    }
    return null;
  }, []);

  // ─── Excel upload (metadata preview only) ─────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    // Reset input so the same file can be re-selected after an error
    e.target.value = "";
    if (!file) return;

    const fileError = validateFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    // Reset derived state but keep the file reference so the
    // file-info row stays visible while we read headers.
    setUploadedFile(file);
    setError("");
    setValidationErrors([]);
    setStudents([]);
    setSubjects([]);
    setPreviewCount(0);
    setProgress(0);
    setIsProcessed(false);

    // Derive class name from filename immediately (before async work)
    const baseName = file.name.replace(/\.(xlsx|xls)$/i, "");
    setClassName(baseName.replace(/[_-]+/g, " ").toUpperCase());

    // Use isReading (not loading) so the file-info row shows a small spinner
    // rather than the percentage progress bar, which is meaningless here.
    setIsReading(true);
    try {
      const meta = await extractExcelMetadata(file, mode);
      setSubjects(meta.subjects);
      setPreviewCount(meta.totalStudents);

      if (meta.validationErrors?.length > 0) {
        setValidationErrors(meta.validationErrors);
      }
    } catch (err) {
      // Show the error but KEEP uploadedFile in state — the user doesn't need
      // to re-pick the file; they can read the error and still hit Submit,
      // which runs the full processor with its own validation pass.
      setError(
        err.message || "Unable to read Excel file. Please check the format.",
      );
    } finally {
      setIsReading(false);
    }
  };

  // ─── Full processing on Submit ─────────────────────────────────────────────
  const handleSubmit = async () => {
    setError("");

    if (!uploadedFile) {
      setError("Please upload an Excel file first.");
      return;
    }
    if (!school.name.trim()) {
      setError("Please enter the school name.");
      return;
    }
    if (!school.academic_year.trim()) {
      setError("Please enter the academic year.");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      setValidationErrors([]);

      const result = await processExcelFile(
        uploadedFile,
        (current, total) => setProgress(Math.round((current / total) * 100)),
        mode,
      );

      if (!result.students?.length) {
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
        err.message ||
          "Error processing file. Please check the template format.",
      );
      setStudents([]);
      setSubjects([]);
      setIsProcessed(false);
    } finally {
      setLoading(false);
    }
  };

  // ─── Logo upload ───────────────────────────────────────────────────────────
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setLogoError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLogoError("Please upload a valid image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setLogoError(
        `Image size exceeds the ${MAX_LOGO_SIZE / 1024 / 1024} MB limit.`,
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () =>
      setSchool((prev) => ({ ...prev, logo: reader.result }));
    reader.onerror = () =>
      setLogoError("Error reading image file. Please try again.");
    reader.readAsDataURL(file);
  };

  // ─── Mode change: re-run metadata preview if a file is already loaded ────
  const handleModeChange = async (newMode) => {
    setMode(newMode);
    // If a file is already selected, re-parse subjects with the new mode so
    // (CORE)/(ELECTIVE) markers are correctly interpreted for the new level.
    if (!uploadedFile || isProcessed) return;
    setIsReading(true);
    setError("");
    setSubjects([]);
    setPreviewCount(0);
    try {
      const meta = await extractExcelMetadata(uploadedFile, newMode);
      setSubjects(meta.subjects);
      setPreviewCount(meta.totalStudents);
      if (meta.validationErrors?.length > 0)
        setValidationErrors(meta.validationErrors);
    } catch (err) {
      setError(err.message || "Unable to re-read file after mode change.");
    } finally {
      setIsReading(false);
    }
  };
  const handleSchoolChange = (field, value) => {
    setSchool((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // ─── Reset ─────────────────────────────────────────────────────────────────
  const confirmReset = () => {
    setStudents([]);
    setSubjects([]);
    setClassName("");
    setUploadedFile(null);
    setError("");
    setLogoError("");
    setProgress(0);
    setPreviewCount(0);
    setValidationErrors([]);
    setSchool(INITIAL_SCHOOL);
    setIsProcessed(false);
    setIsReading(false);
    setMode(MODES.PRIMARY);
    setShowResetDialog(false);
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const getProgressColor = () => {
    if (error) return "bg-red-600";
    if (progress === 100) return "bg-green-600";
    return "bg-blue-600";
  };

  const canSubmit =
    !loading &&
    !isReading &&
    !!uploadedFile &&
    !!school.name.trim() &&
    !!school.academic_year.trim();

  // ─── Mode descriptions ─────────────────────────────────────────────────────
  const MODE_DESCRIPTIONS = {
    [MODES.PRIMARY]: "No grading or aggregate calculation applied.",
    [MODES.JHS]:
      "Uses BECE grading (1–9) · Aggregate: 4 Core + 2 Best Electives.",
    [MODES.SHS]:
      "Uses WASSCE grading (A1–F9) · Aggregate: 3 Core + 3 Best Electives.",
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
          report cards.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        {/* ── Left Panel ─────────────────────────────────────────────────── */}
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

            <div className="space-y-4">
              {/* School Name */}
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
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  School Level <span className="text-red-500">*</span>
                </label>

                <select
                  value={mode}
                  onChange={(e) => handleModeChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                >
                  {Object.values(MODES).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-gray-500 mt-2">
                  {MODE_DESCRIPTIONS[mode]}
                </p>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2024/2025"
                  value={school.academic_year}
                  required
                  onChange={(e) =>
                    handleSchoolChange("academic_year", e.target.value)
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  School Logo{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  {school.logo ? (
                    <div className="relative w-20 h-20 md:w-24 md:h-24 border-2 border-gray-300 rounded-xl overflow-hidden shadow-md">
                      <img
                        src={school.logo}
                        alt="School logo preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setSchool((prev) => ({ ...prev, logo: null }))
                        }
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
                        title="Remove logo"
                        aria-label="Remove logo"
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
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {logoError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} /> {logoError}
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info size={12} />
                  Recommended: square image, max 2 MB (JPG, PNG, or WebP)
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
                  Upload your Excel file (.xlsx / .xls)
                </p>
              </div>
            </div>

            {!uploadedFile ? (
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 md:p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
                  <Upload
                    className="mx-auto mb-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                    size={48}
                  />
                  <p className="text-base md:text-lg font-semibold text-gray-700 mb-2">
                    Click to upload Excel file
                  </p>
                  <p className="text-sm text-gray-500 mb-2">or drag and drop</p>
                  <p className="text-xs text-gray-400">
                    Supports .xlsx and .xls (max 10 MB)
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
            ) : (
              <div className="space-y-4">
                {/* File info row */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="text-blue-600" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {truncate(uploadedFile.name, 15)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(1)} KB ·{" "}
                        {previewCount > 0 &&
                          `${previewCount} student${previewCount !== 1 ? "s" : ""} detected`}
                      </p>
                    </div>
                  </div>
                  {!loading && !isReading && !isProcessed && (
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        setPreviewCount(0);
                        setStudents([]);
                        setSubjects([]);
                        setError("");
                        setValidationErrors([]);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors ml-2"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Phase 1: reading headers (fast, no percentage) */}
                {isReading && (
                  <div className="flex items-center gap-3 text-blue-600">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="font-medium text-sm">Reading file…</span>
                  </div>
                )}

                {/* Phase 2: full processing with percentage progress */}
                {loading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-blue-600">
                      <Loader2 className="animate-spin" size={20} />
                      <span className="font-medium">
                        Processing… {progress}%
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

                {/* Preview info: subject count after successful metadata read */}
                {!isReading &&
                  !loading &&
                  !error &&
                  subjects.length > 0 &&
                  !isProcessed && (
                    <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                      <CheckCircle size={15} className="flex-shrink-0" />
                      <span>
                        Detected <strong>{previewCount}</strong> student
                        {previewCount !== 1 ? "s" : ""} and{" "}
                        <strong>{subjects.length}</strong> subject
                        {subjects.length !== 1 ? "s" : ""}. Fill in school
                        details and click <em>Generate Reports</em>.
                      </span>
                    </div>
                  )}

                {/* Error banner */}
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <AlertCircle
                      className="text-red-600 flex-shrink-0 mt-0.5"
                      size={20}
                    />
                    <div>
                      <p className="font-semibold text-red-900 mb-1">
                        Error Processing File
                      </p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Validation warnings */}
                {validationErrors.length > 0 && !error && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FileWarning
                        className="text-yellow-600 flex-shrink-0 mt-0.5"
                        size={20}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-900">
                          Validation Warnings
                        </p>
                        <p className="text-sm text-yellow-700 mb-2">
                          Some issues were found but processing continued:
                        </p>
                        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                          {validationErrors.slice(0, 5).map((e, idx) => (
                            <li key={idx}>{e}</li>
                          ))}
                          {validationErrors.length > 5 && (
                            <li className="font-semibold">
                              …and {validationErrors.length - 5} more
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success banner */}
                {isProcessed && students.length > 0 && !loading && (
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
                        {students.length !== 1 ? "s" : ""} · {subjects.length}{" "}
                        subject{subjects.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit button */}
            <button
              className={`mt-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl text-lg font-bold text-white py-3 px-6 transition-all ${
                canSubmit
                  ? "hover:opacity-90 shadow-lg"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Processing…
                </span>
              ) : isReading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Reading file…
                </span>
              ) : (
                "Generate Reports"
              )}
            </button>
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white sticky top-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Info size={20} />
              Summary
            </h3>

            <div className="space-y-4">
              <SummaryItem
                label="School"
                value={school.name?.toUpperCase() || "—"}
              />
              <SummaryItem label="Mode" value={mode || "—"} />
              <SummaryItem label="Class" value={className || "—"} />
              <SummaryItem
                label="Students"
                value={
                  isProcessed
                    ? students.length
                    : previewCount > 0
                      ? `${previewCount}`
                      : "0"
                }
              />
              <SummaryItem label="Subjects" value={subjects.length || "0"} />
            </div>

            {isProcessed && students.length > 0 && (
              <>
                <div className="border-t border-white/20 my-6" />
                <div>
                  <p className="text-sm text-blue-100 mb-1">Top Performer</p>
                  <p
                    className="font-bold text-lg truncate"
                    title={students[0]?.student_name}
                  >
                    {students[0]?.student_name ?? "—"}
                  </p>
                </div>

                <div className="border-t border-white/20 my-6" />
                <div className="space-y-3">
                  <PDFReportDownload
                    students={students}
                    subjects={subjects}
                    school={school}
                    className={className}
                    mode={mode}
                  />
                  <button
                    onClick={() => setShowResetDialog(true)}
                    className="w-full bg-white/20 hover:bg-white/30 backdrop-blur text-white py-3 rounded-xl font-medium transition-all border border-white/30"
                  >
                    Start Over
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick Tips */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
              <Info size={20} className="text-blue-600" />
              Quick Tips
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <TipItem
                number="1"
                text="Fill in your school name and academic year"
              />
              <TipItem
                number="2"
                text="Upload your Excel file with student scores"
              />
              <TipItem
                number="3"
                text="Click Generate Reports, then download PDF"
              />
            </ul>
          </div>
        </div>
      </div>

      {/* Reset Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Confirm Reset
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to start over? All current data will be
              lost.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetDialog(false)}
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
  );
}

// ─────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────

function SummaryItem({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-blue-100 text-sm">{label}:</span>
      <span
        className="font-semibold text-base truncate ml-2"
        title={String(value)}
      >
        {truncate(String(value), 15)}
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

function truncate(str, maxLength) {
  return str.length > maxLength
    ? str.slice(0, maxLength) + "..."
    : str;
}
