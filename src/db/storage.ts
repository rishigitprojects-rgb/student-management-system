import { 
  Student, Course, Enrollment, Grade, AttendanceRecord, FeeLedgerEntry, FeeReceipt, AppUser,
  StudentAcademicSummary, FeeStatus, AcademicEvent
} from '../types';
import { 
  INITIAL_STUDENTS, INITIAL_COURSES, INITIAL_ENROLLMENTS, 
  INITIAL_GRADES, INITIAL_ATTENDANCE, INITIAL_FEE_LEDGER, 
  INITIAL_RECEIPTS, INITIAL_USERS, INITIAL_ACADEMIC_EVENTS, H2_SQL_DDL 
} from './schema';

const STORAGE_KEY_PREFIX = 'sms_java_db_v1_';

export class DatabaseService {
  private static instance: DatabaseService;

  private students: Student[] = [];
  private courses: Course[] = [];
  private enrollments: Enrollment[] = [];
  private grades: Grade[] = [];
  private attendance: AttendanceRecord[] = [];
  private feeLedger: FeeLedgerEntry[] = [];
  private receipts: FeeReceipt[] = [];
  private users: AppUser[] = [];
  private academicEvents: AcademicEvent[] = [];
  private currentUser: AppUser;

  private constructor() {
    this.initDatabase();
    this.currentUser = this.users[0] || {
      id: 'USR-ADMIN-1',
      username: 'admin',
      displayName: 'Dean of Academic Affairs',
      role: 'ADMIN',
      department: 'Office of the Registrar'
    };
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initDatabase(): void {
    try {
      const storedStudents = localStorage.getItem(STORAGE_KEY_PREFIX + 'students');
      if (storedStudents) {
        this.students = JSON.parse(storedStudents);
        this.courses = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'courses') || '[]');
        this.enrollments = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'enrollments') || '[]');
        this.grades = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'grades') || '[]');
        const storedAttendance = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'attendance') || '[]');
        this.attendance = storedAttendance.length >= INITIAL_ATTENDANCE.length 
          ? storedAttendance 
          : JSON.parse(JSON.stringify(INITIAL_ATTENDANCE));
        this.feeLedger = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'feeLedger') || '[]');
        this.receipts = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'receipts') || '[]');
        this.users = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'users') || '[]');
        const storedEvents = JSON.parse(localStorage.getItem(STORAGE_KEY_PREFIX + 'academicEvents') || '[]');
        this.academicEvents = storedEvents.length > 0 ? storedEvents : JSON.parse(JSON.stringify(INITIAL_ACADEMIC_EVENTS));
      } else {
        this.resetToDefaults();
      }
    } catch (e) {
      console.warn('Error reading from localStorage, fallback to default seed dataset:', e);
      this.resetToDefaults();
    }
  }

  public resetToDefaults(): void {
    this.students = JSON.parse(JSON.stringify(INITIAL_STUDENTS));
    this.courses = JSON.parse(JSON.stringify(INITIAL_COURSES));
    this.enrollments = JSON.parse(JSON.stringify(INITIAL_ENROLLMENTS));
    this.grades = JSON.parse(JSON.stringify(INITIAL_GRADES));
    this.attendance = JSON.parse(JSON.stringify(INITIAL_ATTENDANCE));
    this.feeLedger = JSON.parse(JSON.stringify(INITIAL_FEE_LEDGER));
    this.receipts = JSON.parse(JSON.stringify(INITIAL_RECEIPTS));
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.academicEvents = JSON.parse(JSON.stringify(INITIAL_ACADEMIC_EVENTS));
    this.saveAll();
  }

  private saveAll(): void {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'students', JSON.stringify(this.students));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'courses', JSON.stringify(this.courses));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'enrollments', JSON.stringify(this.enrollments));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'grades', JSON.stringify(this.grades));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'attendance', JSON.stringify(this.attendance));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'feeLedger', JSON.stringify(this.feeLedger));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'receipts', JSON.stringify(this.receipts));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'academicEvents', JSON.stringify(this.academicEvents));
    } catch (e) {
      console.error('Failed to commit state to persistent store', e);
    }
  }

  // --- Academic Calendar Operations ---
  public getAllAcademicEvents(): AcademicEvent[] {
    return [...this.academicEvents];
  }

  public addAcademicEvent(event: AcademicEvent): { success: boolean; error?: string } {
    this.academicEvents.push(event);
    this.saveAll();
    return { success: true };
  }

  public deleteAcademicEvent(eventId: string): boolean {
    const prevLen = this.academicEvents.length;
    this.academicEvents = this.academicEvents.filter(e => e.eventId !== eventId);
    if (this.academicEvents.length !== prevLen) {
      this.saveAll();
      return true;
    }
    return false;
  }

  // --- Current User & Session Management ---
  public getCurrentUser(): AppUser {
    return this.currentUser;
  }

  public setCurrentUser(user: AppUser): void {
    this.currentUser = user;
  }

  public getUsers(): AppUser[] {
    return [...this.users];
  }

  // --- Student Domain Operations ---
  public getAllStudents(): Student[] {
    return [...this.students];
  }

  public getStudentById(id: string): Student | undefined {
    return this.students.find(s => s.studentId === id);
  }

  public addStudent(student: Student): { success: boolean; error?: string } {
    // Unique ID guard
    if (this.students.some(s => s.studentId.trim().toUpperCase() === student.studentId.trim().toUpperCase())) {
      return { success: false, error: `Student ID "${student.studentId}" is already assigned to an enrolled record.` };
    }
    // Unique Email guard
    if (this.students.some(s => s.email.trim().toLowerCase() === student.email.trim().toLowerCase())) {
      return { success: false, error: `Email "${student.email}" is already registered in the student directory.` };
    }

    this.students.unshift(student);

    // Automatically initialize default fee ledger for semester
    const newLedger: FeeLedgerEntry = {
      ledgerId: `FEE-${new Date().getFullYear()}-${String(this.feeLedger.length + 1).padStart(2, '0')}`,
      studentId: student.studentId,
      semester: 'Fall 2024',
      academicYear: '2024-2025',
      totalFees: 4850.00,
      paidAmount: 0.00,
      balanceAmount: 4850.00,
      dueDate: '2024-10-15',
      status: 'Overdue'
    };
    this.feeLedger.push(newLedger);

    this.saveAll();
    return { success: true };
  }

  public updateStudent(student: Student): { success: boolean; error?: string } {
    const index = this.students.findIndex(s => s.studentId === student.studentId);
    if (index === -1) {
      return { success: false, error: 'Student record not found.' };
    }
    // Check email clash with other students
    const emailClash = this.students.some(s => s.studentId !== student.studentId && s.email.toLowerCase() === student.email.toLowerCase());
    if (emailClash) {
      return { success: false, error: `Email "${student.email}" is already used by another student.` };
    }

    this.students[index] = { ...student };
    this.saveAll();
    return { success: true };
  }

  public deleteStudent(studentId: string): boolean {
    const prevLen = this.students.length;
    this.students = this.students.filter(s => s.studentId !== studentId);
    if (this.students.length !== prevLen) {
      // Cascade delete relations
      this.enrollments = this.enrollments.filter(e => e.studentId !== studentId);
      this.grades = this.grades.filter(g => g.studentId !== studentId);
      this.attendance = this.attendance.filter(a => a.studentId !== studentId);
      this.feeLedger = this.feeLedger.filter(f => f.studentId !== studentId);
      this.receipts = this.receipts.filter(r => r.studentId !== studentId);
      this.recalculateCourseEnrollmentCounts();
      this.saveAll();
      return true;
    }
    return false;
  }

  // --- Course & Enrollment Operations ---
  public getAllCourses(): Course[] {
    return [...this.courses];
  }

  public getCourseByCode(code: string): Course | undefined {
    return this.courses.find(c => c.courseCode === code);
  }

  public addCourse(course: Course): { success: boolean; error?: string } {
    if (this.courses.some(c => c.courseCode.toUpperCase() === course.courseCode.toUpperCase())) {
      return { success: false, error: `Course code "${course.courseCode}" already exists in the course catalog.` };
    }
    this.courses.push({ ...course, enrolledCount: 0 });
    this.saveAll();
    return { success: true };
  }

  public getAllEnrollments(): Enrollment[] {
    return [...this.enrollments];
  }

  public getStudentEnrollments(studentId: string): Enrollment[] {
    return this.enrollments.filter(e => e.studentId === studentId);
  }

  public enrollStudentInCourse(studentId: string, courseCode: string, semester = 'Fall 2024'): { success: boolean; error?: string } {
    const course = this.getCourseByCode(courseCode);
    if (!course) {
      return { success: false, error: 'Course not found.' };
    }
    const student = this.getStudentById(studentId);
    if (!student) {
      return { success: false, error: 'Student not found.' };
    }

    // Check existing enrollment
    const existing = this.enrollments.find(e => e.studentId === studentId && e.courseCode === courseCode && e.semester === semester && e.status === 'Enrolled');
    if (existing) {
      return { success: false, error: `${student.fullName} is already enrolled in ${courseCode} for ${semester}.` };
    }

    // Check Seat Cap Capacity
    const currentEnrolled = this.enrollments.filter(e => e.courseCode === courseCode && e.semester === semester && e.status === 'Enrolled').length;
    if (currentEnrolled >= course.capacity) {
      return { success: false, error: `Cannot enroll: Course ${courseCode} has reached its maximum seat cap of ${course.capacity} students.` };
    }

    const newEnrollment: Enrollment = {
      enrollmentId: `ENR-${Date.now().toString().slice(-6)}`,
      studentId,
      courseCode,
      semester,
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'Enrolled'
    };

    this.enrollments.push(newEnrollment);
    this.recalculateCourseEnrollmentCounts();
    this.saveAll();
    return { success: true };
  }

  public dropEnrollment(enrollmentId: string): boolean {
    const item = this.enrollments.find(e => e.enrollmentId === enrollmentId);
    if (item) {
      item.status = 'Dropped';
      this.recalculateCourseEnrollmentCounts();
      this.saveAll();
      return true;
    }
    return false;
  }

  private recalculateCourseEnrollmentCounts(): void {
    this.courses.forEach(course => {
      const activeCount = this.enrollments.filter(
        e => e.courseCode === course.courseCode && e.status === 'Enrolled'
      ).length;
      course.enrolledCount = activeCount;
    });
  }

  // --- Grade & GPA Operations ---
  public getAllGrades(): Grade[] {
    return [...this.grades];
  }

  public getGradesForStudent(studentId: string): Grade[] {
    return this.grades.filter(g => g.studentId === studentId);
  }

  public saveGrade(grade: Omit<Grade, 'gradeId' | 'totalScore' | 'letterGrade' | 'gradePoints'> & { gradeId?: string }): { success: boolean; grade: Grade } {
    // Weighted: 40% assignments + 60% exam or average
    const totalScore = Number(((grade.assignmentScore * 0.4) + (grade.examScore * 0.6)).toFixed(1));
    const { letterGrade, gradePoints } = this.calculateLetterGradeAndPoints(totalScore);

    const fullGrade: Grade = {
      gradeId: grade.gradeId || `GRD-${Date.now().toString().slice(-6)}`,
      studentId: grade.studentId,
      courseCode: grade.courseCode,
      semester: grade.semester,
      assignmentScore: grade.assignmentScore,
      examScore: grade.examScore,
      totalScore,
      letterGrade,
      gradePoints,
      gradedDate: grade.gradedDate || new Date().toISOString().split('T')[0],
      remarks: grade.remarks
    };

    const existingIdx = this.grades.findIndex(
      g => (grade.gradeId && g.gradeId === grade.gradeId) || 
           (g.studentId === grade.studentId && g.courseCode === grade.courseCode && g.semester === grade.semester)
    );

    if (existingIdx >= 0) {
      this.grades[existingIdx] = fullGrade;
    } else {
      this.grades.push(fullGrade);
    }

    this.saveAll();
    return { success: true, grade: fullGrade };
  }

  private calculateLetterGradeAndPoints(score: number): { letterGrade: Grade['letterGrade']; gradePoints: number } {
    if (score >= 95) return { letterGrade: 'A+', gradePoints: 4.0 };
    if (score >= 90) return { letterGrade: 'A', gradePoints: 4.0 };
    if (score >= 85) return { letterGrade: 'A-', gradePoints: 3.7 };
    if (score >= 80) return { letterGrade: 'B+', gradePoints: 3.3 };
    if (score >= 75) return { letterGrade: 'B', gradePoints: 3.0 };
    if (score >= 70) return { letterGrade: 'B-', gradePoints: 2.7 };
    if (score >= 65) return { letterGrade: 'C+', gradePoints: 2.3 };
    if (score >= 60) return { letterGrade: 'C', gradePoints: 2.0 };
    if (score >= 50) return { letterGrade: 'D', gradePoints: 1.0 };
    return { letterGrade: 'F', gradePoints: 0.0 };
  }

  /**
   * Credit-Weighted Cumulative GPA calculation:
   * CGPA = Sum(Course Credits * Grade Points) / Sum(Course Credits)
   */
  public calculateStudentCGPA(studentId: string): { cgpa: number; totalCredits: number; earnedPoints: number } {
    const studentGrades = this.getGradesForStudent(studentId);
    const student = this.getStudentById(studentId);

    if (studentGrades.length === 0) {
      if (student?.initialGpa !== undefined && student.initialGpa > 0) {
        return { 
          cgpa: Number(student.initialGpa.toFixed(2)), 
          totalCredits: 0, 
          earnedPoints: Number((student.initialGpa * 12).toFixed(2)) 
        };
      }
      return { cgpa: 0.00, totalCredits: 0, earnedPoints: 0 };
    }

    let totalPoints = 0;
    let totalCredits = 0;

    studentGrades.forEach(g => {
      const course = this.getCourseByCode(g.courseCode);
      const credits = course ? course.credits : 3;
      totalCredits += credits;
      totalPoints += g.gradePoints * credits;
    });

    const cgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : (student?.initialGpa || 0.00);
    return { cgpa, totalCredits, earnedPoints: Number(totalPoints.toFixed(2)) };
  }

  // --- Attendance Operations ---
  public getAllAttendance(): AttendanceRecord[] {
    return [...this.attendance];
  }

  public getAttendanceForStudent(studentId: string): AttendanceRecord[] {
    return this.attendance.filter(a => a.studentId === studentId);
  }

  public logAttendance(record: Omit<AttendanceRecord, 'attendanceId'>): AttendanceRecord {
    const newRecord: AttendanceRecord = {
      ...record,
      attendanceId: `ATT-${Date.now().toString().slice(-6)}`
    };
    this.attendance.push(newRecord);
    this.saveAll();
    return newRecord;
  }

  public deleteAttendance(attendanceId: string): boolean {
    const prev = this.attendance.length;
    this.attendance = this.attendance.filter(a => a.attendanceId !== attendanceId);
    if (this.attendance.length !== prev) {
      this.saveAll();
      return true;
    }
    return false;
  }

  /**
   * Dynamic Attendance Percentage:
   * Present = 1.0 weight, Late = 0.5 weight, Excused = excluded or neutral (1.0), Absent = 0
   * Standard formula: (Present + Late * 0.7) / Total Non-Excused * 100
   */
  public calculateStudentAttendanceRate(studentId: string, courseCode?: string): { rate: number; totalSessions: number; presentCount: number; absentCount: number; lateCount: number; isWarning: boolean } {
    let records = this.getAttendanceForStudent(studentId);
    if (courseCode) {
      records = records.filter(r => r.courseCode === courseCode);
    }

    if (records.length === 0) {
      return { rate: 100, totalSessions: 0, presentCount: 0, absentCount: 0, lateCount: 0, isWarning: false };
    }

    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    records.forEach(r => {
      if (r.status === 'Present') presentCount++;
      else if (r.status === 'Late') lateCount++;
      else if (r.status === 'Absent') absentCount++;
      else if (r.status === 'Excused') excusedCount++;
    });

    const effectiveTotal = records.length - excusedCount;
    if (effectiveTotal <= 0) {
      return { rate: 100, totalSessions: records.length, presentCount, absentCount, lateCount, isWarning: false };
    }

    const weightedScore = presentCount + (lateCount * 0.7);
    const rate = Math.min(100, Math.max(0, Math.round((weightedScore / effectiveTotal) * 100)));
    const isWarning = rate < 75;

    return { rate, totalSessions: records.length, presentCount, absentCount, lateCount, isWarning };
  }

  // --- Fee Ledger & Receipts Operations ---
  public getAllFeeLedger(): FeeLedgerEntry[] {
    return [...this.feeLedger];
  }

  public getFeeLedgerForStudent(studentId: string): FeeLedgerEntry | undefined {
    return this.feeLedger.find(f => f.studentId === studentId);
  }

  public getAllReceipts(): FeeReceipt[] {
    return [...this.receipts];
  }

  public getReceiptsForStudent(studentId: string): FeeReceipt[] {
    return this.receipts.filter(r => r.studentId === studentId);
  }

  public recordPayment(params: {
    studentId: string;
    amount: number;
    paymentMethod: FeeReceipt['paymentMethod'];
    transactionRef: string;
    notes?: string;
  }): { success: boolean; receipt?: FeeReceipt; error?: string } {
    const student = this.getStudentById(params.studentId);
    if (!student) {
      return { success: false, error: 'Student not found.' };
    }

    let ledger = this.getFeeLedgerForStudent(params.studentId);
    if (!ledger) {
      // Create ledger on the fly
      ledger = {
        ledgerId: `FEE-${new Date().getFullYear()}-${String(this.feeLedger.length + 1).padStart(2, '0')}`,
        studentId: params.studentId,
        semester: 'Fall 2024',
        academicYear: '2024-2025',
        totalFees: 4850.00,
        paidAmount: 0.00,
        balanceAmount: 4850.00,
        dueDate: '2024-10-15',
        status: 'Overdue'
      };
      this.feeLedger.push(ledger);
    }

    if (params.amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero.' };
    }

    // Update Ledger
    const newPaid = Number((ledger.paidAmount + params.amount).toFixed(2));
    const newBalance = Math.max(0, Number((ledger.totalFees - newPaid).toFixed(2)));
    
    ledger.paidAmount = newPaid;
    ledger.balanceAmount = newBalance;
    ledger.lastPaymentDate = new Date().toISOString().split('T')[0];

    if (newBalance <= 0) {
      ledger.status = 'Paid';
    } else {
      ledger.status = 'Partial';
    }

    // Create Official Receipt
    const receipt: FeeReceipt = {
      receiptId: `RCPT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      ledgerId: ledger.ledgerId,
      studentId: student.studentId,
      studentName: student.fullName,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      transactionRef: params.transactionRef || `TX-${Date.now().toString().slice(-6)}`,
      issuedAt: new Date().toLocaleString(),
      receivedBy: 'Office of the Bursar',
      notes: params.notes
    };

    this.receipts.unshift(receipt);
    this.saveAll();
    return { success: true, receipt };
  }

  // --- Aggregate Student Summary ---
  public getStudentSummary(studentId: string): StudentAcademicSummary | null {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    const enrollments = this.getStudentEnrollments(studentId).filter(e => e.status === 'Enrolled');
    const { cgpa, totalCredits, earnedPoints } = this.calculateStudentCGPA(studentId);
    const { rate: attendanceRate } = this.calculateStudentAttendanceRate(studentId);
    const fee = this.getFeeLedgerForStudent(studentId);

    return {
      student,
      enrolledCoursesCount: enrollments.length,
      completedCredits: totalCredits,
      totalEarnedPoints: earnedPoints,
      cgpa,
      attendanceRate,
      feeStatus: fee ? fee.status : 'Paid',
      feeBalance: fee ? fee.balanceAmount : 0
    };
  }

  public getAllStudentSummaries(): StudentAcademicSummary[] {
    return this.students.map(s => this.getStudentSummary(s.studentId)!).filter(Boolean);
  }

  // --- Raw SQL Execution Engine for H2/SQLite Explorer ---
  public executeSqlQuery(sql: string): { success: boolean; columns: string[]; rows: any[][]; message?: string; affectedRows?: number } {
    const trimmed = sql.trim();
    if (!trimmed) {
      return { success: false, columns: [], rows: [], message: 'Empty SQL query.' };
    }

    const upper = trimmed.toUpperCase();

    // SELECT queries
    if (upper.startsWith('SELECT')) {
      if (upper.includes('FROM STUDENTS')) {
        const data = this.getAllStudents();
        const columns = ['STUDENT_ID', 'FULL_NAME', 'EMAIL', 'PHONE', 'DEPARTMENT', 'BATCH', 'STATUS'];
        const rows = data.map(s => [s.studentId, s.fullName, s.email, s.phone, s.department, s.batch, s.status]);
        return { success: true, columns, rows, message: `${rows.length} rows returned from STUDENTS.` };
      }
      if (upper.includes('FROM COURSES')) {
        const data = this.getAllCourses();
        const columns = ['COURSE_CODE', 'TITLE', 'CREDITS', 'DEPARTMENT', 'FACULTY', 'CAPACITY', 'ENROLLED_COUNT'];
        const rows = data.map(c => [c.courseCode, c.title, c.credits, c.department, c.faculty, c.capacity, c.enrolledCount]);
        return { success: true, columns, rows, message: `${rows.length} rows returned from COURSES.` };
      }
      if (upper.includes('FROM GRADES')) {
        const data = this.getAllGrades();
        const columns = ['GRADE_ID', 'STUDENT_ID', 'COURSE_CODE', 'TOTAL_SCORE', 'LETTER_GRADE', 'GRADE_POINTS', 'SEMESTER'];
        const rows = data.map(g => [g.gradeId, g.studentId, g.courseCode, g.totalScore, g.letterGrade, g.gradePoints, g.semester]);
        return { success: true, columns, rows, message: `${rows.length} rows returned from GRADES.` };
      }
      if (upper.includes('FROM FEE_LEDGER')) {
        const data = this.getAllFeeLedger();
        const columns = ['LEDGER_ID', 'STUDENT_ID', 'TOTAL_FEES', 'PAID_AMOUNT', 'BALANCE_AMOUNT', 'STATUS', 'DUE_DATE'];
        const rows = data.map(f => [f.ledgerId, f.studentId, `$${f.totalFees}`, `$${f.paidAmount}`, `$${f.balanceAmount}`, f.status, f.dueDate]);
        return { success: true, columns, rows, message: `${rows.length} rows returned from FEE_LEDGER.` };
      }
      if (upper.includes('FROM ATTENDANCE')) {
        const data = this.getAllAttendance();
        const columns = ['ATTENDANCE_ID', 'STUDENT_ID', 'COURSE_CODE', 'SESSION_DATE', 'STATUS', 'TOPIC'];
        const rows = data.map(a => [a.attendanceId, a.studentId, a.courseCode, a.date, a.status, a.topic || '-']);
        return { success: true, columns, rows, message: `${rows.length} rows returned from ATTENDANCE.` };
      }
      if (upper.includes('FROM ENROLLMENTS')) {
        const data = this.getAllEnrollments();
        const columns = ['ENROLLMENT_ID', 'STUDENT_ID', 'COURSE_CODE', 'SEMESTER', 'STATUS'];
        const rows = data.map(e => [e.enrollmentId, e.studentId, e.courseCode, e.semester, e.status]);
        return { success: true, columns, rows, message: `${rows.length} rows returned from ENROLLMENTS.` };
      }
    }

    return {
      success: true,
      columns: ['STATUS', 'RESULT'],
      rows: [['EXECUTED', `H2 Virtual Engine parsed command successfully: ${trimmed.slice(0, 40)}...`]],
      message: 'Statement executed against in-memory H2 schema.'
    };
  }

  // --- Export Full SQL Script with Inserts ---
  public exportH2SqlDump(): string {
    let script = H2_SQL_DDL + '\n\n-- ================= SEED DATA INSERT STATEMENTS =================\n\n';

    this.students.forEach(s => {
      script += `INSERT INTO students (student_id, full_name, email, phone, dob, department, batch, enrollment_date, status, address, emergency_contact, notes) VALUES ('${s.studentId}', '${s.fullName}', '${s.email}', '${s.phone}', '${s.dob}', '${s.department}', '${s.batch}', '${s.enrollmentDate}', '${s.status}', '${s.address || ''}', '${s.emergencyContact || ''}', '${s.notes?.replace(/'/g, "''") || ''}');\n`;
    });

    script += '\n';
    this.courses.forEach(c => {
      script += `INSERT INTO courses (course_code, title, credits, department, faculty, capacity, semester, syllabus_summary) VALUES ('${c.courseCode}', '${c.title}', ${c.credits}, '${c.department}', '${c.faculty}', ${c.capacity}, '${c.semester}', '${c.syllabusSummary?.replace(/'/g, "''") || ''}');\n`;
    });

    script += '\n';
    this.feeLedger.forEach(f => {
      script += `INSERT INTO fee_ledger (ledger_id, student_id, semester, academic_year, total_fees, paid_amount, balance_amount, due_date, status, last_payment_date) VALUES ('${f.ledgerId}', '${f.studentId}', '${f.semester}', '${f.academicYear}', ${f.totalFees}, ${f.paidAmount}, ${f.balanceAmount}', '${f.dueDate}', '${f.status}', ${f.lastPaymentDate ? `'${f.lastPaymentDate}'` : 'NULL'});\n`;
    });

    return script;
  }
}
