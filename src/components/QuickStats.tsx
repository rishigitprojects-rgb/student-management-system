import React from 'react';
import { Users, BookOpen, GraduationCap, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StudentAcademicSummary, Course, FeeLedgerEntry } from '../types';

interface QuickStatsProps {
  summaries: StudentAcademicSummary[];
  courses: Course[];
  feeLedgers: FeeLedgerEntry[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ summaries, courses, feeLedgers }) => {
  const totalStudents = summaries.length;
  const activeStudents = summaries.filter(s => s.student.status === 'Active').length;
  
  const totalCourses = courses.length;
  const totalSeatCapacity = courses.reduce((acc, c) => acc + c.capacity, 0);
  const totalEnrolledSeats = courses.reduce((acc, c) => acc + c.enrolledCount, 0);

  // Calculate Institute Average GPA
  const studentsWithGpa = summaries.filter(s => s.cgpa > 0);
  const avgGpa = studentsWithGpa.length > 0
    ? (studentsWithGpa.reduce((acc, s) => acc + s.cgpa, 0) / studentsWithGpa.length).toFixed(2)
    : '0.00';

  // Calculate Institute Attendance Rate
  const avgAttendance = summaries.length > 0
    ? Math.round(summaries.reduce((acc, s) => acc + s.attendanceRate, 0) / summaries.length)
    : 100;
  const lowAttendanceCount = summaries.filter(s => s.attendanceRate < 75).length;

  // Fee ledger warnings
  const overdueEntries = feeLedgers.filter(f => f.status === 'Overdue');
  const overdueTotal = overdueEntries.reduce((acc, f) => acc + f.balanceAmount, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      
      {/* 1. Enrolled Students */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">Enrolled Students</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 leading-none">
            {totalStudents}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            ({activeStudents} active)
          </span>
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">
          4 departments · 3 cohorts
        </span>
      </div>

      {/* 2. Active Courses */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">Active Courses</span>
          <BookOpen className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 leading-none">
            {totalCourses}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            catalog items
          </span>
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block font-mono">
          {totalEnrolledSeats}/{totalSeatCapacity} seats occupied
        </span>
      </div>

      {/* 3. Institute Avg GPA */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">Institute Avg GPA</span>
          <GraduationCap className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 leading-none">
            {avgGpa}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            / 4.00
          </span>
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">
          Weighted by credit hours
        </span>
      </div>

      {/* 4. Attendance Rate */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">Attendance Rate</span>
          <CheckCircle2 className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold font-mono tabular-nums leading-none ${avgAttendance < 75 ? 'text-[#9F1239]' : 'text-slate-900'}`}>
            {avgAttendance}%
          </span>
          {lowAttendanceCount > 0 && (
            <span className="text-[10px] bg-[#FFE4E6] text-[#9F1239] px-1.5 py-0.5 rounded-sm font-medium">
              {lowAttendanceCount} &lt;75%
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">
          Dynamic semester tracking
        </span>
      </div>

      {/* 5. Pending Fee Warnings */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 transition-colors hover:border-slate-300 col-span-2 md:col-span-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">Pending Fee Warnings</span>
          <AlertTriangle className={`w-4 h-4 ${overdueEntries.length > 0 ? 'text-[#92400E]' : 'text-slate-400'}`} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold font-mono tabular-nums text-slate-900 leading-none">
            ${overdueTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 mt-1 block">
          {overdueEntries.length} accounts overdue
        </span>
      </div>

    </div>
  );
};
