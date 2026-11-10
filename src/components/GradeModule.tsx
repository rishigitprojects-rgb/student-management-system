import React, { useState } from 'react';
import { Grade, Student, Course, AppUser } from '../types';
import { Plus, Download, FileText, ArrowUpDown, Award, Check, X } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

interface GradeModuleProps {
  grades: Grade[];
  students: Student[];
  courses: Course[];
  currentUser: AppUser;
  onSaveGrade: (grade: Omit<Grade, 'gradeId' | 'totalScore' | 'letterGrade' | 'gradePoints'> & { gradeId?: string }) => void;
  onOpenTranscript: (studentId: string) => void;
}

export const GradeModule: React.FC<GradeModuleProps> = ({
  grades,
  students,
  courses,
  currentUser,
  onSaveGrade,
  onOpenTranscript
}) => {
  const [courseFilter, setCourseFilter] = useState<string>('ALL');
  const [studentFilter, setStudentFilter] = useState<string>('ALL');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  // Form State for Grade Entry
  const [entryForm, setEntryForm] = useState({
    studentId: '',
    courseCode: '',
    semester: 'Fall 2024',
    assignmentScore: 85,
    examScore: 85,
    remarks: ''
  });

  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY';

  // Preview Calculations
  const previewTotal = Number(((entryForm.assignmentScore * 0.4) + (entryForm.examScore * 0.6)).toFixed(1));
  const getPreviewGrade = (score: number) => {
    if (score >= 95) return { letter: 'A+', points: 4.0 };
    if (score >= 90) return { letter: 'A', points: 4.0 };
    if (score >= 85) return { letter: 'A-', points: 3.7 };
    if (score >= 80) return { letter: 'B+', points: 3.3 };
    if (score >= 75) return { letter: 'B', points: 3.0 };
    if (score >= 70) return { letter: 'B-', points: 2.7 };
    if (score >= 65) return { letter: 'C+', points: 2.3 };
    if (score >= 60) return { letter: 'C', points: 2.0 };
    if (score >= 50) return { letter: 'D', points: 1.0 };
    return { letter: 'F', points: 0.0 };
  };
  const previewDetails = getPreviewGrade(previewTotal);

  const filteredGrades = grades.filter(g => {
    if (courseFilter !== 'ALL' && g.courseCode !== courseFilter) return false;
    if (studentFilter !== 'ALL' && g.studentId !== studentFilter) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryForm.studentId || !entryForm.courseCode) {
      alert('Please select both a student and a course.');
      return;
    }

    onSaveGrade({
      studentId: entryForm.studentId,
      courseCode: entryForm.courseCode,
      semester: entryForm.semester,
      assignmentScore: Number(entryForm.assignmentScore),
      examScore: Number(entryForm.examScore),
      gradedDate: new Date().toISOString().split('T')[0],
      remarks: entryForm.remarks
    });

    setIsEntryModalOpen(false);
  };

  const handleExportCsv = () => {
    const exportData = filteredGrades.map(g => {
      const student = students.find(s => s.studentId === g.studentId);
      const course = courses.find(c => c.courseCode === g.courseCode);
      return {
        GradeID: g.gradeId,
        StudentID: g.studentId,
        StudentName: student?.fullName || '',
        CourseCode: g.courseCode,
        CourseTitle: course?.title || '',
        Credits: course?.credits || 3,
        Semester: g.semester,
        AssignmentScore: g.assignmentScore,
        ExamScore: g.examScore,
        TotalScore: g.totalScore,
        LetterGrade: g.letterGrade,
        GradePoints: g.gradePoints,
        GradedDate: g.gradedDate,
        Remarks: g.remarks || ''
      };
    });

    exportToCsv('academic_grades_ledger', exportData);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#1E293B]">Academic Grade & GPA Calculation Engine</h2>
          <p className="text-xs text-slate-500">
            Formula: Σ(Grade Points × Credits) ÷ Σ(Total Credits) · Standard 4.00 Scale
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
              onClick={() => {
                setEntryForm({
                  studentId: students[0]?.studentId || '',
                  courseCode: courses[0]?.courseCode || '',
                  semester: 'Fall 2024',
                  assignmentScore: 85,
                  examScore: 85,
                  remarks: ''
                });
                setIsEntryModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E293B] rounded-md hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Semester Score</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 flex flex-wrap items-center gap-3">
        <div className="w-48">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Filter by Course</label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full text-xs bg-[#FAF8F5] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-slate-700"
          >
            <option value="ALL">All Courses ({courses.length})</option>
            {courses.map(c => (
              <option key={c.courseCode} value={c.courseCode}>
                {c.courseCode} - {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="w-56">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Filter by Student</label>
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="w-full text-xs bg-[#FAF8F5] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-slate-700"
          >
            <option value="ALL">All Students ({students.length})</option>
            {students.map(s => (
              <option key={s.studentId} value={s.studentId}>
                {s.studentId} - {s.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-500 pt-3">
          Showing <span className="font-mono font-semibold text-slate-800">{filteredGrades.length}</span> grade entries
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E2E8F0] text-slate-600 font-semibold">
                <th className="py-2.5 px-3 font-mono">Grade ID</th>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Course & Credits</th>
                <th className="py-2.5 px-3 text-center">Term</th>
                <th className="py-2.5 px-3 text-right">Assignments (40%)</th>
                <th className="py-2.5 px-3 text-right">Exam (60%)</th>
                <th className="py-2.5 px-3 text-right">Total Score</th>
                <th className="py-2.5 px-3 text-center">Letter Grade</th>
                <th className="py-2.5 px-3 text-right">Grade Points</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFEA]">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No grade entries found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g, idx) => {
                  const student = students.find(s => s.studentId === g.studentId);
                  const course = courses.find(c => c.courseCode === g.courseCode);
                  const isEven = idx % 2 === 1;

                  return (
                    <tr key={g.gradeId} className={`hover:bg-[#F4F1EC] ${isEven ? 'bg-[#FAF8F5]' : 'bg-white'}`}>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{g.gradeId}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900 block">{student?.fullName || g.studentId}</span>
                        <span className="text-[11px] font-mono text-slate-500">{g.studentId}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-medium text-slate-900">{g.courseCode}</span>
                        <span className="text-slate-500 text-[11px] block">{course?.title} ({course?.credits || 3} cr)</span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-600">
                        {g.semester}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {g.assignmentScore}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {g.examScore}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {g.totalScore}%
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-xs font-mono font-bold text-xs ${
                          g.gradePoints >= 3.7
                            ? 'bg-[#D1FAE5] text-[#065F46]'
                            : g.gradePoints >= 3.0
                            ? 'bg-slate-100 text-slate-800'
                            : g.gradePoints >= 2.0
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-[#FFE4E6] text-[#9F1239]'
                        }`}>
                          {g.letterGrade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {g.gradePoints.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onOpenTranscript(g.studentId)}
                          title="Generate Official Academic Transcript"
                          className="inline-flex items-center gap-1 text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Transcript</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade Entry Modal */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-md shadow-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Record Semester Grade</h3>
                <p className="text-xs text-slate-500">Calculates weighted GPA & grade points automatically</p>
              </div>
              <button onClick={() => setIsEntryModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student</label>
                <select
                  value={entryForm.studentId}
                  onChange={(e) => setEntryForm({ ...entryForm, studentId: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                >
                  {students.map(s => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentId} - {s.fullName} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Offering</label>
                <select
                  value={entryForm.courseCode}
                  onChange={(e) => setEntryForm({ ...entryForm, courseCode: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                >
                  {courses.map(c => (
                    <option key={c.courseCode} value={c.courseCode}>
                      {c.courseCode} - {c.title} ({c.credits} Credits)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assignments (40%) [0-100]
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={entryForm.assignmentScore}
                    onChange={(e) => setEntryForm({ ...entryForm, assignmentScore: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 font-mono border border-[#E2E8F0] rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Examinations (60%) [0-100]
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={entryForm.examScore}
                    onChange={(e) => setEntryForm({ ...entryForm, examScore: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 font-mono border border-[#E2E8F0] rounded-md"
                  />
                </div>
              </div>

              {/* Automatic Calculation Preview */}
              <div className="p-3 bg-[#FAF8F5] border border-[#E2E8F0] rounded-md space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Automated Grade Calculation
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Composite Score:</span>
                  <span className="font-bold text-slate-900">{previewTotal}%</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Letter Grade:</span>
                  <span className="font-bold text-slate-900 px-1.5 py-0.5 bg-white border border-slate-200 rounded-xs">
                    {previewDetails.letter}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">Quality Points:</span>
                  <span className="font-bold text-slate-900">{previewDetails.points.toFixed(2)} pts</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Faculty Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent project paper, solid midterm"
                  value={entryForm.remarks}
                  onChange={(e) => setEntryForm({ ...entryForm, remarks: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E293B] hover:bg-slate-800 rounded-md"
                >
                  Commit Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
