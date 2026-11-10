/**
 * Domain Models for Student Management System
 * Mirrors Java Enterprise Entity definitions (JPA / Hibernate Entity POJOs)
 */

export type StudentStatus = 'Active' | 'Probation' | 'Suspended' | 'Graduated';

export interface Student {
  studentId: string; // Primary Key (e.g. STU-2024-001)
  fullName: string;
  email: string;
  phone: string;
  dob: string; // YYYY-MM-DD
  department: string; // e.g. Computer Science
  batch: string; // e.g. 2024
  enrollmentDate: string; // YYYY-MM-DD
  status: StudentStatus;
  initialGpa?: number; // Initial / Prior Academic Standing GPA (0.00 - 4.00)
  address?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface Course {
  courseCode: string; // Primary Key (e.g. CS-201)
  title: string;
  credits: number; // 1 to 4
  department: string;
  faculty: string;
  capacity: number; // Seat cap
  enrolledCount: number;
  semester: string; // e.g. Fall 2024
  syllabusSummary?: string;
}

export type EnrollmentStatus = 'Enrolled' | 'Completed' | 'Dropped';

export interface Enrollment {
  enrollmentId: string;
  studentId: string;
  courseCode: string;
  semester: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
}

export interface Grade {
  gradeId: string;
  studentId: string;
  courseCode: string;
  semester: string;
  assignmentScore: number; // 0 - 100
  examScore: number; // 0 - 100
  totalScore: number; // weighted or average 0 - 100
  letterGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F';
  gradePoints: number; // 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.0, 0.0
  gradedDate: string;
  remarks?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface AttendanceRecord {
  attendanceId: string;
  studentId: string;
  courseCode: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  topic?: string;
}

export type FeeStatus = 'Paid' | 'Partial' | 'Overdue';

export interface FeeLedgerEntry {
  ledgerId: string;
  studentId: string;
  semester: string;
  academicYear: string;
  totalFees: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  status: FeeStatus;
  lastPaymentDate?: string;
}

export interface FeeReceipt {
  receiptId: string;
  ledgerId: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Cheque' | 'Scholarship Voucher';
  transactionRef: string;
  issuedAt: string;
  receivedBy: string;
  notes?: string;
}

export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface AppUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  studentId?: string; // Set when role is STUDENT
  department?: string;
}

export type AcademicEventType = 'EXAM' | 'ENROLLMENT' | 'HOLIDAY' | 'MILESTONE';

export interface AcademicEvent {
  eventId: string;
  title: string;
  eventType: AcademicEventType;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  description: string;
  location?: string;
  targetCohort?: string;
  isMandatory: boolean;
}

export interface StudentAcademicSummary {
  student: Student;
  enrolledCoursesCount: number;
  completedCredits: number;
  totalEarnedPoints: number;
  cgpa: number;
  attendanceRate: number; // 0 to 100
  feeStatus: FeeStatus;
  feeBalance: number;
}
