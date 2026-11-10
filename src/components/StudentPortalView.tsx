import React from 'react';
import { Student, AppUser, Grade, Course, AttendanceRecord, FeeLedgerEntry, FeeReceipt, Enrollment } from '../types';
import { Award, BookOpen, CalendarCheck, DollarSign, FileText, Receipt, CheckCircle, AlertTriangle } from 'lucide-react';
import { AttendanceTrendChart } from './AttendanceTrendChart';

interface StudentPortalViewProps {
  currentUser: AppUser;
  student: Student;
  enrollments: Enrollment[];
  courses: Course[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  feeLedger?: FeeLedgerEntry;
  receipts: FeeReceipt[];
  cgpa: number;
  totalCredits: number;
  attendanceRate: number;
  onOpenTranscript: (studentId: string) => void;
  onViewReceipt: (receipt: FeeReceipt) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentUser,
  student,
  enrollments,
  courses,
  grades,
  attendance,
  feeLedger,
  receipts,
  cgpa,
  totalCredits,
  attendanceRate,
  onOpenTranscript,
  onViewReceipt
}) => {
  const isLowAttendance = attendanceRate < 75;

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-xs">
              {student.studentId}
            </span>
            <span className="text-xs text-slate-500">Student Self-Service Portal</span>
          </div>
          <h2 className="text-xl font-bold text-[#1E293B]">{student.fullName}</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            {student.department} · Cohort {student.batch} · Status: <span className="font-semibold text-emerald-700">{student.status}</span>
          </p>
        </div>

        <button
          onClick={() => onOpenTranscript(student.studentId)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1E293B] hover:bg-slate-800 rounded-md transition-colors shadow-xs"
        >
          <FileText className="w-4 h-4" />
          <span>Download Official Academic Transcript</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Cumulative CGPA</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block">
            {cgpa.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalCredits} earned credit hours
          </span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Semester Attendance</span>
            <CalendarCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${isLowAttendance ? 'text-[#9F1239]' : 'text-slate-900'}`}>
              {attendanceRate}%
            </span>
            {isLowAttendance && (
              <span className="text-[10px] bg-[#FFE4E6] text-[#9F1239] px-1.5 py-0.5 rounded-xs font-semibold">
                Shortage
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {attendance.length} logged sessions
          </span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 block">
            {enrollments.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Fall 2024 academic term
          </span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500">Tuition Balance</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <span className={`text-2xl font-bold font-mono tabular-nums ${feeLedger && feeLedger.balanceAmount > 0 ? 'text-[#9F1239]' : 'text-emerald-700'}`}>
            ${feeLedger ? feeLedger.balanceAmount.toFixed(2) : '0.00'}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Status: {feeLedger?.status || 'Settled'}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Enrolled Courses & Completed Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Enrolled Courses */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            Active Registered Courses ({enrollments.length})
          </h3>

          <div className="space-y-2.5">
            {enrollments.map(enr => {
              const course = courses.find(c => c.courseCode === enr.courseCode);
              return (
                <div key={enr.enrollmentId} className="p-3 border border-[#E2E8F0] rounded-md bg-[#FAF8F5]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900">{enr.courseCode}</span>
                    <span className="text-[11px] font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.2 rounded-xs">
                      {course?.credits || 3} Credits
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900">{course?.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{course?.faculty} · {course?.department}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Course Grades */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            Evaluated Course Grades ({grades.length})
          </h3>

          <div className="border border-[#E2E8F0] rounded-md overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E2E8F0] font-semibold text-slate-600">
                  <th className="py-2 px-3 font-mono">Course</th>
                  <th className="py-2 px-3 text-right">Score %</th>
                  <th className="py-2 px-3 text-center">Grade</th>
                  <th className="py-2 px-3 text-right font-mono">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFEA]">
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-500">
                      No grades recorded yet.
                    </td>
                  </tr>
                ) : (
                  grades.map((g, idx) => (
                    <tr key={g.gradeId} className={idx % 2 === 1 ? 'bg-[#FAF8F5]' : 'bg-white'}>
                      <td className="py-2 px-3 font-mono font-medium text-slate-900">{g.courseCode}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">{g.totalScore}%</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded-xs text-slate-800">{g.letterGrade}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">{g.gradePoints.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Personal Attendance Trend Line Graph */}
      <AttendanceTrendChart
        attendanceRecords={attendance}
        students={[student]}
        courses={courses}
        initialStudentId={student.studentId}
      />

      {/* Receipts & Tuition History */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Official Bursar Payment Receipts ({receipts.length})
        </h3>

        <div className="border border-[#E2E8F0] rounded-md overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E2E8F0] font-semibold text-slate-600">
                <th className="py-2 px-3 font-mono">Receipt No.</th>
                <th className="py-2 px-3 text-right">Amount</th>
                <th className="py-2 px-3">Method</th>
                <th className="py-2 px-3 font-mono">Reference</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFEA]">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500">
                    No payment receipts issued yet.
                  </td>
                </tr>
              ) : (
                receipts.map((r, idx) => (
                  <tr key={r.receiptId} className={idx % 2 === 1 ? 'bg-[#FAF8F5]' : 'bg-white'}>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-900">{r.receiptId}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">${r.amount.toFixed(2)}</td>
                    <td className="py-2 px-3 text-slate-700">{r.paymentMethod}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{r.transactionRef}</td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{r.issuedAt}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => onViewReceipt(r)}
                        className="inline-flex items-center gap-1 text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-semibold"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>View Voucher</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
