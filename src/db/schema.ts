import { Student, Course, Enrollment, Grade, AttendanceRecord, FeeLedgerEntry, FeeReceipt, AppUser, AcademicEvent } from '../types';

export const INITIAL_STUDENTS: Student[] = [
  {
    studentId: 'STU-2024-001',
    fullName: 'Eleanor Vance',
    email: 'e.vance@university.edu',
    phone: '+1 (555) 234-8901',
    dob: '2004-03-15',
    department: 'Computer Science',
    batch: '2024',
    enrollmentDate: '2024-08-20',
    status: 'Active',
    address: '412 Academic Way, Suite 3B',
    emergencyContact: 'Marcus Vance (+1 555-882-9901)',
    notes: 'Dean\'s Honor Roll candidate. Department representative.'
  },
  {
    studentId: 'STU-2024-002',
    fullName: 'Julian Hayes',
    email: 'j.hayes@university.edu',
    phone: '+1 (555) 345-6712',
    dob: '2003-11-22',
    department: 'Mechanical Engineering',
    batch: '2024',
    enrollmentDate: '2024-08-20',
    status: 'Active',
    address: '89 Foundry Road, Apt 12',
    emergencyContact: 'Claire Hayes (+1 555-492-3310)',
    notes: 'SAE Formula Student lead designer.'
  },
  {
    studentId: 'STU-2023-014',
    fullName: 'Amina Al-Mansoor',
    email: 'a.mansoor@university.edu',
    phone: '+1 (555) 456-7823',
    dob: '2003-07-09',
    department: 'Computer Science',
    batch: '2023',
    enrollmentDate: '2023-08-15',
    status: 'Active',
    address: '704 Oakridge Terrace',
    emergencyContact: 'Tariq Al-Mansoor (+1 555-321-9988)',
    notes: 'Undergraduate research fellow in Distributed Systems.'
  },
  {
    studentId: 'STU-2024-009',
    fullName: 'Devon K. Miller',
    email: 'd.miller@university.edu',
    phone: '+1 (555) 567-8934',
    dob: '2004-05-18',
    department: 'Electrical Engineering',
    batch: '2024',
    enrollmentDate: '2024-08-20',
    status: 'Probation',
    address: '15 Beacon Hill Blvd',
    emergencyContact: 'Robert Miller (+1 555-667-1122)',
    notes: 'Academic counseling review scheduled for mid-term.'
  },
  {
    studentId: 'STU-2023-028',
    fullName: 'Siddharth Rao',
    email: 's.rao@university.edu',
    phone: '+1 (555) 678-9045',
    dob: '2003-09-30',
    department: 'Mathematics & Data',
    batch: '2023',
    enrollmentDate: '2023-08-15',
    status: 'Active',
    address: '22 Campus Common',
    emergencyContact: 'Priya Rao (+1 555-778-9900)',
    notes: 'Peer tutor for Linear Algebra.'
  },
  {
    studentId: 'STU-2025-003',
    fullName: 'Clara Montgomery',
    email: 'c.montgomery@university.edu',
    phone: '+1 (555) 789-0156',
    dob: '2005-01-14',
    department: 'Business Administration',
    batch: '2025',
    enrollmentDate: '2025-01-10',
    status: 'Active',
    address: '108 University Court',
    emergencyContact: 'David Montgomery (+1 555-889-2233)',
    notes: 'Student Government Treasurer.'
  },
  {
    studentId: 'STU-2024-041',
    fullName: 'Mateo Morales',
    email: 'm.morales@university.edu',
    phone: '+1 (555) 890-1267',
    dob: '2004-08-04',
    department: 'Computer Science',
    batch: '2024',
    enrollmentDate: '2024-08-20',
    status: 'Active',
    address: '331 West Pine Ave',
    emergencyContact: 'Elena Morales (+1 555-990-4455)',
    notes: 'Cybersecurity club president.'
  },
  {
    studentId: 'STU-2023-055',
    fullName: 'Fiona Gallagher-Reid',
    email: 'f.reid@university.edu',
    phone: '+1 (555) 901-2378',
    dob: '2003-04-12',
    department: 'Electrical Engineering',
    batch: '2023',
    enrollmentDate: '2023-08-15',
    status: 'Suspended',
    address: '614 Harbor Light St',
    emergencyContact: 'Grace Reid (+1 555-112-3344)',
    notes: 'Administrative leave of absence for semester.'
  },
  {
    studentId: 'STU-2022-005',
    fullName: 'Liam Chen',
    email: 'l.chen@university.edu',
    phone: '+1 (555) 012-3489',
    dob: '2002-12-05',
    department: 'Mathematics & Data',
    batch: '2022',
    enrollmentDate: '2022-08-18',
    status: 'Graduated',
    address: '50 Riverside Walk',
    emergencyContact: 'Wei Chen (+1 555-223-4455)',
    notes: 'Summa Cum Laude honors. Admitted to MS program.'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    courseCode: 'CS-201',
    title: 'Data Structures & Algorithms',
    credits: 4,
    department: 'Computer Science',
    faculty: 'Dr. Arthur Pendelton',
    capacity: 35,
    enrolledCount: 3,
    semester: 'Fall 2024',
    syllabusSummary: 'Algorithmic complexity, trees, heaps, hash maps, graph traversals, and dynamic programming in Java.'
  },
  {
    courseCode: 'CS-304',
    title: 'Database Management Systems',
    credits: 3,
    department: 'Computer Science',
    faculty: 'Prof. Margaret Lin',
    capacity: 30,
    enrolledCount: 3,
    semester: 'Fall 2024',
    syllabusSummary: 'Relational calculus, SQL engine architecture, B-Trees, normalization theory, ACID transactions, and H2/PostgreSQL internals.'
  },
  {
    courseCode: 'ME-210',
    title: 'Thermodynamics & Heat Transfer',
    credits: 4,
    department: 'Mechanical Engineering',
    faculty: 'Dr. Robert Stirling',
    capacity: 25,
    enrolledCount: 1,
    semester: 'Fall 2024',
    syllabusSummary: 'First and second laws, Carnot cycles, heat conduction, convection coefficients, and radiative exchange.'
  },
  {
    courseCode: 'EE-215',
    title: 'Circuits, Signals & Systems',
    credits: 4,
    department: 'Electrical Engineering',
    faculty: 'Prof. Harold Nyquist',
    capacity: 28,
    enrolledCount: 2,
    semester: 'Fall 2024',
    syllabusSummary: 'Fourier and Laplace transforms, linear time-invariant filters, RLC transients, and state-space analysis.'
  },
  {
    courseCode: 'MATH-240',
    title: 'Linear Algebra & Numerical Methods',
    credits: 3,
    department: 'Mathematics & Data',
    faculty: 'Dr. Katherine Gödel',
    capacity: 40,
    enrolledCount: 2,
    semester: 'Fall 2024',
    syllabusSummary: 'Vector spaces, orthogonal projections, QR factorization, spectral theorem, and SVD decomposition.'
  },
  {
    courseCode: 'BA-105',
    title: 'Financial Accounting & Reporting',
    credits: 3,
    department: 'Business Administration',
    faculty: 'Prof. Evelyn Keynes',
    capacity: 35,
    enrolledCount: 1,
    semester: 'Fall 2024',
    syllabusSummary: 'Double-entry mechanics, balance sheet auditing, cash flow statements, and capital budgeting.'
  },
  {
    courseCode: 'CS-480',
    title: 'Software Architecture & Design Patterns',
    credits: 3,
    department: 'Computer Science',
    faculty: 'Dr. Diane Knuth',
    capacity: 25,
    enrolledCount: 2,
    semester: 'Fall 2024',
    syllabusSummary: 'Clean architecture, SOLID principles, Gang of Four patterns, and microservice orchestration.'
  }
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    enrollmentId: 'ENR-1001',
    studentId: 'STU-2024-001',
    courseCode: 'CS-201',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-25',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1002',
    studentId: 'STU-2024-001',
    courseCode: 'CS-304',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-25',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1003',
    studentId: 'STU-2024-001',
    courseCode: 'MATH-240',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-26',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1004',
    studentId: 'STU-2024-002',
    courseCode: 'ME-210',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-25',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1005',
    studentId: 'STU-2023-014',
    courseCode: 'CS-201',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-24',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1006',
    studentId: 'STU-2023-014',
    courseCode: 'CS-304',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-24',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1007',
    studentId: 'STU-2023-014',
    courseCode: 'CS-480',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-24',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1008',
    studentId: 'STU-2024-009',
    courseCode: 'EE-215',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-25',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1009',
    studentId: 'STU-2023-028',
    courseCode: 'MATH-240',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-25',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1010',
    studentId: 'STU-2025-003',
    courseCode: 'BA-105',
    semester: 'Fall 2024',
    enrollmentDate: '2025-01-12',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1011',
    studentId: 'STU-2024-041',
    courseCode: 'CS-201',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-25',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1012',
    studentId: 'STU-2024-041',
    courseCode: 'CS-304',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-25',
    status: 'Enrolled'
  },
  {
    enrollmentId: 'ENR-1013',
    studentId: 'STU-2023-055',
    courseCode: 'EE-215',
    semester: 'Fall 2024',
    enrollmentDate: '2024-08-25',
    status: 'Dropped'
  }
];

