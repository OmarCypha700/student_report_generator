"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  Sparkles,
  Zap,
  Shield,
  Award,
  Users,
  Clock,
  ArrowRight,
  Star,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import ReportGenerator from "./ReportGenerator";
import { generateTemplate } from "@/utils/templateGenerator";

export default function LandingPage() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [mode, setMode] = useState("PRIMARY");

  const handleDownloadTemplate = async (mode) => {
    setIsDownloading(true);
    try {
      await generateTemplate(mode);
      setTimeout(() => setIsDownloading(false), 1500);
    } catch (error) {
      console.error("Error downloading template:", error);
      setIsDownloading(false);
      alert("Error downloading template. Please try again.");
    }
  };

  const confirmDownloadTemplate = (mode) => {
    setShowDownloadDialog(false);
    handleDownloadTemplate(mode);
  };

  if (showGenerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => setShowGenerator(false)}
            className="group mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 transition-all duration-200"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">
              ←
            </span>
            Back to Home
          </button>
          <ReportGenerator />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-8 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fadeIn">
            {/* <Image
              src="/favicon.svg"
              alt="MyReport Logo"
              width={24}
              height={24}
              className="w-6 h-6"
            /> */}
            <Sparkles size={16} className="animate-pulse" />
            {/* MyReport  */}
            <p className="inline-block">Automated Report Generator</p>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fadeIn">
            Generate Student
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Report Cards Instantly
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto animate-fadeIn">
            Transform your Excel spreadsheet into professional, beautifully
            formatted PDF report cards in seconds. No manual work, no
            complicated setup.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fadeIn">
            <button
              onClick={() => setShowGenerator(true)}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 md:px-10 py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg shadow-lg hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Upload size={24} />
              Get Started Free
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>

            <button
              onClick={() => setShowDownloadDialog(true)}
              disabled={isDownloading}
              className="bg-white hover:bg-gray-50 text-gray-800 px-8 md:px-10 py-4 md:py-5 rounded-xl font-semibold text-base md:text-lg shadow-md hover:shadow-lg transition-all duration-200 border-2 border-gray-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={24} />
                  Download Template
                </>
              )}
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm animate-fadeIn">
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle size={18} className="text-green-600" />
              <span className="font-medium">100% Free Forever</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle size={18} className="text-green-600" />
              <span className="font-medium">No Sign Up Required</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle size={18} className="text-green-600" />
              <span className="font-medium">Privacy Protected</span>
            </div>
          </div>
        </div>

        {/* Download Dialog */}
        {showDownloadDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Confirm Template
              </h3>

              <p className="text-sm text-gray-600 mb-6">
                Confirm the <strong>level of education</strong> for the template
                you want to download. This will ensure you get the correct
                subjects and formatting for your needs.
              </p>

              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 text-sm text-gray-600 border border-gray-300 rounded-lg mb-4"
              >
                <option value="PRIMARY">Primary</option>
                <option value="JHS">JHS</option>
                <option value="SHS">SHS</option>
              </select>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDownloadDialog(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={() => confirmDownloadTemplate(mode)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Download Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center text-white">
            <StatCard
              icon={<Users size={32} />}
              value="10+"
              label="Schools Trust Us"
            />
            <StatCard
              icon={<FileText size={32} />}
              value="50+"
              label="Reports Generated"
            />
            <StatCard
              icon={<Clock size={32} />}
              value="< 30 sec"
              label="Average Processing"
            />
            <StatCard
              icon={<Award size={32} />}
              value="100%"
              label="Accuracy Rate"
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to professional report cards
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            <StepCard
              number="1"
              icon={<Download size={32} />}
              title="Download Template"
              description="Get our pre-formatted Excel template with sample data and clear instructions for all required fields."
              color="blue"
            />
            <StepCard
              number="2"
              icon={<FileSpreadsheet size={32} />}
              title="Fill Your Data"
              description="Enter student names, roll numbers, and scores. Our template guides you through each column with examples."
              color="purple"
            />
            <StepCard
              number="3"
              icon={<FileText size={32} />}
              title="Generate Reports"
              description="Upload your file, add school branding, and download professional PDF report cards instantly."
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for professional report cards
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Zap className="text-yellow-500" size={28} />}
              title="Lightning Fast"
              description="Process 100+ students in under 10 seconds with our optimized algorithm"
            />
            <FeatureCard
              icon={<Award className="text-blue-500" size={28} />}
              title="Auto Grading"
              description="Automatic WAEC grading logic system calculation with and remarks"
            />
            <FeatureCard
              icon={<TrendingUp className="text-green-500" size={28} />}
              title="Smart Rankings"
              description="Automatic class and subject-wise position calculation with tie handling"
            />
            <FeatureCard
              icon={<Sparkles className="text-purple-500" size={28} />}
              title="Custom Branding"
              description="Add your school logo and name to every report card"
            />
            <FeatureCard
              icon={<Shield className="text-red-500" size={28} />}
              title="Privacy First"
              description="All processing happens locally in your browser. No data uploaded"
            />
            <FeatureCard
              icon={<BarChart3 className="text-indigo-500" size={28} />}
              title="Print Ready PDFs"
              description="Professional, clean format optimized for printing"
            />
          </div>
        </div>
      </div>

      {/* Template Info Section */}
      <div className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl md:rounded-3xl p-8 md:p-16 text-white shadow-2xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
                Excel Template Format
              </h2>
              <p className="text-blue-100 text-base md:text-lg mb-6 md:mb-8">
                Our template is designed for ease of use with clear structure
                and examples
              </p>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-white/10 backdrop-blur rounded-xl p-5 md:p-6">
                  <h3 className="font-bold text-lg md:text-xl mb-3 md:mb-4">
                    Student Information
                  </h3>
                  <ul className="space-y-2 md:space-y-3 text-blue-100 text-sm md:text-base">
                    <li className="flex items-center gap-2">
                      <CheckCircle
                        size={18}
                        className="text-green-300 flex-shrink-0"
                      />
                      <span>Roll Number (Unique ID)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle
                        size={18}
                        className="text-green-300 flex-shrink-0"
                      />
                      <span>Student Name (Full name)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-xl p-5 md:p-6">
                  <h3 className="font-bold text-lg md:text-xl mb-3 md:mb-4">
                    Subject Scores
                  </h3>
                  <ul className="space-y-2 md:space-y-3 text-blue-100 text-sm md:text-base">
                    <li className="flex items-center gap-2">
                      <CheckCircle
                        size={18}
                        className="text-green-300 flex-shrink-0"
                      />
                      <span>Class Score (out of 30)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle
                        size={18}
                        className="text-green-300 flex-shrink-0"
                      />
                      <span>Exam Score (out of 70)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-5 md:p-6 mb-6 md:mb-8">
                <h3 className="font-bold text-lg md:text-xl mb-3 md:mb-4">
                  Supported Subjects
                </h3>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <span className="bg-white/20 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium">
                    Primary | JHS & SHS Subjects
                  </span>
                </div>
                <p className="text-xs md:text-sm text-blue-100 mt-3 md:mt-4 flex items-start gap-2">
                  <Star size={16} className="flex-shrink-0 mt-0.5" />
                  <span>
                    System automatically detects subjects from your Excel file
                  </span>
                </p>
              </div>

              <button
                onClick={() => setShowDownloadDialog(true)}
                disabled={isDownloading}
                className="group bg-white text-blue-600 px-8 md:px-10 py-4 md:py-5 rounded-xl font-bold text-base md:text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
              >
                {isDownloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Downloading Template...</span>
                  </>
                ) : (
                  <>
                    <Download size={24} />
                    <span>Download Excel Template</span>
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform duration-200"
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      {/* <div className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by Educators Worldwide
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Schools and teachers love how easy it is to generate professional reports
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              quote="This tool saved me hours of work! I can now generate report cards for my entire class in minutes."
              author="Sarah Johnson"
              role="Primary School Teacher"
              rating={5}
            />
            <TestimonialCard
              quote="The automatic grading and ranking features are incredibly accurate. Highly recommended!"
              author="Michael Chen"
              role="Secondary School Principal"
              rating={5}
            />
            <TestimonialCard
              quote="Simple, fast, and professional. Exactly what we needed for our school's reporting system."
              author="Aisha Mohammed"
              role="Academic Coordinator"
              rating={5}
            />
          </div>
        </div>
      </div> */}

      {/* CTA Section */}
      <div className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-8 md:mb-12 max-w-3xl mx-auto">
            Join thousands of schools generating professional report cards in
            seconds
          </p>
          <button
            onClick={() => setShowGenerator(true)}
            className="group bg-white text-blue-600 px-10 md:px-12 py-5 md:py-6 rounded-xl font-bold text-lg md:text-xl hover:bg-blue-50 transition-all duration-200 shadow-2xl hover:shadow-3xl inline-flex items-center gap-4"
          >
            Start Generating Reports
            <Upload
              size={24}
              className="group-hover:scale-110 transition-transform duration-200"
            />
          </button>
          <p className="mt-6 text-blue-100 text-sm">
            No credit card required • No installation needed
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-white font-bold text-xl mb-2">
              Automated Report Generator
            </h3>
            <p className="mb-4 text-sm md:text-base">
              Making report card generation effortless for educators
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                About
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Student Report Generator. All rights
              reserved.
            </p>
            <p className="text-sm mt-2 flex items-center justify-center gap-1">
              Deveoped by{" "}
              <a
                href="https://cypha.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 transition-colors"
              >
                Cypha
              </a>
              &{" "}
              <a
                href="https://github.com/stormzee"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 transition-colors"
              >
                Stormzee
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function StatCard({ icon, value, label }) {
  return (
    <div className="transform hover:scale-105 transition-transform duration-200">
      <div className="mb-3">{icon}</div>
      <div className="text-3xl md:text-4xl font-bold mb-2">{value}</div>
      <div className="text-blue-100 text-sm md:text-base">{label}</div>
    </div>
  );
}

function StepCard({ number, icon, title, description, color }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
  };

  return (
    <div className="relative group">
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
        <div
          className={`absolute -top-5 left-6 md:left-8 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg group-hover:scale-110 transition-transform duration-200`}
        >
          {number}
        </div>
        <div className="mt-6 md:mt-8 mb-4 md:mb-6 text-gray-400 group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
        <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-xl p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      <div className="mb-4 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-gray-900">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
        {description}
      </p>
    </div>
  );
}

function TestimonialCard({ quote, author, role, rating }) {
  return (
    <div className="bg-white rounded-xl p-6 md:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-700 mb-6 italic text-sm md:text-base leading-relaxed">
        "{quote}"
      </p>
      <div className="border-t border-gray-200 pt-4">
        <p className="font-bold text-gray-900">{author}</p>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </div>
  );
}
