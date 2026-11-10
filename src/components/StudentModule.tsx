import React, { useState, useMemo } from 'react';
import { 
  Student, StudentStatus, StudentAcademicSummary, AppUser 
} from '../types';
import { 
  UserPlus, Download, ArrowUpDown, Eye, Edit3, Trash2, 
  FileText, Check, AlertCircle, X, Phone, Mail, Calendar, 
  MapPin, ShieldAlert
} from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';
import { validateStudentForm } from '../utils/validation';

interface StudentModuleProps {
  summaries: StudentAcademicSummary[];
  searchQuery: string;
  currentUser: AppUser;
  onAddStudent: (s: Student) => { success: boolean; error?: string };
  onUpdateStudent: (s: Student) => { success: boolean; error?: string };
  onDeleteStudent: (id: string) => void;
  onOpenTranscript: (studentId: string) => void;
}

export const StudentModule: React.FC<StudentModuleProps> = ({
  summaries,
  searchQuery,
  currentUser,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onOpenTranscript
}) => {
  // Filter States
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [gpaTierFilter, setGpaTierFilter] = useState<string>('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<'studentId' | 'fullName' | 'cgpa' | 'attendanceRate'>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Drawer & Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'ADD' | 'EDIT' | 'VIEW'>('ADD');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form State
  const initialFormState: Student = {
    studentId: '',
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    department: 'Computer Science',
    batch: '2024',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    initialGpa: 3.50,
    address: '',
    emergencyContact: '',
    notes: ''
  };
  const [formData, setFormData] = useState<Student>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const canEdit = currentUser.role === 'ADMIN';

  // Departments & Batches from data
  const departments = useMemo(() => {
    const set = new Set(summaries.map(s => s.student.department));
    return Array.from(set).sort();
  }, [summaries]);

  const batches = useMemo(() => {
    const set = new Set(summaries.map(s => s.student.batch));
    return Array.from(set).sort();
  }, [summaries]);

  // Filtered & Sorted Records
  const filteredSummaries = useMemo(() => {
    return summaries.filter(item => {
      const s = item.student;
      
      // Global Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          s.studentId.toLowerCase().includes(q) ||
          s.fullName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Department
      if (deptFilter !== 'ALL' && s.department !== deptFilter) return false;

      // Batch
      if (batchFilter !== 'ALL' && s.batch !== batchFilter) return false;

      // Status
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;

      // GPA Tier
      if (gpaTierFilter === 'HONORS' && item.cgpa < 3.5) return false;
      if (gpaTierFilter === 'GOOD' && (item.cgpa < 3.0 || item.cgpa >= 3.5)) return false;
      if (gpaTierFilter === 'AVERAGE' && (item.cgpa < 2.0 || item.cgpa >= 3.0)) return false;
      if (gpaTierFilter === 'PROBATION' && (item.cgpa >= 2.0 && item.cgpa > 0)) return false;

      // Attendance Level
      if (attendanceFilter === 'WARNING' && item.attendanceRate >= 75) return false;
      if (attendanceFilter === 'GOOD' && item.attendanceRate < 75) return false;

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'studentId') {
        comparison = a.student.studentId.localeCompare(b.student.studentId);
      } else if (sortField === 'fullName') {
        comparison = a.student.fullName.localeCompare(b.student.fullName);
      } else if (sortField === 'cgpa') {
        comparison = a.cgpa - b.cgpa;
      } else if (sortField === 'attendanceRate') {
        comparison = a.attendanceRate - b.attendanceRate;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [summaries, searchQuery, deptFilter, batchFilter, statusFilter, gpaTierFilter, attendanceFilter, sortField, sortDirection]);

  // Handle Sort Toggle
  const handleSort = (field: 'studentId' | 'fullName' | 'cgpa' | 'attendanceRate') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Open Drawer in ADD mode
  const handleOpenAdd = () => {
    const nextNumber = summaries.length + 1;
    const suggestedId = `STU-2024-${String(nextNumber).padStart(3, '0')}`;
    setFormData({
      ...initialFormState,
      studentId: suggestedId
    });
    setFormErrors({});
    setServerError(null);
    setDrawerMode('ADD');
    setIsDrawerOpen(true);
  };

  // Open Drawer in EDIT mode
  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({ ...student });
    setFormErrors({});
    setServerError(null);
    setDrawerMode('EDIT');
    setIsDrawerOpen(true);
  };

  // Open Drawer in VIEW mode
  const handleOpenView = (student: Student) => {
    setSelectedStudent(student);
    setDrawerMode('VIEW');
    setIsDrawerOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validation = validateStudentForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    if (drawerMode === 'ADD') {
      const res = onAddStudent(formData);
      if (!res.success) {
        setServerError(res.error || 'Failed to register student record.');
        return;
      }
    } else if (drawerMode === 'EDIT') {
      const res = onUpdateStudent(formData);
      if (!res.success) {
        setServerError(res.error || 'Failed to update student record.');
        return;
      }
    }

    setIsDrawerOpen(false);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const exportData = filteredSummaries.map(item => ({
      StudentID: item.student.studentId,
      FullName: item.student.fullName,
      Email: item.student.email,
      Phone: item.student.phone,
      Department: item.student.department,
      Batch: item.student.batch,
      DOB: item.student.dob,
      EnrollmentDate: item.student.enrollmentDate,
      CGPA: item.cgpa.toFixed(2),
      CompletedCredits: item.completedCredits,
      AttendanceRate: `${item.attendanceRate}%`,
      FeeStatus: item.feeStatus,
      FeeBalance: item.feeBalance,
      Status: item.student.status
    }));

    exportToCsv('students_roster', exportData);
  };

  // Helper for Status Badge styling
  const renderStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">
            Active
          </span>
        );
      case 'Probation':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            Probation
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-[#FFE4E6] text-[#9F1239] border border-[#FECDD3]">
            Suspended
          </span>
        );
      case 'Graduated':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Graduated
          </span>
        );
    }
  };

  return (
    <div>
      {/* Action Header & Multi-Field Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-3 border-b border-[#F1EFEA]">
          <div>
            <h2 className="text-base font-semibold text-[#1E293B]">Student Directory & Enrollment Records</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredSummaries.length} of {summaries.length} registered students
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
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E293B] rounded-md hover:bg-slate-800 transition-colors shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Student</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Department */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full text-xs bg-[#FAF8F5] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-hidden focus:border-[#2563EB]"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Cohort Batch</label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full text-xs bg-[#FAF8F5] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-hidden focus:border-[#2563EB]"
            >
              <option value="ALL">All Batches</option>
              {batches.map(b => (
                <option key={b} value={b}>Batch {b}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-[#FAF8F5] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-hidden focus:border-[#2563EB]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="Suspended">Suspended</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>

          {/* GPA Tier */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">GPA Tier</label>
            <select
              value={gpaTierFilter}
              onChange={(e) => setGpaTierFilter(e.target.value)}
              className="w-full text-xs bg-[#FAF8F5] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-hidden focus:border-[#2563EB]"
            >
              <option value="ALL">All GPA Levels</option>
              <option value="HONORS">Dean's Honors (≥ 3.50)</option>
              <option value="GOOD">Good Standing (3.00 - 3.49)</option>
              <option value="AVERAGE">Average (2.00 - 2.99)</option>
              <option value="PROBATION">Probation Alert (&lt; 2.00)</option>
            </select>
          </div>

          {/* Attendance Level */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Attendance Level</label>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="w-full text-xs bg-[#FAF8F5] border border-[#E2E8F0] rounded-md px-2.5 py-1.5 text-slate-700 focus:bg-white focus:outline-hidden focus:border-[#2563EB]"
            >
              <option value="ALL">All Attendance</option>
              <option value="GOOD">Regular (&ge; 75%)</option>
              <option value="WARNING">Shortage Alert (&lt; 75%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E2E8F0] text-slate-600 font-semibold select-none">
                <th 
                  onClick={() => handleSort('studentId')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1 font-mono">
                    <span>Student ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('fullName')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Full Name & Contact</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Department & Batch</th>
                <th 
                  onClick={() => handleSort('cgpa')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>CGPA</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('attendanceRate')}
                  className="py-3 px-3.5 cursor-pointer hover:text-slate-900 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Attendance</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center">Fee Status</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFEA]">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <p className="text-sm font-medium text-slate-600">No student records match the active criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your search query or department filters.</p>
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((item, idx) => {
                  const s = item.student;
                  const isLowAttendance = item.attendanceRate < 75;
                  const isEven = idx % 2 === 1;

                  return (
                    <tr 
                      key={s.studentId}
                      className={`transition-colors hover:bg-[#F4F1EC] ${isEven ? 'bg-[#FAF8F5]' : 'bg-white'}`}
                    >
                      {/* ID */}
                      <td className="py-2.5 px-3.5 font-mono text-slate-900 font-medium whitespace-nowrap">
                        {s.studentId}
                      </td>

                      {/* Name & Contact */}
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-slate-900">{s.fullName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{s.email}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="font-mono">{s.phone}</span>
                        </div>
                      </td>

                      {/* Dept & Batch */}
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <div className="text-slate-800">{s.department}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Class of {s.batch}</div>
                      </td>

                      {/* CGPA */}
                      <td className="py-2.5 px-3.5 text-right font-mono tabular-nums whitespace-nowrap">
                        <span className={`font-semibold ${item.cgpa >= 3.5 ? 'text-emerald-700' : item.cgpa < 2.0 && item.cgpa > 0 ? 'text-[#9F1239]' : 'text-slate-900'}`}>
                          {item.cgpa.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {item.completedCredits} credits
                        </span>
                      </td>

                      {/* Attendance */}
                      <td className="py-2.5 px-3.5 text-center font-mono tabular-nums whitespace-nowrap">
                        <span className={`inline-block px-1.5 py-0.5 rounded-xs font-semibold ${
                          isLowAttendance ? 'bg-[#FFE4E6] text-[#9F1239]' : 'text-slate-800'
                        }`}>
                          {item.attendanceRate}%
                        </span>
                        {isLowAttendance && (
                          <span className="block text-[9px] text-[#9F1239] font-sans font-medium">Shortage</span>
                        )}
                      </td>

                      {/* Fee Status */}
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        {item.feeStatus === 'Paid' ? (
                          <span className="text-[11px] font-medium text-[#065F46]">Settled</span>
                        ) : item.feeStatus === 'Partial' ? (
                          <span className="text-[11px] font-medium text-[#92400E]">
                            Partial (${item.feeBalance.toFixed(0)})
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-[#9F1239]">
                            Due (${item.feeBalance.toFixed(0)})
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                        {renderStatusBadge(s.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenView(s)}
                            title="View student profile"
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenTranscript(s.studentId)}
                            title="Generate Official Academic Transcript"
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xs transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(s)}
                                title="Edit record"
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xs transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${s.fullName} (${s.studentId})? All relational enrollments, grades, and fee records will be removed.`)) {
                                    onDeleteStudent(s.studentId);
                                  }
                                }}
                                title="Delete record"
                                className="p-1 text-slate-400 hover:text-[#9F1239] hover:bg-rose-50 rounded-xs transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-Panel Drawer for Add / Edit / View */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-[#E2E8F0] shadow-xl flex flex-col">
              
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FAF8F5]">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {drawerMode === 'ADD' ? 'Register New Student' : drawerMode === 'EDIT' ? 'Edit Student Record' : 'Student Academic Profile'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {drawerMode === 'VIEW' ? selectedStudent?.studentId : 'Spring / Fall Term Roster'}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-4">
                {serverError && (
                  <div className="mb-4 p-3 bg-[#FFE4E6] border border-[#FECDD3] rounded-md text-xs text-[#9F1239] flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                {drawerMode === 'VIEW' && selectedStudent ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-[#FAF8F5] border border-[#E2E8F0] rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-semibold text-sm text-slate-900">{selectedStudent.studentId}</span>
                        {renderStatusBadge(selectedStudent.status)}
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{selectedStudent.fullName}</h4>
                      <p className="text-slate-600 mt-0.5">{selectedStudent.department} · Batch {selectedStudent.batch}</p>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2 text-slate-700">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 text-[10px] block">Email Address</span>
                          <span className="font-medium">{selectedStudent.email}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-slate-700">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 text-[10px] block">Telephone</span>
                          <span className="font-medium font-mono">{selectedStudent.phone}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 text-[10px] block">Date of Birth & Enrollment Date</span>
                          <span className="font-medium font-mono">{selectedStudent.dob} (Enrolled: {selectedStudent.enrollmentDate})</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-slate-700">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 text-[10px] block">Residential Address</span>
                          <span>{selectedStudent.address || 'Campus Residence Not Provided'}</span>
                        </div>
                      </div>

                      {selectedStudent.emergencyContact && (
                        <div className="pt-2 border-t border-[#E2E8F0]">
                          <span className="text-slate-400 text-[10px] block">Emergency Contact</span>
                          <span className="font-medium text-slate-800">{selectedStudent.emergencyContact}</span>
                        </div>
                      )}

                      {selectedStudent.notes && (
                        <div className="pt-2 border-t border-[#E2E8F0]">
                          <span className="text-slate-400 text-[10px] block">Advisor / Faculty Notes</span>
                          <p className="text-slate-600 mt-0.5 italic">{selectedStudent.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#E2E8F0]">
                      <button
                        onClick={() => {
                          setIsDrawerOpen(false);
                          onOpenTranscript(selectedStudent.studentId);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-[#1E293B] rounded-md hover:bg-slate-800 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Academic Transcript</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                    {/* Student ID */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Student ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        disabled={drawerMode === 'EDIT'}
                        placeholder="STU-2024-001"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        className={`w-full px-2.5 py-1.5 font-mono text-xs border rounded-md focus:outline-hidden ${
                          drawerMode === 'EDIT' ? 'bg-slate-100 text-slate-500' : 'bg-white text-slate-900'
                        } ${formErrors.studentId ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2E8F0] focus:border-[#2563EB]'}`}
                      />
                      {formErrors.studentId && (
                        <p className="text-[10px] text-[#9F1239] mt-0.5">{formErrors.studentId}</p>
                      )}
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. John A. Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={`w-full px-2.5 py-1.5 text-xs border rounded-md focus:outline-hidden ${
                          formErrors.fullName ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2E8F0] focus:border-[#2563EB]'
                        }`}
                      />
                      {formErrors.fullName && (
                        <p className="text-[10px] text-[#9F1239] mt-0.5">{formErrors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="name@university.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-2.5 py-1.5 text-xs border rounded-md focus:outline-hidden ${
                          formErrors.email ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2E8F0] focus:border-[#2563EB]'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-[10px] text-[#9F1239] mt-0.5">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full px-2.5 py-1.5 font-mono text-xs border rounded-md focus:outline-hidden ${
                          formErrors.phone ? 'border-rose-400 focus:border-rose-500' : 'border-[#E2E8F0] focus:border-[#2563EB]'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-[10px] text-[#9F1239] mt-0.5">{formErrors.phone}</p>
                      )}
                    </div>

                    {/* Department & Batch */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Department</label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB]"
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Mathematics & Data">Mathematics & Data</option>
                          <option value="Business Administration">Business Administration</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Batch / Cohort</label>
                        <input
                          type="text"
                          placeholder="2024"
                          value={formData.batch}
                          onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                          className="w-full px-2.5 py-1.5 font-mono text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB]"
                        />
                      </div>
                    </div>

                    {/* DOB & Enrollment Date */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB]"
                        />
                        {formErrors.dob && (
                          <p className="text-[10px] text-[#9F1239] mt-0.5">{formErrors.dob}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Enrollment Date</label>
                        <input
                          type="date"
                          value={formData.enrollmentDate}
                          onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB]"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Enrollment Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                        className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB]"
                      >
                        <option value="Active">Active</option>
                        <option value="Probation">Probation</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Graduated">Graduated</option>
                      </select>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Residential Address</label>
                      <input
                        type="text"
                        placeholder="Street, City, Postal Code"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB]"
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Emergency Contact</label>
                      <input
                        type="text"
                        placeholder="Contact Name & Number"
                        value={formData.emergencyContact || ''}
                        onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB]"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Faculty & Advisor Remarks</label>
                      <textarea
                        rows={2}
                        placeholder="Optional administrative notes..."
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB]"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E293B] hover:bg-slate-800 rounded-md transition-colors"
                      >
                        {drawerMode === 'ADD' ? 'Save Student Record' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