export const INITIAL_GRADES: Grade[] = [
  {
    gradeId: 'GRD-5001',
    studentId: 'STU-2024-001',
    courseCode: 'CS-201',
    semester: 'Fall 2024',
    assignmentScore: 94,
    examScore: 92,
    totalScore: 93,
    letterGrade: 'A',
    gradePoints: 4.0,
    gradedDate: '2024-12-15',
    remarks: 'Outstanding recursive tree algorithmic implementation.'
  },
  {
    gradeId: 'GRD-5002',
    studentId: 'STU-2024-001',
    courseCode: 'CS-304',
    semester: 'Fall 2024',
    assignmentScore: 90,
    examScore: 88,
    totalScore: 89,
    letterGrade: 'A-',
    gradePoints: 3.7,
    gradedDate: '2024-12-16',
    remarks: 'Comprehensive BCNF normalization proof.'
  },
  {
    gradeId: 'GRD-5003',
    studentId: 'STU-2024-001',
    courseCode: 'MATH-240',
    semester: 'Fall 2024',
    assignmentScore: 96,
    examScore: 95,
    totalScore: 95.5,
    letterGrade: 'A+',
    gradePoints: 4.0,
    gradedDate: '2024-12-14',
    remarks: 'Flawless SVD decomposition paper.'
  },
  {
    gradeId: 'GRD-5004',
    studentId: 'STU-2024-002',
    courseCode: 'ME-210',
    semester: 'Fall 2024',
    assignmentScore: 84,
    examScore: 82,
    totalScore: 83,
    letterGrade: 'B',
    gradePoints: 3.0,
    gradedDate: '2024-12-18',
    remarks: 'Strong lab thermal analysis.'
  },
  {
    gradeId: 'GRD-5005',
    studentId: 'STU-2023-014',
    courseCode: 'CS-201',
    semester: 'Fall 2024',
    assignmentScore: 98,
    examScore: 97,
    totalScore: 97.5,
    letterGrade: 'A+',
    gradePoints: 4.0,
    gradedDate: '2024-12-15',
    remarks: 'Top score in cohort.'
  },
  {
    gradeId: 'GRD-5006',
    studentId: 'STU-2023-014',
    courseCode: 'CS-304',
    semester: 'Fall 2024',
    assignmentScore: 95,
    examScore: 93,
    totalScore: 94,
    letterGrade: 'A',
    gradePoints: 4.0,
    gradedDate: '2024-12-16',
    remarks: 'Superior database locking benchmark.'
  },
  {
    gradeId: 'GRD-5007',
    studentId: 'STU-2023-014',
    courseCode: 'CS-480',
    semester: 'Fall 2024',
    assignmentScore: 92,
    examScore: 91,
    totalScore: 91.5,
    letterGrade: 'A',
    gradePoints: 4.0,
    gradedDate: '2024-12-17',
    remarks: 'Clean microservice domain model.'
  },
  {
    gradeId: 'GRD-5008',
    studentId: 'STU-2024-009',
    courseCode: 'EE-215',
    semester: 'Fall 2024',
    assignmentScore: 68,
    examScore: 62,
    totalScore: 65,
    letterGrade: 'C',
    gradePoints: 2.0,
    gradedDate: '2024-12-19',
    remarks: 'Needs improvement in Laplace transformation transforms.'
  },
  {
    gradeId: 'GRD-5009',
    studentId: 'STU-2023-028',
    courseCode: 'MATH-240',
    semester: 'Fall 2024',
    assignmentScore: 95,
    examScore: 92,
    totalScore: 93.5,
    letterGrade: 'A',
    gradePoints: 4.0,
    gradedDate: '2024-12-14',
    remarks: 'Commendable rigor in linear proofs.'
  },
  {
    gradeId: 'GRD-5010',
    studentId: 'STU-2025-003',
    courseCode: 'BA-105',
    semester: 'Fall 2024',
    assignmentScore: 88,
    examScore: 86,
    totalScore: 87,
    letterGrade: 'B+',
    gradePoints: 3.3,
    gradedDate: '2024-12-20',
    remarks: 'Clear balance sheet reconciliation.'
  },
  {
    gradeId: 'GRD-5011',
    studentId: 'STU-2024-041',
    courseCode: 'CS-201',
    semester: 'Fall 2024',
    assignmentScore: 85,
    examScore: 83,
    totalScore: 84,
    letterGrade: 'B',
    gradePoints: 3.0,
    gradedDate: '2024-12-15',
    remarks: 'Solid heap and hash table work.'
  },
  {
    gradeId: 'GRD-5012',
    studentId: 'STU-2024-041',
    courseCode: 'CS-304',
    semester: 'Fall 2024',
    assignmentScore: 82,
    examScore: 78,
    totalScore: 80,
    letterGrade: 'B-',
    gradePoints: 2.7,
    gradedDate: '2024-12-16',
    remarks: 'Completed all schema design assignments.'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // STU-2024-001 Eleanor Vance (Consistent high attendance: 95%)
  { attendanceId: 'ATT-001', studentId: 'STU-2024-001', courseCode: 'CS-201', date: '2024-09-09', status: 'Present', topic: 'Course Orientation & Complexity Analysis' },
  { attendanceId: 'ATT-002', studentId: 'STU-2024-001', courseCode: 'CS-201', date: '2024-09-23', status: 'Present', topic: 'Linked Lists & Dynamic Array Amortization' },
  { attendanceId: 'ATT-003', studentId: 'STU-2024-001', courseCode: 'CS-201', date: '2024-10-07', status: 'Present', topic: 'Stacks, Queues & Deques' },
  { attendanceId: 'ATT-004', studentId: 'STU-2024-001', courseCode: 'CS-201', date: '2024-10-21', status: 'Present', topic: 'Binary Search Trees & Treaps' },
  { attendanceId: 'ATT-005', studentId: 'STU-2024-001', courseCode: 'CS-201', date: '2024-11-04', status: 'Present', topic: 'Balanced Binary Search Trees' },
  { attendanceId: 'ATT-006', studentId: 'STU-2024-001', courseCode: 'CS-201', date: '2024-11-06', status: 'Present', topic: 'AVL Tree Rotations' },
  { attendanceId: 'ATT-007', studentId: 'STU-2024-001', courseCode: 'CS-201', date: '2024-11-11', status: 'Present', topic: 'Red-Black Tree Invariants' },
  { attendanceId: 'ATT-008', studentId: 'STU-2024-001', courseCode: 'CS-201', date: '2024-11-13', status: 'Late', topic: 'Heaps & Priority Queues' },
  { attendanceId: 'ATT-009', studentId: 'STU-2024-001', courseCode: 'CS-201', date: '2024-11-18', status: 'Present', topic: 'Dijkstra Shortest Path' },
  { attendanceId: 'ATT-010', studentId: 'STU-2024-001', courseCode: 'CS-201', date: '2024-11-25', status: 'Present', topic: 'Dynamic Programming & Memoization' },
  { attendanceId: 'ATT-011', studentId: 'STU-2024-001', courseCode: 'CS-304', date: '2024-09-10', status: 'Present', topic: 'Database Architecture & ER Modeling' },
  { attendanceId: 'ATT-012', studentId: 'STU-2024-001', courseCode: 'CS-304', date: '2024-10-08', status: 'Present', topic: 'Relational Calculus & SQL Engines' },
  { attendanceId: 'ATT-013', studentId: 'STU-2024-001', courseCode: 'CS-304', date: '2024-11-05', status: 'Present', topic: 'Relational Algebra & Tuple Calculus' },
  { attendanceId: 'ATT-014', studentId: 'STU-2024-001', courseCode: 'CS-304', date: '2024-11-07', status: 'Present', topic: 'Normal Forms (1NF through BCNF)' },
  { attendanceId: 'ATT-015', studentId: 'STU-2024-001', courseCode: 'CS-304', date: '2024-11-12', status: 'Late', topic: 'B+ Tree Indexing Structures' },
  { attendanceId: 'ATT-016', studentId: 'STU-2024-001', courseCode: 'MATH-240', date: '2024-09-16', status: 'Present', topic: 'Matrix Spaces & Gaussian Elimination' },
  { attendanceId: 'ATT-017', studentId: 'STU-2024-001', courseCode: 'MATH-240', date: '2024-10-14', status: 'Present', topic: 'Gram-Schmidt & QR Factorization' },
  { attendanceId: 'ATT-018', studentId: 'STU-2024-001', courseCode: 'MATH-240', date: '2024-11-04', status: 'Present', topic: 'Eigenvalues & Diagonalization' },
  { attendanceId: 'ATT-019', studentId: 'STU-2024-001', courseCode: 'MATH-240', date: '2024-11-08', status: 'Present', topic: 'Singular Value Decomposition' },

  // STU-2024-009 Devon Miller (Declining attendance: Drops below 75% regulatory warning)
  { attendanceId: 'ATT-020', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-09-09', status: 'Present', topic: 'Intro to Circuit Models' },
  { attendanceId: 'ATT-021', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-09-23', status: 'Present', topic: 'Kirchhoff Laws & Nodal Analysis' },
  { attendanceId: 'ATT-022', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-10-07', status: 'Absent', topic: 'Thevenin & Norton Equivalents' },
  { attendanceId: 'ATT-023', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-10-14', status: 'Late', topic: 'Operational Amplifiers' },
  { attendanceId: 'ATT-024', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-10-21', status: 'Absent', topic: 'RLC Transients & Differential Equations' },
  { attendanceId: 'ATT-025', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-11-04', status: 'Absent', topic: 'Fourier Series Harmonics' },
  { attendanceId: 'ATT-026', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-11-06', status: 'Present', topic: 'Continuous-Time Convolution' },
  { attendanceId: 'ATT-027', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-11-11', status: 'Absent', topic: 'Laplace Transform Convergence' },
  { attendanceId: 'ATT-028', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-11-13', status: 'Late', topic: 'Transfer Function Poles & Zeros' },
  { attendanceId: 'ATT-029', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-11-18', status: 'Absent', topic: 'Bode Plots & Stability' },
  { attendanceId: 'ATT-030', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-11-20', status: 'Excused', topic: 'RLC Network Transients' },
  { attendanceId: 'ATT-031', studentId: 'STU-2024-009', courseCode: 'EE-215', date: '2024-11-27', status: 'Absent', topic: 'State-Space Representations' },

  // STU-2024-002 Julian Hayes (Moderate attendance: ~80-85%)
  { attendanceId: 'ATT-040', studentId: 'STU-2024-002', courseCode: 'ME-210', date: '2024-09-10', status: 'Present', topic: 'Thermodynamics Fundamentals' },
  { attendanceId: 'ATT-041', studentId: 'STU-2024-002', courseCode: 'ME-210', date: '2024-09-24', status: 'Present', topic: 'First Law for Closed Systems' },
  { attendanceId: 'ATT-042', studentId: 'STU-2024-002', courseCode: 'ME-210', date: '2024-10-08', status: 'Present', topic: 'Control Volume Energy Analysis' },
  { attendanceId: 'ATT-043', studentId: 'STU-2024-002', courseCode: 'ME-210', date: '2024-10-22', status: 'Absent', topic: 'Second Law & Carnot Heat Engines' },
  { attendanceId: 'ATT-044', studentId: 'STU-2024-002', courseCode: 'ME-210', date: '2024-11-05', status: 'Present', topic: 'Rankine Cycle Efficiency' },
  { attendanceId: 'ATT-045', studentId: 'STU-2024-002', courseCode: 'ME-210', date: '2024-11-07', status: 'Present', topic: 'Brayton Cycle Gas Turbines' },
  { attendanceId: 'ATT-046', studentId: 'STU-2024-002', courseCode: 'ME-210', date: '2024-11-12', status: 'Late', topic: 'Refrigeration Vapor Compression' },
  { attendanceId: 'ATT-047', studentId: 'STU-2024-002', courseCode: 'ME-210', date: '2024-11-14', status: 'Present', topic: 'Conduction Fourier Law' },
  { attendanceId: 'ATT-048', studentId: 'STU-2024-002', courseCode: 'ME-210', date: '2024-11-19', status: 'Present', topic: 'Convective Heat Transfer Nusselt' },
  { attendanceId: 'ATT-049', studentId: 'STU-2024-002', courseCode: 'ME-210', date: '2024-11-21', status: 'Absent', topic: 'Radiation Stefan-Boltzmann' },

  // STU-2023-014 Amina Al-Mansoor (Flawless attendance: 100%)
  { attendanceId: 'ATT-050', studentId: 'STU-2023-014', courseCode: 'CS-201', date: '2024-09-09', status: 'Present', topic: 'Course Orientation & Complexity Analysis' },
  { attendanceId: 'ATT-051', studentId: 'STU-2023-014', courseCode: 'CS-201', date: '2024-09-23', status: 'Present', topic: 'Linked Lists & Dynamic Array Amortization' },
  { attendanceId: 'ATT-052', studentId: 'STU-2023-014', courseCode: 'CS-201', date: '2024-10-07', status: 'Present', topic: 'Stacks, Queues & Deques' },
  { attendanceId: 'ATT-053', studentId: 'STU-2023-014', courseCode: 'CS-201', date: '2024-10-21', status: 'Present', topic: 'Binary Search Trees & Treaps' },
  { attendanceId: 'ATT-054', studentId: 'STU-2023-014', courseCode: 'CS-201', date: '2024-11-04', status: 'Present', topic: 'Balanced Binary Search Trees' },
  { attendanceId: 'ATT-055', studentId: 'STU-2023-014', courseCode: 'CS-201', date: '2024-11-06', status: 'Present', topic: 'AVL Tree Rotations' },
  { attendanceId: 'ATT-056', studentId: 'STU-2023-014', courseCode: 'CS-304', date: '2024-09-10', status: 'Present', topic: 'Database Architecture & ER Modeling' },
  { attendanceId: 'ATT-057', studentId: 'STU-2023-014', courseCode: 'CS-304', date: '2024-10-08', status: 'Present', topic: 'Relational Calculus & SQL Engines' },
  { attendanceId: 'ATT-058', studentId: 'STU-2023-014', courseCode: 'CS-304', date: '2024-11-05', status: 'Present', topic: 'Relational Algebra & Tuple Calculus' },
  { attendanceId: 'ATT-059', studentId: 'STU-2023-014', courseCode: 'CS-304', date: '2024-11-07', status: 'Present', topic: 'Normal Forms (1NF through BCNF)' },
  { attendanceId: 'ATT-060', studentId: 'STU-2023-014', courseCode: 'CS-480', date: '2024-10-18', status: 'Present', topic: 'Domain-Driven Design Tactical Patterns' },
  { attendanceId: 'ATT-061', studentId: 'STU-2023-014', courseCode: 'CS-480', date: '2024-11-08', status: 'Present', topic: 'Clean Architecture Boundaries' },
  { attendanceId: 'ATT-062', studentId: 'STU-2023-014', courseCode: 'CS-480', date: '2024-11-15', status: 'Present', topic: 'Event-Driven CQRS Systems' },

  // STU-2024-041 Mateo Morales (80%)
  { attendanceId: 'ATT-070', studentId: 'STU-2024-041', courseCode: 'CS-201', date: '2024-09-09', status: 'Present', topic: 'Course Orientation & Complexity Analysis' },
  { attendanceId: 'ATT-071', studentId: 'STU-2024-041', courseCode: 'CS-201', date: '2024-09-23', status: 'Late', topic: 'Linked Lists & Dynamic Array Amortization' },
  { attendanceId: 'ATT-072', studentId: 'STU-2024-041', courseCode: 'CS-201', date: '2024-10-07', status: 'Present', topic: 'Stacks, Queues & Deques' },
  { attendanceId: 'ATT-073', studentId: 'STU-2024-041', courseCode: 'CS-201', date: '2024-10-21', status: 'Absent', topic: 'Binary Search Trees & Treaps' },
  { attendanceId: 'ATT-074', studentId: 'STU-2024-041', courseCode: 'CS-201', date: '2024-11-04', status: 'Present', topic: 'Balanced Binary Search Trees' },
  { attendanceId: 'ATT-075', studentId: 'STU-2024-041', courseCode: 'CS-201', date: '2024-11-06', status: 'Present', topic: 'AVL Tree Rotations' }
];

export const INITIAL_FEE_LEDGER: FeeLedgerEntry[] = [
  {
    ledgerId: 'FEE-2024-01',
    studentId: 'STU-2024-001',
    semester: 'Fall 2024',
    academicYear: '2024-2025',
    totalFees: 4850.00,
    paidAmount: 4850.00,
    balanceAmount: 0.00,
    dueDate: '2024-09-15',
    status: 'Paid',
    lastPaymentDate: '2024-09-02'
  },
  {
    ledgerId: 'FEE-2024-02',
    studentId: 'STU-2024-002',
    semester: 'Fall 2024',
    academicYear: '2024-2025',
    totalFees: 4850.00,
    paidAmount: 2425.00,
    balanceAmount: 2425.00,
    dueDate: '2024-10-15',
    status: 'Partial',
    lastPaymentDate: '2024-09-10'
  },
  {
    ledgerId: 'FEE-2024-03',
    studentId: 'STU-2023-014',
    semester: 'Fall 2024',
    academicYear: '2024-2025',
    totalFees: 5200.00,
    paidAmount: 5200.00,
    balanceAmount: 0.00,
    dueDate: '2024-09-15',
    status: 'Paid',
    lastPaymentDate: '2024-08-28'
  },
  {
    ledgerId: 'FEE-2024-04',
    studentId: 'STU-2024-009',
    semester: 'Fall 2024',
    academicYear: '2024-2025',
    totalFees: 4850.00,
    paidAmount: 1000.00,
    balanceAmount: 3850.00,
    dueDate: '2024-10-01',
    status: 'Overdue',
    lastPaymentDate: '2024-09-05'
  },
  {
    ledgerId: 'FEE-2024-05',
    studentId: 'STU-2023-028',
    semester: 'Fall 2024',
    academicYear: '2024-2025',
    totalFees: 4600.00,
    paidAmount: 4600.00,
    balanceAmount: 0.00,
    dueDate: '2024-09-15',
    status: 'Paid',
    lastPaymentDate: '2024-09-01'
  },
  {
    ledgerId: 'FEE-2024-06',
    studentId: 'STU-2025-003',
    semester: 'Spring 2025',
    academicYear: '2024-2025',
    totalFees: 4500.00,
    paidAmount: 2000.00,
    balanceAmount: 2500.00,
    dueDate: '2025-02-15',
    status: 'Partial',
    lastPaymentDate: '2025-01-15'
  },
  {
    ledgerId: 'FEE-2024-07',
    studentId: 'STU-2024-041',
    semester: 'Fall 2024',
    academicYear: '2024-2025',
    totalFees: 4850.00,
    paidAmount: 0.00,
    balanceAmount: 4850.00,
    dueDate: '2024-09-15',
    status: 'Overdue',
    lastPaymentDate: undefined
  },
  {
    ledgerId: 'FEE-2024-08',
    studentId: 'STU-2023-055',
    semester: 'Fall 2024',
    academicYear: '2024-2025',
    totalFees: 2400.00,
    paidAmount: 0.00,
    balanceAmount: 2400.00,
    dueDate: '2024-09-15',
    status: 'Overdue',
    lastPaymentDate: undefined
  }
];

export const INITIAL_RECEIPTS: FeeReceipt[] = [
  {
    receiptId: 'RCPT-2024-8801',
    ledgerId: 'FEE-2024-01',
    studentId: 'STU-2024-001',
    studentName: 'Eleanor Vance',
    amount: 4850.00,
    paymentMethod: 'Bank Transfer',
    transactionRef: 'WIRE-992381-CHASE',
    issuedAt: '2024-09-02 11:24:00',
    receivedBy: 'Office of the Bursar',
    notes: 'Full tuition & laboratory surcharge payment.'
  },
  {
    receiptId: 'RCPT-2024-8802',
    ledgerId: 'FEE-2024-02',
    studentId: 'STU-2024-002',
    studentName: 'Julian Hayes',
    amount: 2425.00,
    paymentMethod: 'Credit Card',
    transactionRef: 'CC-AUTH-771290',
    issuedAt: '2024-09-10 14:15:30',
    receivedBy: 'Office of the Bursar',
    notes: '50% installment term payment.'
  },
  {
    receiptId: 'RCPT-2024-8803',
    ledgerId: 'FEE-2024-03',
    studentId: 'STU-2023-014',
    studentName: 'Amina Al-Mansoor',
    amount: 5200.00,
    paymentMethod: 'Scholarship Voucher',
    transactionRef: 'DEPT-SCHOL-FALL-14',
    issuedAt: '2024-08-28 09:30:12',
    receivedBy: 'Financial Aid Office',
    notes: 'Faculty Merit Research Scholarship disbursement.'
  },
  {
    receiptId: 'RCPT-2024-8804',
    ledgerId: 'FEE-2024-04',
    studentId: 'STU-2024-009',
    studentName: 'Devon K. Miller',
    amount: 1000.00,
    paymentMethod: 'Bank Transfer',
    transactionRef: 'ACH-481920-BOA',
    issuedAt: '2024-09-05 16:42:19',
    receivedBy: 'Office of the Bursar',
    notes: 'Initial deposit.'
  }
];

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'USR-ADMIN-1',
    username: 'admin',
    displayName: 'Dean of Academic Affairs',
    role: 'ADMIN',
    department: 'Office of the Registrar'
  },
  {
    id: 'USR-FAC-1',
    username: 'pendelton',
    displayName: 'Dr. Arthur Pendelton',
    role: 'FACULTY',
    department: 'Computer Science'
  },
  {
    id: 'USR-STU-1',
    username: 'STU-2024-001',
    displayName: 'Eleanor Vance',
    role: 'STUDENT',
    studentId: 'STU-2024-001',
    department: 'Computer Science'
  },
  {
    id: 'USR-STU-2',
    username: 'STU-2024-009',
    displayName: 'Devon K. Miller',
    role: 'STUDENT',
    studentId: 'STU-2024-009',
    department: 'Electrical Engineering'
  }
];

export const INITIAL_ACADEMIC_EVENTS: AcademicEvent[] = [
  // Enrollment & Registration Deadlines
  {
    eventId: 'EVT-001',
    title: 'Fall Course Add/Drop Deadline',
    eventType: 'ENROLLMENT',
    startDate: '2024-09-13',
    description: 'Final date to add or drop semester courses without academic penalty or permanent transcript notation.',
    location: 'Office of the University Registrar (Portal Closes 23:59 EST)',
    targetCohort: 'All Undergraduate & Graduate Students',
    isMandatory: true
  },
  {
    eventId: 'EVT-002',
    title: 'Tuition Fee Settlement Final Due Date',
    eventType: 'ENROLLMENT',
    startDate: '2024-10-15',
    description: 'Bursar deadline for settlement of remaining tuition balances and laboratory fees to avoid late assessment charges.',
    location: 'Office of the Bursar / Cashier Portal',
    targetCohort: 'All Cohorts with Outstanding Ledger',
    isMandatory: true
  },
  {
    eventId: 'EVT-003',
    title: 'Spring 2025 Priority Course Registration Opens',
    eventType: 'ENROLLMENT',
    startDate: '2024-11-18',
    endDate: '2024-11-22',
    description: 'Staggered course seat reservation begins for Senior and Honors cohorts, followed by general student body.',
    location: 'Student Self-Service Enrollment Engine',
    targetCohort: 'Class of 2024 & Class of 2025',
    isMandatory: false
  },
  {
    eventId: 'EVT-004',
    title: 'Pass / Non-Pass & Audit Option Petition Deadline',
    eventType: 'ENROLLMENT',
    startDate: '2024-11-01',
    description: 'Last date for students to petition for Pass/Fail grading status for elective courses.',
    location: 'Academic Advising Center',
    targetCohort: 'Undergraduate Cohorts',
    isMandatory: false
  },

  // Exam Periods
  {
    eventId: 'EVT-010',
    title: 'Midterm Examination Week',
    eventType: 'EXAM',
    startDate: '2024-10-14',
    endDate: '2024-10-25',
    description: 'Departmental midterm examinations conducted according to master examination schedule.',
    location: 'Auditorium Hall, Science Wing, & Engineering Testing Centers',
    targetCohort: 'All Enrolled Students',
    isMandatory: true
  },
  {
    eventId: 'EVT-011',
    title: 'Laboratory Practicals & Capstone Demonstrations',
    eventType: 'EXAM',
    startDate: '2024-12-02',
    endDate: '2024-12-06',
    description: 'Hands-on practical assessments in CS, ME, and EE laboratory facilities.',
    location: 'Engineering Science Laboratories (Rooms 204-210)',
    targetCohort: 'Computer Science & Mechanical Engineering Students',
    isMandatory: true
  },
  {
    eventId: 'EVT-012',
    title: 'Comprehensive Final Semester Examinations',
    eventType: 'EXAM',
    startDate: '2024-12-09',
    endDate: '2024-12-20',
    description: 'Official university final examination session. Disbarred students (<75% attendance) not permitted entry.',
    location: 'Metropolitan Central Gymnasium & Examination Centers A-D',
    targetCohort: 'All Academic Cohorts',
    isMandatory: true
  },

  // Academic Holidays & Recesses
  {
    eventId: 'EVT-020',
    title: 'Labor Day Academic Recess',
    eventType: 'HOLIDAY',
    startDate: '2024-09-02',
    description: 'University holiday. All instructional classes, laboratories, and administrative offices closed.',
    location: 'All Campuses',
    targetCohort: 'Campus-wide',
    isMandatory: false
  },
  {
    eventId: 'EVT-021',
    title: 'Autumn Mid-Semester Fall Recess',
    eventType: 'HOLIDAY',
    startDate: '2024-10-10',
    endDate: '2024-10-11',
    description: 'Two-day instructional pause for student study and faculty research.',
    location: 'All Campuses',
    targetCohort: 'Faculty & Students',
    isMandatory: false
  },
  {
    eventId: 'EVT-022',
    title: 'Thanksgiving Holiday Recess',
    eventType: 'HOLIDAY',
    startDate: '2024-11-27',
    endDate: '2024-11-29',
    description: 'Campus closed for Thanksgiving observance. Dormitories remain open with skeleton staffing.',
    location: 'All Campuses',
    targetCohort: 'Campus-wide',
    isMandatory: false
  },
  {
    eventId: 'EVT-023',
    title: 'Winter Intersession & Campus Holiday Closure',
    eventType: 'HOLIDAY',
    startDate: '2024-12-23',
    endDate: '2025-01-03',
    description: 'Year-end university holiday shutdown. Administrative offices resume operations January 6, 2025.',
    location: 'Metropolitan Main Campus',
    targetCohort: 'Campus-wide',
    isMandatory: false
  },

  // Institutional Milestones
  {
    eventId: 'EVT-030',
    title: 'Convocation Ceremony & Presidential Address',
    eventType: 'MILESTONE',
    startDate: '2024-08-26',
    description: 'Formal academic gathering welcoming matriculating students into the collegiate community.',
    location: 'Grand University Amphitheater',
    targetCohort: 'Incoming Class of 2024 & Faculty Senate',
    isMandatory: false
  },
  {
    eventId: 'EVT-031',
    title: 'Fall Term Commencement & Degree Conferral',
    eventType: 'MILESTONE',
    startDate: '2024-12-21',
    description: 'Official commencement ceremony for graduating undergraduate and master cohorts.',
    location: 'University Sports Arena & Convocation Hall',
    targetCohort: 'Graduating Seniors & Degree Candidates',
    isMandatory: false
  },
  {
    eventId: 'EVT-032',
    title: 'Official Faculty Grade Submission Cutoff',
    eventType: 'MILESTONE',
    startDate: '2024-12-24',
    description: 'Final deadline for faculty members to submit semester grades to the registrar.',
    location: 'Faculty Grading Portal',
    targetCohort: 'Academic Faculty Instructors',
    isMandatory: true
  },
  {
    eventId: 'EVT-033',
    title: 'Spring 2025 Term Instruction Begins',
    eventType: 'MILESTONE',
    startDate: '2025-01-13',
    description: 'First day of instructional lectures for Spring 2025 semester.',
    location: 'All Departmental Lecture Halls',
    targetCohort: 'All Cohorts',
    isMandatory: true
  }
];

export const H2_SQL_DDL = `-- =====================================================================
-- H2 Database Schema for Student Management System
-- Principal Java Enterprise Developer Reference Definition (JPA / Flyway)
-- Dialect: org.hibernate.dialect.H2Dialect
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS sms_core;
SET SCHEMA sms_core;

CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(32) NOT NULL PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    phone VARCHAR(32) NOT NULL,
    dob DATE NOT NULL,
    department VARCHAR(64) NOT NULL,
    batch VARCHAR(16) NOT NULL,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Probation', 'Suspended', 'Graduated')),
    address VARCHAR(255),
    emergency_contact VARCHAR(128),
    notes CLOB
);

CREATE TABLE IF NOT EXISTS courses (
    course_code VARCHAR(16) NOT NULL PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    credits INT NOT NULL CHECK (credits BETWEEN 1 AND 4),
    department VARCHAR(64) NOT NULL,
    faculty VARCHAR(128) NOT NULL,
    capacity INT NOT NULL DEFAULT 30,
    semester VARCHAR(32) NOT NULL,
    syllabus_summary CLOB
);

CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id VARCHAR(32) NOT NULL PRIMARY KEY,
    student_id VARCHAR(32) NOT NULL,
    course_code VARCHAR(16) NOT NULL,
    semester VARCHAR(32) NOT NULL,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Enrolled' CHECK (status IN ('Enrolled', 'Completed', 'Dropped')),
    CONSTRAINT fk_enr_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_enr_course FOREIGN KEY (course_code) REFERENCES courses(course_code) ON DELETE RESTRICT,
    CONSTRAINT uq_student_course UNIQUE (student_id, course_code, semester)
);

CREATE TABLE IF NOT EXISTS grades (
    grade_id VARCHAR(32) NOT NULL PRIMARY KEY,
    student_id VARCHAR(32) NOT NULL,
    course_code VARCHAR(16) NOT NULL,
    semester VARCHAR(32) NOT NULL,
    assignment_score DECIMAL(5, 2) NOT NULL,
    exam_score DECIMAL(5, 2) NOT NULL,
    total_score DECIMAL(5, 2) NOT NULL,
    letter_grade VARCHAR(4) NOT NULL,
    grade_points DECIMAL(3, 2) NOT NULL,
    graded_date DATE NOT NULL,
    remarks VARCHAR(255),
    CONSTRAINT fk_grd_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_grd_course FOREIGN KEY (course_code) REFERENCES courses(course_code) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS attendance (
    attendance_id VARCHAR(32) NOT NULL PRIMARY KEY,
    student_id VARCHAR(32) NOT NULL,
    course_code VARCHAR(16) NOT NULL,
    session_date DATE NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
    topic VARCHAR(128),
    CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_att_course FOREIGN KEY (course_code) REFERENCES courses(course_code) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS fee_ledger (
    ledger_id VARCHAR(32) NOT NULL PRIMARY KEY,
    student_id VARCHAR(32) NOT NULL,
    semester VARCHAR(32) NOT NULL,
    academic_year VARCHAR(16) NOT NULL,
    total_fees DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    balance_amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('Paid', 'Partial', 'Overdue')),
    last_payment_date TIMESTAMP,
    CONSTRAINT fk_fee_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fee_receipts (
    receipt_id VARCHAR(32) NOT NULL PRIMARY KEY,
    ledger_id VARCHAR(32) NOT NULL,
    student_id VARCHAR(32) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(32) NOT NULL,
    transaction_ref VARCHAR(64) NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    received_by VARCHAR(64) NOT NULL,
    notes VARCHAR(255),
    CONSTRAINT fk_rcpt_ledger FOREIGN KEY (ledger_id) REFERENCES fee_ledger(ledger_id) ON DELETE CASCADE
);

CREATE INDEX idx_student_dept ON students(department);
CREATE INDEX idx_student_status ON students(status);
CREATE INDEX idx_enr_student ON enrollments(student_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_att_student_course ON attendance(student_id, course_code);
CREATE INDEX idx_fee_status ON fee_ledger(status);
`;
