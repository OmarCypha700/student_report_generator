# Student Report Generator

A modern web application that automatically generates professional student report cards from Excel spreadsheets. Transform student data into beautifully formatted PDF reports in seconds.

## Features

✨ **Key Capabilities**
- **Excel To PDF Conversion** - Upload Excel files (.xlsx or .xls) with student data and automatically generate professional report cards
- **Dynamic Subject Detection** - Automatically extracts subjects from your Excel file structure
- **Custom School Branding** - Add your school logo and name to personalize report cards
- **Batch Processing** - Generate report cards for multiple students at once
- **Grade Calculation** - Automatically calculates grades and remarks based on student scores
- **Progress Tracking** - Real-time progress indicators during file processing
- **PDF Download** - Download individual or batch report cards as PDF files
- **Template Download** - Download a pre-formatted Excel template to ensure proper data structure

## How It Works

### 1. **Landing Page**
Start at the home page where you can:
- View features and benefits
- Download the Excel template
- Access the report generator

### 2. **Upload Excel File**
The generator expects an Excel file with the following structure:
- **Column Format**: Each subject should have two columns: `{subject}_class` (for class marks) and `{subject}_exam` (for exam marks)
- **Example**: `Math_class`, `Math_exam`, `English_class`, `English_exam`, etc.
- **Required Columns**: Include `roll_number` and `student_name` for student identification

### 3. **Configure School Information**
- Enter your school name
- Add school logo (JPEG/PNG, max 2MB)
- Specify academic year

### 4. **Generate Reports**
The app will:
- Parse your Excel file
- Calculate total marks and grades for each subject
- Assign grade levels (1-6) with remarks (Excellent, Very Good, Good, Credit, Pass, Fail)
- Generate professional PDF report cards for each student

### 5. **Download Results**
- Download batch reports with all students
- Each report includes student name, roll number, subject-wise performance, and school branding

## Grade Scale (According to WAEC Standard)

| Score | Grade | Remark |
|-------|-------|--------|
| 80+ | 1 | Excellent |
| 70-79 | 2 | Very Good |
| 60-69 | 3 | Good |
| 50-59 | 4 | Credit |
| 45-49 | 5 | Pass |
| <45 | 6 | Fail |

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) - React-based full-stack framework
- **UI Components**: [React 19](https://react.dev/) - Component library
- **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/) - Client-side PDF creation
- **Excel Processing**: [XLSX](https://sheetjs.com/) - Excel file parsing
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icon library

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd <repository-url>
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000) to see the application

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
autorep/
├── app/
│   ├── layout.js          # Root layout component
│   ├── page.js            # Home page entry point
│   └── globals.css        # Global styles
├── components/
│   ├── LandingPage.jsx    # Landing page with features
│   ├── ReportGenerator.jsx # Main report generation component
│   ├── PDFReportDownload.jsx # PDF download handler
│   ├── ProcessingStatus.jsx # Progress and status display
│   └── pdf/
│       ├── ReportDocument.jsx # PDF document structure
│       └── PdfStyles.js    # PDF styling
├── utils/
│   ├── excelProcessor.js  # Excel file parsing and processing
│   └── templateGenerator.js # Excel template creation
├── public/                # Static assets
├── next.config.mjs        # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json           # Project dependencies
```

## Usage Example

### Excel File Format

Create an Excel file with the following structure:

| name | roll_number | Math_class | Math_exam | English_class | English_exam |
|------|-------------|-----------|-----------|---------------|--------------|
| Arjun | 1 | 35 | 45 | 40 | 35 |
| Bhavna | 2 | 40 | 42 | 45 | 48 |
| Chetan | 3 | 48 | 50 | 50 | 45 |

## Generating Reports

1. Download the template from the landing page
2. Fill in student data following the format above
3. Click "Upload Excel File" in the report generator
4. Add school details (name, logo, academic year)
5. Review the extracted data
6. Click "Generate Reports"
7. Download the PDF files

## Features in Detail

### Excel Processing (`utils/excelProcessor.js`)
- Dynamically detects subjects by finding columns ending with `_class`
- Calculates total marks by combining class and exam marks
- Assigns grades based on total marks
- Generates ordinal suffixes for positions (e.g., 1st, 2nd, 3rd)

### PDF Generation (`components/pdf/ReportDocument.jsx`)
- Creates professional multi-page documents
- Includes school logo and branding
- Displays subject-wise performance with grades
- Shows school name, academic year, and report date
- Responsive layout for different paper sizes

### Data Validation
- File type validation (Excel/CSV only)
- File size limits (10MB for Excel, 2MB for images)
- Excel structure validation
- Progress tracking during processing

## Limitations

- **File Size**: Maximum 10MB for Excel files, 2MB for logo images
- **Supported Formats**: Excel (.xlsx, .xls) files
- **Subject Naming**: Subjects must follow the `{subject}_class` and `{subject}_exam` naming convention
- **Browser**: Requires modern JavaScript support for PDF generation

## Performance

- Real-time progress indicators during file processing
- Client-side processing minimizes server load
- Optimized Excel parsing with XLSX library
- Efficient PDF generation with react-pdf renderer

## Troubleshooting

### File Upload Issues
- Ensure file is in .xlsx or .xls format
- Check file size is under 10MB
- Verify Excel has properly formatted subject columns

### Missing Subjects
- Ensure subject columns follow `{subject}_class` and `{subject}_exam` naming pattern
- Check for proper column headers in Excel
- Remove any empty or unnamed columns and rows (It might result in empty PDFs)

### PDF Generation Errors
- Ensure all required student data is present
- Verify logo image format (JPEG/PNG only)
- Check browser console for detailed error messages

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |

### Code Quality

This project uses ESLint for code quality. Run linting with:
```bash
npm run lint
```

## License

[MIT License](LICENSE)

## Support

For issues, feature requests, or questions, please contact the development team or submit an issue in the repository.

---

**Built with ❤️ for educators and schools**
