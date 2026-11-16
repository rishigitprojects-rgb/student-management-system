import React, { useState } from 'react';
import { Grade, Student, Course, AppUser } from '../types';
import { 
  Plus, Download, FileText, ArrowUpDown, Award, Check, 
  X, Eye, BookOpen, GraduationCap, CheckCircle2, AlertCircle 
} from 'lucide-react';
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

  // Slide-Over Split-Pane Drawer State
  const [drawerGrade, setDrawerGrade] = useState<Grade | null>(null);

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

  // Drawer calculations
  const drawerStudent = drawerGrade ? students.find(s => s.studentId === drawerGrade.studentId) : null;
  const drawerCourse = drawerGrade ? courses.find(c => c.courseCode === drawerGrade.courseCode) : null;
  const studentAllGrades = drawerGrade ? grades.filter(g => g.studentId === drawerGrade.studentId) : [];

  // Calculate student CGPA for drawer
  const studentTotalPoints = studentAllGrades.reduce((acc, g) => {
    const c = courses.find(crs => crs.courseCode === g.courseCode);
    return acc + (g.gradePoints * (c?.credits || 3));
  }, 0);
  const studentTotalCredits = studentAllGrades.reduce((acc, g) => {
    const c = courses.find(crs => crs.courseCode === g.courseCode);
    return acc + (c?.credits || 3);
  }, 0);
  const studentCgpa = studentTotalCredits > 0 ? (studentTotalPoints / studentTotalCredits).toFixed(2) : '0.00';

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="bento-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-4 h-4 text-slate-500" />
            <h2 className="text-base font-bold text-[#0F172A] font-heading">
              Academic Grade & GPA Calculation Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Formula: Σ(Grade Points × Course Credits) ÷ Σ(Total Credits) · Standard 4.00 Academic Scale
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-[#CBD5E1] rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F172A] rounded-md hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Semester Score</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bento-card p-3.5 flex flex-wrap items-center gap-3">
        <div className="w-52">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-tight mb-1">
            Filter by Course
          </label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full text-xs bg-[#FAF9F6] border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-slate-700 font-medium"
          >
            <option value="ALL">All Courses ({courses.length})</option>
            {courses.map(c => (
              <option key={c.courseCode} value={c.courseCode}>
                {c.courseCode} - {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="w-60">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-tight mb-1">
            Filter by Student
          </label>
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="w-full text-xs bg-[#FAF9F6] border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-slate-700 font-medium"
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
          Showing <span className="font-mono font-bold text-slate-900 tabular-nums">{filteredGrades.length}</span> verified grade records
        </div>
      </div>

      {/* Grades Table with Tabular-Numeric Alignment */}
      <div className="bento-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E2E8F0] text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-3 px-3 font-mono text-left w-24">Grade ID</th>
                <th className="py-3 px-3 text-left">Student Profile</th>
                <th className="py-3 px-3 text-left">Course &amp; Credits</th>
                <th className="py-3 px-3 font-mono text-center w-24">Term</th>
                <th className="py-3 px-3 font-mono text-right w-28">Assignments (40%)</th>
                <th className="py-3 px-3 font-mono text-right w-28">Exam (60%)</th>
                <th className="py-3 px-3 font-mono text-right w-28">Total Score</th>
                <th className="py-3 px-3 font-mono text-center w-20">Letter</th>
                <th className="py-3 px-3 font-mono text-right w-24">Points</th>
                <th className="py-3 px-3 text-right w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFEA]">
              {filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    No grade entries found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g, idx) => {
                  const student = students.find(s => s.studentId === g.studentId);
                  const course = courses.find(c => c.courseCode === g.courseCode);
                  const isEven = idx % 2 === 1;

                  return (
                    <tr 
                      key={g.gradeId} 
                      className={`hover:bg-blue-50/40 transition-colors ${isEven ? 'bg-[#FCFBF9]' : 'bg-white'}`}
                    >
                      {/* Grade ID: left-aligned font-mono */}
                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px] font-medium">
                        {g.gradeId}
                      </td>

                      {/* Student Profile: left-aligned */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => setDrawerGrade(g)}
                          className="text-left font-semibold text-slate-900 hover:text-blue-600 block transition-colors cursor-pointer"
                        >
                          {student?.fullName || g.studentId}
                        </button>
                        <span className="text-[11px] font-mono text-slate-500">{g.studentId}</span>
                      </td>

                      {/* Course & Credits: left-aligned font-mono */}
                      <td className="py-3 px-3">
                        <span className="font-mono font-semibold text-slate-900">{g.courseCode}</span>
                        <span className="text-slate-500 text-[11px] block">
                          {course?.title} ({course?.credits || 3} cr)
                        </span>
                      </td>

                      {/* Term: center-aligned font-mono */}
                      <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-600">
                        {g.semester}
                      </td>

                      {/* Assignments Score: right-aligned font-mono tabular-nums */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                        {g.assignmentScore.toFixed(1)}%
                      </td>

                      {/* Exam Score: right-aligned font-mono tabular-nums */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                        {g.examScore.toFixed(1)}%
                      </td>

                      {/* Total Score: right-aligned font-mono tabular-nums */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {g.totalScore.toFixed(1)}%
                      </td>

                      {/* Letter Grade: center-aligned */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${
                          g.gradePoints >= 3.7
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : g.gradePoints >= 3.0
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : g.gradePoints >= 2.0
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {g.letterGrade}
                        </span>
                      </td>

                      {/* Grade Points: right-aligned font-mono tabular-nums */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {g.gradePoints.toFixed(2)}
                      </td>

                      {/* Actions: right-aligned */}
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => setDrawerGrade(g)}
                          title="Inspect grade weighting & transcript in slide-over drawer"
                          className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-semibold cursor-pointer transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Audit</span>
                        </button>

                        <button
                          onClick={() => onOpenTranscript(g.studentId)}
                          title="Generate Official Academic Transcript"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded font-semibold cursor-pointer transition-colors"
                        >
                          <FileText className="w-3 h-3" />
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

      {/* =========================================================================
          SLIDE-OVER SPLIT-PANE DRAWER: Grade Composition & Student Transcript Audit
         ========================================================================= */}
      {drawerGrade && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setDrawerGrade(null)} />

          <aside 
            className="w-full max-w-xl bg-white border-l border-[#E2E8F0] shadow-2xl h-full flex flex-col justify-between overflow-y-auto animate-slide-in-right z-10"
            aria-label="Grade Audit & Transcript Breakdown"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E2E8F0] bg-[#FAF9F6] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    {drawerGrade.courseCode}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Evaluation ID: {drawerGrade.gradeId}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">
                  {drawerStudent?.fullName || drawerGrade.studentId}
                </h3>
                <span className="text-xs text-slate-500 block">
                  {drawerCourse?.title} ({drawerCourse?.credits || 3} Credits) · {drawerGrade.semester}
                </span>
              </div>

              <button
                onClick={() => setDrawerGrade(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              
              {/* Overall Grade Banner */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
                    Composite Grade & Points
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-mono text-slate-900">
                      {drawerGrade.letterGrade}
                    </span>
                    <span className="text-base font-bold font-mono tabular-nums text-slate-700">
                      ({drawerGrade.gradePoints.toFixed(2)} / 4.00)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Weighted Score</span>
                  <span className="text-2xl font-bold font-mono text-blue-700">
                    {drawerGrade.totalScore.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Score Component Breakdown (40% / 60%) */}
              <div className="bento-card p-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center justify-between">
                  <span>Score Decomposition & Weights</span>
                  <span className="text-[10px] text-slate-500 font-mono">Graded: {drawerGrade.gradedDate}</span>
                </h4>

                <div className="space-y-3">
                  {/* Assignments 40% */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">Assignments & Laboratory Continuous Assessment (40%)</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900">
                        {drawerGrade.assignmentScore}% → {(drawerGrade.assignmentScore * 0.4).toFixed(1)} pts
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{ width: `${drawerGrade.assignmentScore}%` }} 
                      />
                    </div>
                  </div>

                  {/* Final Exam 60% */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">Comprehensive Semester Examination (60%)</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900">
                        {drawerGrade.examScore}% → {(drawerGrade.examScore * 0.6).toFixed(1)} pts
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all" 
                        style={{ width: `${drawerGrade.examScore}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {drawerGrade.remarks && (
                  <div className="mt-4 pt-3 border-t border-[#F1EFEA] text-xs text-slate-600">
                    <span className="font-semibold text-slate-700 block">Faculty Evaluation Remarks:</span>
                    <p className="italic mt-0.5 text-slate-500">"{drawerGrade.remarks}"</p>
                  </div>
                )}
              </div>

              {/* Student Cumulative Standing & Mini Transcript */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Student Academic Records ({studentAllGrades.length} courses)
                  </h4>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-500">CGPA:</span>
                    <span className="font-bold text-slate-900 px-1.5 py-0.2 bg-slate-100 rounded">
                      {studentCgpa}
                    </span>
                  </div>
                </div>

                <div className="bento-card overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAF9F6] border-b border-[#E2E8F0] text-slate-500 font-mono text-[10px] uppercase">
                        <th className="py-2 px-3">Course</th>
                        <th className="py-2 px-3 text-center">Credits</th>
                        <th className="py-2 px-3 text-right">Score</th>
                        <th className="py-2 px-3 text-center">Letter</th>
                        <th className="py-2 px-3 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1EFEA]">
                      {studentAllGrades.map(sg => {
                        const crs = courses.find(c => c.courseCode === sg.courseCode);
                        const isCurrent = sg.gradeId === drawerGrade.gradeId;

                        return (
                          <tr key={sg.gradeId} className={isCurrent ? 'bg-blue-50/50 font-semibold' : 'hover:bg-slate-50'}>
                            <td className="py-2 px-3 font-mono">{sg.courseCode}</td>
                            <td className="py-2 px-3 text-center font-mono tabular-nums">{crs?.credits || 3}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">{sg.totalScore.toFixed(1)}%</td>
                            <td className="py-2 px-3 text-center font-mono font-bold">{sg.letterGrade}</td>
                            <td className="py-2 px-3 text-right font-mono tabular-nums">{sg.gradePoints.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Drawer Action Footer */}
            <div className="p-5 border-t border-[#E2E8F0] bg-white flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDrawerGrade(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                Close Drawer
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenTranscript(drawerGrade.studentId);
                  setDrawerGrade(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-md transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Full Academic Transcript</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Grade Entry Modal */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-md shadow-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">Record Semester Grade</h3>
                <p className="text-xs text-slate-500">Calculates weighted GPA &amp; grade points automatically</p>
              </div>
              <button onClick={() => setIsEntryModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student</label>
                <select
                  value={entryForm.studentId}
                  onChange={(e) => setEntryForm({ ...entryForm, studentId: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md bg-white font-medium"
                >
                  {students.map(s => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentId} - {s.fullName} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={entryForm.courseCode}
                  onChange={(e) => setEntryForm({ ...entryForm, courseCode: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md bg-white font-medium"
                >
                  {courses.map(c => (
                    <option key={c.courseCode} value={c.courseCode}>
                      {c.courseCode} - {c.title} ({c.credits} cr)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignments (40%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={entryForm.assignmentScore}
                    onChange={(e) => setEntryForm({ ...entryForm, assignmentScore: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 font-mono tabular-nums border border-[#CBD5E1] rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Final Exam (60%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={entryForm.examScore}
                    onChange={(e) => setEntryForm({ ...entryForm, examScore: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 font-mono tabular-nums border border-[#CBD5E1] rounded-md"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Automatic Projection</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-mono font-bold text-slate-800">
                    Weighted: {previewTotal}%
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-700 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
                    Letter: {previewDetails.letter} ({previewDetails.points.toFixed(1)} pts)
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Feedback</label>
                <input
                  type="text"
                  placeholder="e.g. Excellent grasp of relational normal forms"
                  value={entryForm.remarks}
                  onChange={(e) => setEntryForm({ ...entryForm, remarks: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-md"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsEntryModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-md cursor-pointer shadow-xs"
                >
                  Commit Grade Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
