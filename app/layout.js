import './globals.css';

export const metadata = {
  title: 'Student Report Generator - Create Professional Report Cards Instantly',
  description: 'Generate professional student report cards from Excel files automatically. Fast, free, and easy to use. Transform spreadsheets into beautifully formatted PDF reports in seconds. No registration required.',
  keywords: 'student reports, report cards, excel to pdf, grade generator, school reports, automatic grading, academic reports, student assessment, grade calculator, report card maker',
  authors: [{ name: 'Caleb Nana Adjei' }, {name: 'Samuel Oppong'}],
  creator: 'Student Report Generator',
  publisher: 'Student Report Generator',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://student-report-generator.com',
    title: 'Student Report Generator - Professional Report Cards in Seconds',
    description: 'Generate professional student report cards from Excel files automatically. Free, fast, and privacy-focused.',
    siteName: 'Student Report Generator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Student Report Generator - Professional Report Cards',
    description: 'Generate professional report cards from Excel files instantly. 100% free and privacy-protected.',
  },
  verification: {
    // Add verification codes when available
    // google: 'verification_code',
    // yandex: 'verification_code',
  },
  category: 'education',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="application-name" content="Student Report Generator" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Report Generator" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}