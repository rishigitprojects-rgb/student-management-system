import React from 'react';
import { Student, Grade, Course, AttendanceRecord } from '../types';
import { X, Printer, Download, Award, ShieldCheck } from 'lucide-react';
import crestImage from '../assets/images/university_crest_1791475297419.jpg';

interface TranscriptModalProps {
  student: Student;
  grades: Grade[];
  courses: Course[];
  attendance: AttendanceRecord[];
  onClose: () => void;
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  student,
  grades,
  courses,
  attendance,
  onClose
}) => {
  // Calculations
  let totalCredits = 0;
  let totalQualityPoints = 0;

  const rows = grades.map(g => {
    const course = courses.find(c => c.courseCode === g.courseCode);
    const credits = course ? course.credits : 3;
    const qualityPoints = Number((g.gradePoints * credits).toFixed(2));
    totalCredits += credits;
    totalQualityPoints += qualityPoints;

    return {
      grade: g,
      course,
      credits,
      qualityPoints
    };
  });

  const cgpa = totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : '0.00';
  const numericCgpa = parseFloat(cgpa);

  // Attendance rate
  const presentSessions = attendance.filter(a => a.status === 'Present').length;
  const lateSessions = attendance.filter(a => a.status === 'Late').length;
  const totalSessions = attendance.length;
  const attendancePct = totalSessions > 0
    ? Math.round(((presentSessions + lateSessions * 0.7) / totalSessions) * 100)
    : 100;

  const academicStanding = numericCgpa >= 3.50
    ? "Dean's Honors List · First Class Distinction"
    : numericCgpa >= 2.00
    ? "Good Academic Standing"
    : "Academic Probation Warning";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-[#CBD5E1] rounded-md shadow-2xl overflow-hidden my-6">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-[#1E293B] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Official University Academic Transcript
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Printable Document Body */}
        <div className="p-8 md:p-10 text-slate-900 bg-white">
          
          {/* Header Block with Crest */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex items-center gap-4">
              <img
                src={crestImage}
                alt="Institute Crest"
                className="w-16 h-16 rounded-full border border-slate-300 object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <h1 className="text-lg font-bold uppercase tracking-wider text-slate-900 leading-tight">
                  Metropolitan University of Technology
                </h1>
                <p className="text-xs text-slate-600 font-serif italic">
                  Office of the University Registrar · Department of Academic Affairs
                </p>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Accredited Commission on Higher Collegiate Education
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                Official Transcript
              </span>
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                Issued: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#FAF8F5] border border-slate-200 rounded-md text-xs mb-6 font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Student ID</span>
              <span className="font-bold text-slate-900">{student.studentId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Full Legal Name</span>
              <span className="font-bold text-slate-900 font-sans">{student.fullName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Department</span>
              <span className="font-bold text-slate-900 font-sans">{student.department}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Batch Cohort</span>
              <span className="font-bold text-slate-900">Class of {student.batch}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Enrollment Date</span>
              <span className="text-slate-800">{student.enrollmentDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Academic Standing</span>
              <span className={`font-bold font-sans ${numericCgpa >= 3.5 ? 'text-emerald-700' : 'text-slate-800'}`}>
                {student.status}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Attendance Rate</span>
              <span className="font-bold text-slate-900">{attendancePct}% dynamic</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">Document Seal</span>
              <span className="text-emerald-800 font-bold">VERIFIED #A991</span>
            </div>
          </div>

          {/* Academic Records Course Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Completed Coursework & Quality Points
            </h3>

            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-slate-300 font-semibold text-slate-800">
                  <th className="py-2 px-3 font-mono border-r border-slate-300">Course Code</th>
                  <th className="py-2 px-3 border-r border-slate-300">Course Title</th>
                  <th className="py-2 px-3 text-center border-r border-slate-300 font-mono">Term</th>
                  <th className="py-2 px-3 text-center border-r border-slate-300 font-mono">Credits</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300 font-mono">Score %</th>
                  <th className="py-2 px-3 text-center border-r border-slate-300 font-mono">Grade</th>
                  <th className="py-2 px-3 text-right border-r border-slate-300 font-mono">Points</th>
                  <th className="py-2 px-3 text-right font-mono">Quality Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500">
                      No completed grades recorded for this student.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.grade.gradeId} className={i % 2 === 1 ? 'bg-[#FAF8F5]' : 'bg-white'}>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                        {r.grade.courseCode}
                      </td>
                      <td className="py-2 px-3 text-slate-800 border-r border-slate-200">
                        {r.course?.title || r.grade.courseCode}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-600 border-r border-slate-200">
                        {r.grade.semester}
                      </td>
                      <td className="py-2 px-3 text-center font-mono border-r border-slate-200">
                        {r.credits}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums border-r border-slate-200">
                        {r.grade.totalScore}%
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold border-r border-slate-200">
                        {r.grade.letterGrade}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums border-r border-slate-200">
                        {r.grade.gradePoints.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {r.qualityPoints.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Cumulative CGPA Summary Box */}
          <div className="p-4 border-2 border-slate-900 rounded-md bg-[#FAF8F5] mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[11px] text-slate-500 font-mono block uppercase">Attempted Credits</span>
                <span className="text-lg font-bold font-mono text-slate-900">{totalCredits}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-mono block uppercase">Earned Quality Points</span>
                <span className="text-lg font-bold font-mono text-slate-900">{totalQualityPoints.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-mono block uppercase">Cumulative CGPA</span>
                <span className="text-2xl font-bold font-mono text-[#1E293B]">{cgpa}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-mono block uppercase">Academic Standing</span>
                <span className="text-xs font-bold text-slate-900 mt-1 block font-sans">
                  {academicStanding}
                </span>
              </div>
            </div>
          </div>

          {/* Official Sign-off Block */}
          <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-end justify-between gap-6 text-xs text-slate-600">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span className="font-semibold text-slate-900">Certified Authentic Academic Document</span>
              </div>
              <p className="text-[10px] text-slate-500 max-w-sm">
                This document is certified by the Office of the University Registrar. Any alteration, erasure, or unauthorized duplication invalidates this record.
              </p>
            </div>

            <div className="text-center sm:text-right">
              <div className="w-48 border-b border-slate-400 mb-1 mx-auto sm:ml-auto"></div>
              <span className="font-bold text-slate-900 block font-serif">Dr. Harold S. Pemberton, Ph.D.</span>
              <span className="text-[10px] text-slate-500 block">Registrar & Vice-Chancellor of Academic Affairs</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
