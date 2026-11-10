/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Download } from 'lucide-react';
import { DatabaseService } from './db/storage';
import { 
  Student, Course, Enrollment, Grade, AttendanceRecord, FeeLedgerEntry, 
  FeeReceipt, AppUser, StudentAcademicSummary, AcademicEvent 
} from './types';
import { Header } from './components/Header';
import { QuickStats } from './components/QuickStats';
import { StudentModule } from './components/StudentModule';
import { CourseModule } from './components/CourseModule';
import { GradeModule } from './components/GradeModule';
import { AttendanceModule } from './components/AttendanceModule';
import { FeeLedgerModule } from './components/FeeLedgerModule';
import { CalendarModule } from './components/CalendarModule';
import { TranscriptModal } from './components/TranscriptModal';
import { ReceiptModal } from './components/ReceiptModal';
import { JavaArchitectureModal } from './components/JavaArchitectureModal';
import { SqlConsoleModal } from './components/SqlConsoleModal';
import { StudentPortalView } from './components/StudentPortalView';
import { downloadProjectZip } from './utils/projectDownloader';

export default function App() {
  const db = DatabaseService.getInstance();

  // App Navigation & Search
  const [activeTab, setActiveTab] = useState<string>('students');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Domain Entity State
  const [currentUser, setCurrentUser] = useState<AppUser>(db.getCurrentUser());
  const [allUsers, setAllUsers] = useState<AppUser[]>(db.getUsers());
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [feeLedgers, setFeeLedgers] = useState<FeeLedgerEntry[]>([]);
  const [receipts, setReceipts] = useState<FeeReceipt[]>([]);
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>([]);
  const [summaries, setSummaries] = useState<StudentAcademicSummary[]>([]);

  // Modals
  const [transcriptStudentId, setTranscriptStudentId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<FeeReceipt | null>(null);
  const [isSqlConsoleOpen, setIsSqlConsoleOpen] = useState<boolean>(false);
  const [isJavaArchOpen, setIsJavaArchOpen] = useState<boolean>(false);

  // Sync state from DatabaseService
  const refreshData = useCallback(() => {
    setStudents(db.getAllStudents());
    setCourses(db.getAllCourses());
    setEnrollments(db.getAllEnrollments());
    setGrades(db.getAllGrades());
    setAttendance(db.getAllAttendance());
    setFeeLedgers(db.getAllFeeLedger());
    setReceipts(db.getAllReceipts());
    setAcademicEvents(db.getAllAcademicEvents());
    setSummaries(db.getAllStudentSummaries());
    setAllUsers(db.getUsers());
  }, [db]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handler Actions
  const handleAddStudent = (student: Student) => {
    const res = db.addStudent(student);
    if (res.success) refreshData();
    return res;
  };

  const handleUpdateStudent = (student: Student) => {
    const res = db.updateStudent(student);
    if (res.success) refreshData();
    return res;
  };

  const handleDeleteStudent = (studentId: string) => {
    db.deleteStudent(studentId);
    refreshData();
  };

  const handleEnrollStudent = (studentId: string, courseCode: string) => {
    const res = db.enrollStudentInCourse(studentId, courseCode);
    if (res.success) refreshData();
    return res;
  };

  const handleDropEnrollment = (enrollmentId: string) => {
    db.dropEnrollment(enrollmentId);
    refreshData();
  };

  const handleAddCourse = (course: Course) => {
    const res = db.addCourse(course);
    if (res.success) refreshData();
    return res;
  };

  const handleSaveGrade = (grade: Omit<Grade, 'gradeId' | 'totalScore' | 'letterGrade' | 'gradePoints'> & { gradeId?: string }) => {
    db.saveGrade(grade);
    refreshData();
  };

  const handleLogAttendance = (rec: Omit<AttendanceRecord, 'attendanceId'>) => {
    db.logAttendance(rec);
    refreshData();
  };

  const handleDeleteAttendance = (attendanceId: string) => {
    db.deleteAttendance(attendanceId);
    refreshData();
  };

  const handleRecordPayment = (params: {
    studentId: string;
    amount: number;
    paymentMethod: FeeReceipt['paymentMethod'];
    transactionRef: string;
    notes?: string;
  }) => {
    const res = db.recordPayment(params);
    if (res.success) refreshData();
    return res;
  };

  const handleAddEvent = (event: AcademicEvent) => {
    const res = db.addAcademicEvent(event);
    if (res.success) refreshData();
    return res;
  };

  const handleDeleteEvent = (eventId: string) => {
    db.deleteAcademicEvent(eventId);
    refreshData();
  };

  const handleResetDb = () => {
    if (confirm('Reset entire system to default academic seed records? All changes will be reinitialized.')) {
      db.resetToDefaults();
      refreshData();
    }
  };

  const handleUserSwitch = (user: AppUser) => {
    db.setCurrentUser(user);
    setCurrentUser(user);
  };

  // Student portal active target
  const activeStudentProfile = currentUser.studentId
    ? students.find(s => s.studentId === currentUser.studentId) || students[0]
    : null;

  // Selected student for transcript modal
  const transcriptStudent = transcriptStudentId ? students.find(s => s.studentId === transcriptStudentId) : null;
  const transcriptGrades = transcriptStudentId ? grades.filter(g => g.studentId === transcriptStudentId) : [];
  const transcriptAttendance = transcriptStudentId ? attendance.filter(a => a.studentId === transcriptStudentId) : [];

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-slate-800 flex flex-col font-sans">
      {/* Top Navigation & Controls */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onUserSwitch={handleUserSwitch}
        allUsers={allUsers}
        onOpenSqlConsole={() => setIsSqlConsoleOpen(true)}
        onOpenJavaArch={() => setIsJavaArchOpen(true)}
        onResetDb={handleResetDb}
      />

      {/* Main Viewport Container (Baseline 1440px desktop structure) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* If user switched to Student perspective and is on students profile tab */}
        {currentUser.role === 'STUDENT' && activeStudentProfile && activeTab === 'students' ? (
          <StudentPortalView
            currentUser={currentUser}
            student={activeStudentProfile}
            enrollments={enrollments.filter(e => e.studentId === activeStudentProfile.studentId && e.status === 'Enrolled')}
            courses={courses}
            grades={grades.filter(g => g.studentId === activeStudentProfile.studentId)}
            attendance={attendance.filter(a => a.studentId === activeStudentProfile.studentId)}
            feeLedger={feeLedgers.find(f => f.studentId === activeStudentProfile.studentId)}
            receipts={receipts.filter(r => r.studentId === activeStudentProfile.studentId)}
            cgpa={db.calculateStudentCGPA(activeStudentProfile.studentId).cgpa}
            totalCredits={db.calculateStudentCGPA(activeStudentProfile.studentId).totalCredits}
            attendanceRate={db.calculateStudentAttendanceRate(activeStudentProfile.studentId).rate}
            onOpenTranscript={(id) => setTranscriptStudentId(id)}
            onViewReceipt={(rcpt) => setSelectedReceipt(rcpt)}
          />
        ) : (
          <>
            {/* Quick Stats Metric Cards Row */}
            <QuickStats
              summaries={summaries}
              courses={courses}
              feeLedgers={feeLedgers}
            />

            {/* Active Feature Module */}
            {activeTab === 'students' && (
              <StudentModule
                summaries={summaries}
                searchQuery={searchQuery}
                currentUser={currentUser}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onOpenTranscript={(id) => setTranscriptStudentId(id)}
              />
            )}

            {activeTab === 'courses' && (
              <CourseModule
                courses={courses}
                enrollments={enrollments}
                students={students}
                currentUser={currentUser}
                onEnrollStudent={handleEnrollStudent}
                onDropEnrollment={handleDropEnrollment}
                onAddCourse={handleAddCourse}
              />
            )}

            {activeTab === 'grades' && (
              <GradeModule
                grades={grades}
                students={students}
                courses={courses}
                currentUser={currentUser}
                onSaveGrade={handleSaveGrade}
                onOpenTranscript={(id) => setTranscriptStudentId(id)}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceModule
                attendanceRecords={attendance}
                students={students}
                courses={courses}
                currentUser={currentUser}
                onLogAttendance={handleLogAttendance}
                onDeleteAttendance={handleDeleteAttendance}
                calculateStudentRate={(studentId, courseCode) => db.calculateStudentAttendanceRate(studentId, courseCode)}
              />
            )}

            {activeTab === 'fees' && (
              <FeeLedgerModule
                feeLedgers={feeLedgers}
                receipts={receipts}
                students={students}
                currentUser={currentUser}
                onRecordPayment={handleRecordPayment}
                onViewReceipt={(rcpt) => setSelectedReceipt(rcpt)}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarModule
                events={academicEvents}
                currentUser={currentUser}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            )}
          </>
        )}
      </main>

      {/* Official Academic Transcript Modal */}
      {transcriptStudent && (
        <TranscriptModal
          student={transcriptStudent}
          grades={transcriptGrades}
          courses={courses}
          attendance={transcriptAttendance}
          onClose={() => setTranscriptStudentId(null)}
        />
      )}

      {/* Official Payment Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          ledger={feeLedgers.find(f => f.studentId === selectedReceipt.studentId)}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* Java Enterprise Architecture & Source Code Hub Modal */}
      {isJavaArchOpen && (
        <JavaArchitectureModal onClose={() => setIsJavaArchOpen(false)} />
      )}

      {/* Virtual H2 / SQLite SQL Console Modal */}
      {isSqlConsoleOpen && (
        <SqlConsoleModal dbService={db} onClose={() => setIsSqlConsoleOpen(false)} />
      )}

      {/* Fixed Corner Team Badge */}
      <aside 
        aria-label="Development Team"
        className="no-print fixed bottom-3 right-3 z-40 bg-white/95 backdrop-blur-xs border border-[#CBD5E1] rounded-md px-3 py-1.5 shadow-sm text-xs text-slate-700 flex items-center gap-2 hover:border-slate-400 transition-colors"
      >
        <div className="flex items-center gap-1.5 font-semibold text-[#1E293B]">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Team:</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
          <span>Rishi Aravindh</span>
          <span className="text-slate-300">·</span>
          <span>Sakthi Vignesh</span>
          <span className="text-slate-300">·</span>
          <span>Rohith</span>
        </div>
      </aside>

      {/* Quiet Footer */}
      <footer className="no-print mt-auto border-t border-[#E2E8F0] py-4 bg-[#F9F8F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs text-slate-500">
          <div>
            <span>Student Management System</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Principal Java Architecture & Relational H2 Engine</span>
          </div>

          <div className="text-[11px] text-slate-600 font-medium">
            <span>Development Team: </span>
            <span className="font-semibold text-slate-800">Rishi Aravindh</span>
            <span className="mx-1 text-slate-300">·</span>
            <span className="font-semibold text-slate-800">Sakthi Vignesh</span>
            <span className="mx-1 text-slate-300">·</span>
            <span className="font-semibold text-slate-800">Rohith</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
                try {
                  await downloadProjectZip();
                } catch (e) {
                  console.error(e);
                  window.location.href = '/student-management-system.zip';
                }
              }}
              className="hover:text-slate-900 text-slate-700 transition-colors font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-700" />
              <span>Download VS Code (.zip)</span>
            </button>
            <button
              onClick={() => setIsJavaArchOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              JPA & Spring Specification
            </button>
            <button
              onClick={() => setIsSqlConsoleOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              H2 Console
            </button>
            <span>v2.4.0-RELEASE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
