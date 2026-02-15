import LandingPage from '@/components/LandingPage';

export const metadata = {
  title: 'Student Report Generator - Create Professional Report Cards Instantly',
  description: 'Generate professional student report cards from Excel files automatically. Fast, free, and easy to use. Transform spreadsheets into beautifully formatted PDF reports in seconds.',
  alternates: {
    canonical: 'https://student-report-generator.com',
  },
};

export default function Home() {
  return (
    <main>
      <LandingPage />
    </main>
  );
}