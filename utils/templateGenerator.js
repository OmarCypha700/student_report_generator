import * as XLSX from 'xlsx';

/**
 * Generate downloadable Excel template with sample data and instructions
 */
export async function generateTemplate() {
  try {
    // Define subjects
    const subjects = ['english', 'math', 'science', 'social', 'rme', 'ict', 'french', 'twi', 'bdt'];
    
    // Create header row
    const headers = ['roll_number', 'student_name'];
    
    subjects.forEach(subject => {
      headers.push(`${subject}_class`);
      headers.push(`${subject}_exam`);
    });

    // Create sample data rows with realistic scores
    const sampleData = [
      {
        student_name: 'John Doe',
        roll_number: 1,
        ...generateSampleScores(subjects)
      },
      {
        student_name: 'Jane Smith',
        roll_number: 2,
        ...generateSampleScores(subjects)
      },
      {
        student_name: 'Bob Johnson',
        roll_number: 3,
        ...generateSampleScores(subjects)
      },
      {
        student_name: 'Alice Williams',
        roll_number: 4,
        ...generateSampleScores(subjects)
      },
      {
        student_name: 'Charlie Brown',
        roll_number: 5,
        ...generateSampleScores(subjects)
      }
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });

    // Set column widths for better readability
    const columnWidths = [
      { wch: 12 }, // roll_number
      { wch: 20 }, // student_name
    ];
    
    subjects.forEach(() => {
      columnWidths.push({ wch: 12 }); // class score
      columnWidths.push({ wch: 12 }); // exam score
    });
    
    worksheet['!cols'] = columnWidths;

    // Add comprehensive instructions sheet
    const instructionsData = [
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                    STUDENT REPORT CARD GENERATOR'],
      ['                          TEMPLATE INSTRUCTIONS'],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['Welcome to the Student Report Card Generator! This template will help you create'],
      ['professional report cards for your students quickly and easily.'],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                              HOW TO USE THIS TEMPLATE'],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['STEP 1: FILL IN STUDENT INFORMATION'],
      ['   • Column A (student_name): Enter the full name of each student'],
      ['   • Column B (roll_number): Assign a unique roll number/ID for each student'],
      [''],
      ['STEP 2: ENTER SUBJECT SCORES'],
      ['   • Class Score columns (ending with "_class"): Enter class work score (max 30)'],
      ['   • Exam Score columns (ending with "_exam"): Enter exam score (max 70)'],
      ['   • Total = Class Score + Exam Score (maximum 100 per subject)'],
      [''],
      ['STEP 3: SAVE AND UPLOAD'],
      ['   • Save this file as .xlsx or .xls format'],
      ['   • Go to the Report Generator website'],
      ['   • Upload this file'],
      ['   • Add your school name and logo'],
      ['   • Download your professional PDF report cards!'],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                               GRADING SCALE'],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['The system uses the following grading scale:'],
      [''],
      ['┌──────────────┬───────┬─────────────┐'],
      ['│ Score Range  │ Grade │ Remark      │'],
      ['├──────────────┼───────┼─────────────┤'],
      ['│ 80 - 100     │   1   │ Excellent   │'],
      ['│ 70 - 79      │   2   │ Very Good   │'],
      ['│ 60 - 69      │   3   │ Good        │'],
      ['│ 50 - 59      │   4   │ Credit      │'],
      ['│ 45 - 49      │   5   │ Pass        │'],
      ['│  0 - 44      │   6   │ Fail        │'],
      ['└──────────────┴───────┴─────────────┘'],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                             SUBJECTS INCLUDED'],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['CORE SUBJECTS (Required for Overall Grade):'],
      ['   1. English - Language and Literature'],
      ['   2. Mathematics - Numeracy and Problem Solving'],
      ['   3. Science - General Science'],
      ['   4. Social Studies - History, Geography, Civics'],
      [''],
      ['ELECTIVE SUBJECTS (Best 2 count towards Overall Grade):'],
      ['   5. RME - Religious & Moral Education'],
      ['   6. ICT - Information & Communication Technology'],
      ['   7. French - Foreign Language'],
      ['   8. Twi - Local Language'],
      ['   9. BDT - Basic Design & Technology'],
      [''],
      ['Note: The system automatically detects subjects from your column headers.'],
      ['You can add or remove subjects by adding/removing columns!'],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                        AUTOMATED CALCULATIONS'],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['The system will automatically calculate:'],
      [''],
      ['✓ Total Scores: Class Score + Exam Score for each subject'],
      ['✓ Subject Grades: Based on total score (1=Excellent to 6=Fail)'],
      ['✓ Remarks: Performance description for each subject'],
      ['✓ Class Positions: Overall ranking in the class'],
      ['✓ Subject Positions: Ranking for each individual subject'],
      ['✓ Overall Grade: Aggregate score (4 core + 2 best electives)'],
      ['✓ Average Score: Mean score across all subjects'],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                          IMPORTANT NOTES'],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['✓ DO NOT change the column header names'],
      ['   (student_name, roll_number, english_class, english_exam, etc.)'],
      [''],
      ['✓ Class scores must be between 0 and 30'],
      ['   (Scores above 30 will be automatically capped at 30)'],
      [''],
      ['✓ Exam scores must be between 0 and 70'],
      ['   (Scores above 70 will be automatically capped at 70)'],
      [''],
      ['✓ You can add more rows for additional students'],
      ['   (No limit on the number of students)'],
      [''],
      ['✓ Remove the sample data before adding your real student data'],
      ['   (Keep the header row!)'],
      [''],
      ['✓ Leave cells empty if a student did not take a particular subject'],
      ['   (Empty cells will be treated as 0)'],
      [''],
      ['✓ Ensure all student names are spelled correctly'],
      ['   (Names appear exactly as entered on the report cards)'],
      [''],
      ['✓ Use unique roll numbers for each student'],
      ['   (Duplicate roll numbers may cause confusion)'],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                     OVERALL GRADE CALCULATION'],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['The Overall Grade (Aggregate Score) is calculated as follows:'],
      [''],
      ['1. Take grades from 4 CORE subjects:'],
      ['   • English'],
      ['   • Mathematics'],
      ['   • Science'],
      ['   • Social Studies'],
      [''],
      ['2. Add grades from BEST 2 elective subjects:'],
      ['   • System automatically selects the 2 best performing electives'],
      ['   • From: RME, ICT, French, Twi, BDT'],
      [''],
      ['3. Sum all 6 grades for Overall Grade'],
      ['   • Lower aggregate = Better performance'],
      ['   • Example: Aggregate of 6 (all 1s) is better than 12 (all 2s)'],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                        TIPS FOR BEST RESULTS'],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['• Double-check all scores before uploading'],
      ['• Ensure student names are complete and properly spelled'],
      ['• Verify that roll numbers are unique and correct'],
      ['• Use whole numbers for scores (decimals will be rounded)'],
      ['• Keep a backup copy of your file before uploading'],
      ['• Save your work regularly while entering data'],
      ['• Test with a small group of students first'],
      ['• Check the generated PDFs before printing'],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                          TROUBLESHOOTING'],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['PROBLEM: File won\'t upload'],
      ['SOLUTION: Ensure file is saved as .xlsx or .xls, not .csv'],
      [''],
      ['PROBLEM: Error message about missing columns'],
      ['SOLUTION: Check that column headers match exactly (student_name, roll_number, etc.)'],
      [''],
      ['PROBLEM: Scores showing as 0'],
      ['SOLUTION: Make sure scores are entered as numbers, not text'],
      [''],
      ['PROBLEM: Student positions not calculating'],
      ['SOLUTION: Ensure all students have scores entered for at least some subjects'],
      [''],
      ['PROBLEM: Logo not appearing on report'],
      ['SOLUTION: Upload logo as JPG, PNG, or WebP format, under 2MB'],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                            NEED HELP?'],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['If you encounter any issues or have questions:'],
      [''],
      ['1. Check that all column headers are correct'],
      ['2. Verify that scores are within the correct ranges (0-30 for class, 0-70 for exam)'],
      ['3. Ensure the file is saved as .xlsx or .xls'],
      ['4. Make sure there are no merged cells in the data'],
      ['5. Review the sample data for reference'],
      [''],
      ['For additional support, visit the application help section.'],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      ['                   READY TO START? SWITCH TO "Student Scores" TAB!'],
      ['═══════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['The "Student Scores" tab contains sample data to show you the format.'],
      ['Delete the sample rows (keep the headers!) and add your actual student data.'],
      [''],
      ['Good luck with your report card generation!'],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════']
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet['!cols'] = [{ wch: 85 }];

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Scores');
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

    // Generate and download file
    const fileName = `student_report_template_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating template:', error);
    throw new Error('Failed to generate template. Please try again.');
  }
}

/**
 * Generate realistic sample scores for demonstration
 * @param {Array} subjects - List of subject names
 * @returns {Object} - Object with sample scores for each subject
 */
function generateSampleScores(subjects) {
  const scores = {};
  subjects.forEach(subject => {
    // Generate realistic sample scores with some variation
    const classScore = Math.floor(Math.random() * 11) + 20; // 20-30
    const examScore = Math.floor(Math.random() * 21) + 50;  // 50-70
    
    scores[`${subject}_class`] = classScore;
    scores[`${subject}_exam`] = examScore;
  });
  return scores;
}

/**
 * Validate template structure (optional utility function)
 * @param {Array} data - Parsed Excel data
 * @returns {Object} - Validation result
 */
export function validateTemplate(data) {
  const errors = [];
  const warnings = [];
  
  if (!data || data.length === 0) {
    errors.push('Template is empty');
    return { valid: false, errors, warnings };
  }
  
  const firstRow = data[0];
  
  // Check required columns
  if (!firstRow.student_name) {
    errors.push('Missing required column: student_name');
  }
  
  if (firstRow.roll_number === undefined) {
    errors.push('Missing required column: roll_number');
  }
  
  // Check for subject columns
  const subjectColumns = Object.keys(firstRow).filter(key => 
    key.endsWith('_class') || key.endsWith('_exam')
  );
  
  if (subjectColumns.length === 0) {
    errors.push('No subject columns found');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}