import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus, Student, Course, AppUser } from '../types';
import { CalendarCheck2, Plus, Download, AlertTriangle, Check, X, Trash2, LineChart as ChartIcon } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';
import { AttendanceTrendChart } from './AttendanceTrendChart';

interface AttendanceModuleProps {
  attendanceRecords: AttendanceRecord[];
  students: Student[];
  courses: Course[];
  currentUser: AppUser;
  onLogAttendance: (rec: Omit<AttendanceRecord, 'attendanceId'>) => void;
  onDeleteAttendance: (attendanceId: string) => void;
  calculateStudentRate: (studentId: string, courseCode?: string) => {
    rate: number;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    isWarning: boolean;
  };
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({
  attendanceRecords,
  students,
  courses,
  currentUser,
  onLogAttendance,
  onDeleteAttendance,
  calculateStudentRate
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<string>('ALL');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form State
  const [logForm, setLogForm] = useState<{
    studentId: string;
    courseCode: string;
    date: string;
    status: AttendanceStatus;
    topic: string;
  }>({
    studentId: students[0]?.studentId || '',
    courseCode: courses[0]?.courseCode || '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    topic: ''
  });

  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY';

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(r => {
    if (selectedCourse !== 'ALL' && r.courseCode !== selectedCourse) return false;
    if (selectedStudent !== 'ALL' && r.studentId !== selectedStudent) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Compute stats for student roster
  const studentRates = students.map(s => {
    const rateInfo = calculateStudentRate(s.studentId, selectedCourse !== 'ALL' ? selectedCourse : undefined);
    return {
      student: s,
      ...rateInfo
    };
  });

  const warningStudents = studentRates.filter(s => s.isWarning && s.totalSessions > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.studentId || !logForm.courseCode) {
      alert('Please specify student and course.');
      return;
    }

    onLogAttendance({
      studentId: logForm.studentId,
      courseCode: logForm.courseCode,
      date: logForm.date,
      status: logForm.status,
      topic: logForm.topic.trim() || undefined
    });

    setIsLogModalOpen(false);
  };

  const handleExportCsv = () => {
    const exportData = filteredRecords.map(r => {
      const student = students.find(s => s.studentId === r.studentId);
      const course = courses.find(c => c.courseCode === r.courseCode);
      return {
        AttendanceID: r.attendanceId,
        StudentID: r.studentId,
        StudentName: student?.fullName || '',
        CourseCode: r.courseCode,
        CourseTitle: course?.title || '',
        SessionDate: r.date,
        Status: r.status,
        LectureTopic: r.topic || ''
      };
    });

    exportToCsv('attendance_session_logs', exportData);
  };

  const renderBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return <span className="inline-block px-2 py-0.5 rounded-xs text-xs font-semibold bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">Present</span>;
      case 'Absent':
        return <span className="inline-block px-2 py-0.5 rounded-xs text-xs font-semibold bg-[#FFE4E6] text-[#9F1239] border border-[#FECDD3]">Absent</span>;
      case 'Late':
        return <span className="inline-block px-2 py-0.5 rounded-xs text-xs font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">Late (0.7x)</span>;
      case 'Excused':
        return <span className="inline-block px-2 py-0.5 rounded-xs text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Excused</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#1E293B]">Course Attendance & Session Tracking</h2>
          <p className="text-xs text-slate-500">
            Mandatory 75% attendance threshold per academic senate regulations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {canEdit && (
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E293B] rounded-md hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Session Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Attendance Shortage Warning Banner */}
      {warningStudents.length > 0 && (
        <div className="p-3.5 bg-[#FFF1F2] border border-[#FECDD3] rounded-md flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#9F1239] shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-[#9F1239]">
              Attendance Warning: {warningStudents.length} student(s) below mandatory 75% threshold
            </h4>
            <p className="text-slate-600 mt-0.5">
              {warningStudents.map(s => `${s.student.fullName} (${s.rate}%)`).join(', ')} may be disbarred from final semester examinations.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Recharts Attendance Trends Line Graph */}
      <AttendanceTrendChart
        attendanceRecords={attendanceRecords}
        students={students}
        courses={courses}
        initialStudentId={selectedStudent !== 'ALL' ? selectedStudent : students[0]?.studentId}
        initialCourseCode={selectedCourse !== 'ALL' ? selectedCourse : courses[0]?.courseCode}
      />

      {/* Student Attendance Rate Rollup Grid */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Student Attendance Rates & Regulatory Standing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {studentRates.map(({ student, rate, totalSessions, presentCount, absentCount, lateCount, isWarning }) => (
            <div
              key={student.studentId}
              onClick={() => setSelectedStudent(student.studentId)}
              className={`p-3 rounded-md border cursor-pointer transition-all ${
                selectedStudent === student.studentId
                  ? 'border-[#1E293B] bg-slate-50/50 ring-1 ring-[#1E293B]'
                  : isWarning && totalSessions > 0
                  ? 'border-[#FECDD3] bg-[#FFF5F5] hover:border-rose-400'
                  : 'border-[#E2E8F0] bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-slate-900">{student.studentId}</span>
                <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded-xs ${
                  isWarning && totalSessions > 0
                    ? 'bg-[#FFE4E6] text-[#9F1239]'
                    : rate >= 90
                    ? 'bg-[#D1FAE5] text-[#065F46]'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {rate}%
                </span>
              </div>

              <div className="font-semibold text-xs text-slate-900">{student.fullName}</div>
              <div className="text-[11px] text-slate-500">{student.department}</div>

              <div className="mt-2 pt-2 border-t border-[#F1EFEA] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{totalSessions} total sessions</span>
                <span>P:{presentCount} · A:{absentCount} · L:{lateCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Session Records Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 flex flex-wrap items-center gap-3">
        <div className="w-52">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Filter by Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full text-xs bg-[#FAF8F5] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-slate-700"
          >
            <option value="ALL">All Courses ({courses.length})</option>
            {courses.map(c => (
              <option key={c.courseCode} value={c.courseCode}>{c.courseCode} - {c.title}</option>
            ))}
          </select>
        </div>

        <div className="w-56">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Filter by Student</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full text-xs bg-[#FAF8F5] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-slate-700"
          >
            <option value="ALL">All Students ({students.length})</option>
            {students.map(s => (
              <option key={s.studentId} value={s.studentId}>{s.studentId} - {s.fullName}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-500 pt-3">
          Showing <span className="font-mono font-semibold text-slate-800">{filteredRecords.length}</span> log entries
        </div>
      </div>

      {/* Daily Attendance Session Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E2E8F0] text-slate-600 font-semibold">
                <th className="py-2.5 px-3 font-mono">Date</th>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Session Topic</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                {canEdit && <th className="py-2.5 px-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFEA]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="py-8 text-center text-slate-500">
                    No attendance logs match the active filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => {
                  const student = students.find(s => s.studentId === r.studentId);
                  const course = courses.find(c => c.courseCode === r.courseCode);
                  const isEven = idx % 2 === 1;

                  return (
                    <tr key={r.attendanceId} className={`hover:bg-[#F4F1EC] ${isEven ? 'bg-[#FAF8F5]' : 'bg-white'}`}>
                      <td className="py-2.5 px-3 font-mono text-slate-900 whitespace-nowrap">{r.date}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 block">{student?.fullName || r.studentId}</span>
                        <span className="text-[11px] font-mono text-slate-500">{r.studentId}</span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-mono font-semibold text-slate-900">{r.courseCode}</span>
                        <span className="text-slate-500 text-[11px] block">{course?.title}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {r.topic || 'General Lecture Session'}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {renderBadge(r.status)}
                      </td>
                      {canEdit && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm('Delete this attendance entry?')) {
                                onDeleteAttendance(r.attendanceId);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Attendance Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-md shadow-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <h3 className="text-sm font-bold text-slate-900">Log Daily Attendance</h3>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student</label>
                <select
                  value={logForm.studentId}
                  onChange={(e) => setLogForm({ ...logForm, studentId: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                >
                  {students.map(s => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentId} - {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Offering</label>
                <select
                  value={logForm.courseCode}
                  onChange={(e) => setLogForm({ ...logForm, courseCode: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                >
                  {courses.map(c => (
                    <option key={c.courseCode} value={c.courseCode}>
                      {c.courseCode} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Session Date</label>
                  <input
                    type="date"
                    value={logForm.date}
                    onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={logForm.status}
                    onChange={(e) => setLogForm({ ...logForm, status: e.target.value as AttendanceStatus })}
                    className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                  >
                    <option value="Present">Present (100%)</option>
                    <option value="Late">Late (70%)</option>
                    <option value="Absent">Absent (0%)</option>
                    <option value="Excused">Excused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lecture Topic / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Graph Algorithms Dijkstra Implementation"
                  value={logForm.topic}
                  onChange={(e) => setLogForm({ ...logForm, topic: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E293B] hover:bg-slate-800 rounded-md"
                >
                  Commit Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
