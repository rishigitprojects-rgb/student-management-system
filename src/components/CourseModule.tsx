import React, { useState } from 'react';
import { Course, Enrollment, Student, AppUser } from '../types';
import { BookOpen, UserPlus, Users, AlertCircle, Plus, Check, X, ShieldAlert } from 'lucide-react';

interface CourseModuleProps {
  courses: Course[];
  enrollments: Enrollment[];
  students: Student[];
  currentUser: AppUser;
  onEnrollStudent: (studentId: string, courseCode: string) => { success: boolean; error?: string };
  onDropEnrollment: (enrollmentId: string) => void;
  onAddCourse: (c: Course) => { success: boolean; error?: string };
}

export const CourseModule: React.FC<CourseModuleProps> = ({
  courses,
  enrollments,
  students,
  currentUser,
  onEnrollStudent,
  onDropEnrollment,
  onAddCourse
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] || null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  
  // Student selection for assignment
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // New Course Form State
  const [newCourse, setNewCourse] = useState<Course>({
    courseCode: '',
    title: '',
    credits: 3,
    department: 'Computer Science',
    faculty: '',
    capacity: 30,
    enrolledCount: 0,
    semester: 'Fall 2024',
    syllabusSummary: ''
  });
  const [courseError, setCourseError] = useState<string | null>(null);

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY';

  // Enrollments for the currently selected course
  const activeCourseEnrollments = enrollments.filter(
    e => selectedCourse && e.courseCode === selectedCourse.courseCode && e.status === 'Enrolled'
  );

  const enrolledStudentIds = new Set(activeCourseEnrollments.map(e => e.studentId));
  const availableStudents = students.filter(s => !enrolledStudentIds.has(s.studentId) && s.status === 'Active');

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError(null);
    setAssignSuccess(null);

    if (!selectedCourse) return;
    if (!selectedStudentId) {
      setAssignError('Please select a student to enroll.');
      return;
    }

    const res = onEnrollStudent(selectedStudentId, selectedCourse.courseCode);
    if (!res.success) {
      setAssignError(res.error || 'Enrollment failed.');
    } else {
      setAssignSuccess(`Successfully enrolled student into ${selectedCourse.courseCode}.`);
      setSelectedStudentId('');
      setTimeout(() => {
        setIsAssignModalOpen(false);
        setAssignSuccess(null);
      }, 1000);
    }
  };

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCourseError(null);

    if (!newCourse.courseCode.trim() || !newCourse.title.trim() || !newCourse.faculty.trim()) {
      setCourseError('Please provide course code, title, and assigned faculty instructor.');
      return;
    }

    const res = onAddCourse(newCourse);
    if (!res.success) {
      setCourseError(res.error || 'Failed to add course.');
    } else {
      setIsAddCourseModalOpen(false);
      setNewCourse({
        courseCode: '',
        title: '',
        credits: 3,
        department: 'Computer Science',
        faculty: '',
        capacity: 30,
        enrolledCount: 0,
        semester: 'Fall 2024',
        syllabusSummary: ''
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Controls */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#1E293B]">Course Catalog & Enrollment Engine</h2>
          <p className="text-xs text-slate-500">
            Real-time seat cap validation and semester credit tracking
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddCourseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E293B] rounded-md hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Course Offering</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Course Catalog Grid / Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Offered Courses ({courses.length})
          </h3>

          <div className="space-y-2">
            {courses.map(c => {
              const isSelected = selectedCourse?.courseCode === c.courseCode;
              const seatsLeft = c.capacity - c.enrolledCount;
              const isFull = seatsLeft <= 0;
              const isNearCap = seatsLeft <= 5 && !isFull;

              return (
                <div
                  key={c.courseCode}
                  onClick={() => setSelectedCourse(c)}
                  className={`p-3 rounded-md border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-[#1E293B] ring-1 ring-[#1E293B]'
                      : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#1E293B]">{c.courseCode}</span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                      {c.credits} Credits
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{c.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{c.faculty} · {c.department}</p>

                  {/* Seat Cap Meter */}
                  <div className="mt-2.5 pt-2 border-t border-[#F1EFEA]">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-500">Seat Capacity:</span>
                      <span className={`font-semibold ${isFull ? 'text-[#9F1239]' : isNearCap ? 'text-[#92400E]' : 'text-slate-700'}`}>
                        {c.enrolledCount} / {c.capacity} enrolled ({isFull ? 'FULL' : `${seatsLeft} available`})
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isFull ? 'bg-[#9F1239]' : isNearCap ? 'bg-[#D97706]' : 'bg-[#1E293B]'
                        }`}
                        style={{ width: `${Math.min(100, (c.enrolledCount / c.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Course Details & Enrolled Students (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCourse ? (
            <div className="bg-white border border-[#E2E8F0] rounded-md p-4 space-y-4">
              {/* Course Detail Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{selectedCourse.courseCode}</span>
                    <span className="text-xs text-slate-500">({selectedCourse.semester})</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedCourse.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Instructor: <span className="font-medium text-slate-800">{selectedCourse.faculty}</span> ({selectedCourse.department})
                  </p>
                </div>

                {canManage && (
                  <button
                    onClick={() => {
                      setSelectedStudentId('');
                      setAssignError(null);
                      setAssignSuccess(null);
                      setIsAssignModalOpen(true);
                    }}
                    disabled={selectedCourse.enrolledCount >= selectedCourse.capacity}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E293B] hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-md transition-colors whitespace-nowrap"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign Student</span>
                  </button>
                )}
              </div>

              {/* Syllabus Summary */}
              {selectedCourse.syllabusSummary && (
                <div className="p-3 bg-[#FAF8F5] border border-[#E2E8F0] rounded-md text-xs">
                  <span className="font-semibold text-slate-700 block mb-0.5">Curriculum Overview</span>
                  <p className="text-slate-600 leading-relaxed">{selectedCourse.syllabusSummary}</p>
                </div>
              )}

              {/* Enrolled Students Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Enrolled Roster ({activeCourseEnrollments.length})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Cap: {selectedCourse.capacity} Max
                  </span>
                </div>

                <div className="border border-[#E2E8F0] rounded-md overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#E2E8F0] text-slate-600 font-semibold">
                        <th className="py-2.5 px-3 font-mono">Student ID</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Enrollment Date</th>
                        {canManage && <th className="py-2.5 px-3 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1EFEA]">
                      {activeCourseEnrollments.length === 0 ? (
                        <tr>
                          <td colSpan={canManage ? 4 : 3} className="py-6 text-center text-slate-500">
                            No students currently enrolled in this course.
                          </td>
                        </tr>
                      ) : (
                        activeCourseEnrollments.map((enr, idx) => {
                          const student = students.find(s => s.studentId === enr.studentId);
                          const isEven = idx % 2 === 1;

                          return (
                            <tr key={enr.enrollmentId} className={`hover:bg-[#F4F1EC] ${isEven ? 'bg-[#FAF8F5]' : 'bg-white'}`}>
                              <td className="py-2 px-3 font-mono text-slate-900 font-medium">
                                {enr.studentId}
                              </td>
                              <td className="py-2 px-3 font-medium text-slate-800">
                                {student?.fullName || 'Unknown Student'}
                              </td>
                              <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                                {enr.enrollmentDate}
                              </td>
                              {canManage && (
                                <td className="py-2 px-3 text-right">
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove ${student?.fullName} from ${selectedCourse.courseCode}?`)) {
                                        onDropEnrollment(enr.enrollmentId);
                                      }
                                    }}
                                    className="text-[11px] text-rose-600 hover:text-rose-800 font-medium"
                                  >
                                    Withdraw
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
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-md p-8 text-center text-slate-500">
              Select a course from the catalog to view details and roster.
            </div>
          )}
        </div>
      </div>

      {/* Assign Student Modal */}
      {isAssignModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-md shadow-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assign Student to Course</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedCourse.courseCode} · {selectedCourse.title}</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {assignError && (
              <div className="mb-3 p-2.5 bg-[#FFE4E6] border border-[#FECDD3] text-xs text-[#9F1239] rounded-md flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            {assignSuccess && (
              <div className="mb-3 p-2.5 bg-[#D1FAE5] border border-[#A7F3D0] text-xs text-[#065F46] rounded-md flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{assignSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Select Eligible Student</label>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {selectedCourse.capacity - selectedCourse.enrolledCount} seats left
                  </span>
                </div>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-[#E2E8F0] rounded-md focus:border-[#2563EB]"
                >
                  <option value="">-- Choose active student --</option>
                  {availableStudents.map(s => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentId} - {s.fullName} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-[#FAF8F5] border border-[#E2E8F0] rounded-md space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Course Credits:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedCourse.credits} credit hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Term:</span>
                  <span className="font-mono text-slate-800">{selectedCourse.semester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Seat Cap Validation:</span>
                  <span className="text-emerald-700 font-medium">Real-time concurrency guard active</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E293B] hover:bg-slate-800 rounded-md"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-md shadow-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <h3 className="text-sm font-bold text-slate-900">Add New Course Offering</h3>
              <button
                onClick={() => setIsAddCourseModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {courseError && (
              <div className="mb-3 p-2.5 bg-[#FFE4E6] border border-[#FECDD3] text-xs text-[#9F1239] rounded-md">
                {courseError}
              </div>
            )}

            <form onSubmit={handleAddCourseSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS-405"
                    value={newCourse.courseCode}
                    onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value.toUpperCase() })}
                    className="w-full px-2.5 py-1.5 font-mono border border-[#E2E8F0] rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credits (1–4)</label>
                  <select
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                  >
                    <option value={1}>1 Credit</option>
                    <option value={2}>2 Credits</option>
                    <option value={3}>3 Credits</option>
                    <option value={4}>4 Credits</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems & Kernel Design"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newCourse.department}
                    onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mathematics & Data">Mathematics & Data</option>
                    <option value="Business Administration">Business Administration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={newCourse.capacity}
                    onChange={(e) => setNewCourse({ ...newCourse, capacity: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 font-mono border border-[#E2E8F0] rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Faculty Instructor</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alan Turing"
                  value={newCourse.faculty}
                  onChange={(e) => setNewCourse({ ...newCourse, faculty: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Syllabus Summary</label>
                <textarea
                  rows={2}
                  placeholder="Course core learning objectives..."
                  value={newCourse.syllabusSummary || ''}
                  onChange={(e) => setNewCourse({ ...newCourse, syllabusSummary: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E293B] hover:bg-slate-800 rounded-md"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
