# Student Report Generator

A modern web application that automatically generates professional student report cards from Excel spreadsheets. Transform student data into beautifully formatted PDF reports in seconds.

## Features

- Excel → PDF conversion: upload `.xlsx` / `.xls` files and generate per-student PDF report cards.
- Two-row header template with dynamic subject detection and sample template generator.
- Mode-aware grading: `PRIMARY`, `JHS`, and `SHS` with mode-specific grade scales and aggregate rules.
- Custom school branding: add school name, academic year, and logo (JPEG/PNG).
- Client-side processing with progress indicators and validation warnings.

## How It Works

1. Landing Page
   - Download a template or open the report generator.

2. Upload Excel File (required layout)
   The app expects a two-row header format (use "Download Template"):

   - Row 1 (header): `roll_number`, `student_name`, then one subject name per *pair* of columns starting at column C. Subject name cells are usually merged across the pair (e.g. `English (CORE)` spanning columns C and D).
   - Row 2 (sub-headers): leave the first two cells blank, then alternate `class_score`, `exam_score` for each subject.

   Example (rows):
   - Row 1: roll_number | student_name | English (CORE) | "" | Mathematics (CORE) | "" | …
   - Row 2: "" | "" | class_score | exam_score | class_score | exam_score | …
   - Row 3+: 1 | John Doe | 25 | 55 | 22 | 60 | …

   Important notes:
   - Columns A and B must be `roll_number` and `student_name` (case-insensitive).
   - For `JHS` / `SHS` modes, append `(CORE)` or `(ELECTIVE)` to subject names to enable aggregate calculations.
   - Score limits: `class_score` capped to 30, `exam_score` capped to 70; total is `class + exam` (0–100).

3. Configure School Information
   - Enter `School Name` and `Academic Year` (required).
   - Optionally upload a school logo (JPEG, PNG, or WebP; max 2 MB).
   - Select the school `Mode`: `PRIMARY`, `JHS`, or `SHS`.

4. Generate Reports
   - The app parses the spreadsheet, validates headers, computes totals and grades, calculates positions/rankings, and generates PDFs using `@react-pdf/renderer`.

5. Download
   - Download individual or batch report PDFs. PDF includes school branding, subject-wise marks, grades, remarks, positions and aggregate where applicable.

## Modes & Grading

The processor supports three modes with different grading/aggregate rules. Select the correct mode before processing.

- PRIMARY
  - 1–6 scale (code thresholds): 80+ → 1 (Excellent), 70–79 → 2, 60–69 → 3, 50–59 → 4, 45–49 → 5, <45 → 6
  - No aggregate calculation (aggregate_score will be `null`).

- JHS (BECE-style)
  - Numeric grades 1–9 using code thresholds: >=80 → 1, >=75 → 2, >=70 → 3, >=65 → 4, >=60 → 5, >=55 → 6, >=40 → 7, >=35 → 8, <35 → 9
  - Aggregate: 4 Core subjects + best 2 electives (only subjects tagged `(CORE)` or `(ELECTIVE)` are considered).

- SHS (WASSCE-style)
  - Alpha grades A1–F9 using code thresholds: >=80 → A1, >=75 → B2, >=70 → B3, >=65 → C4, >=60 → C5, >=55 → C6, >=50 → D7, >=45 → E8, <45 → F9
  - Aggregate: 3 Core subjects + best 3 electives.

## File Requirements & Limits

- Accepted spreadsheet formats: `.xlsx`, `.xls` (recommended to use the app's template). CSV is not supported.
- Max Excel file size: 10 MB.
- Allowed logo types: `image/jpeg`, `image/png`; max 2 MB.
- Header requirements: first row must include `roll_number` and `student_name` in columns A and B; subjects must start at column C as described above.

## Usage: Quick Steps

1. Open the app at `https://studenreportgenerator.vercel.app`.
2. Download the mode-appropriate template.
3. Populate student data following the two-row header structure.
4. Upload the `.xlsx` / `.xls` file via the Report Generator.
5. Enter school name, academic year, optionally upload logo, select `Mode`.
6. Click `Generate Reports` and download the resulting PDF(s).

## Implementation Notes

- Excel parsing and validation live in `utils/excelProcessor.js` — it reads the first sheet as a 2-D array and expects the two-row header layout.
- Template generation is in `utils/templateGenerator.js` and produces a ready-to-use `.xlsx` with instructions.
- PDF composition is implemented with `components/pdf/ReportDocument.jsx` and styled via `components/pdf/PdfStyles.js` using `@react-pdf/renderer`.
- File processing happens client-side for privacy and responsiveness; progress is shown during processing.

## Troubleshooting

- If subjects are missing: ensure Row 1 subject names begin at column C and Row 2 contains `class_score` / `exam_score` pairs.
- If grades/aggregates look wrong: confirm you selected the correct `Mode` and that subject names include `(CORE)` / `(ELECTIVE)` where required.
- If file upload fails: check format is `.xlsx` / `.xls` and file size is under 10 MB.
- Check the browser console for detailed errors and validation warnings returned by the processor.

## Development

### Scripts

- `npm run dev` — start development server (Next.js)
- `npm run build` — build for production
- `npm start` — run production server
- `npm run lint` — run ESLint

### Dependencies (high level)

- `next`, `react`, `react-dom`
- `@react-pdf/renderer` — client-side PDF generation
- `xlsx` (SheetJS) — Excel parsing and template generation
- `tailwindcss`, `lucide-react` — styling and icons

## License

See [LICENSE](LICENSE) for license information.

## Support

Open an issue in the repository for bugs, feature requests, or questions.

---

**Built with ❤️ for educators and schools**
