import React, { useState, useMemo } from 'react';
import { AttendanceRecord, Student, Course } from '../types';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ReferenceLine 
} from 'recharts';
import { TrendingUp, User, BookOpen, Users, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';

interface AttendanceTrendChartProps {
  attendanceRecords: AttendanceRecord[];
  students: Student[];
  courses: Course[];
  initialStudentId?: string;
  initialCourseCode?: string;
}

type ViewMode = 'STUDENT' | 'COURSE' | 'COMPARE';

export const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({
  attendanceRecords,
  students,
  courses,
  initialStudentId,
  initialCourseCode
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('STUDENT');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (students[0]?.studentId ?? 'STU-2024-001')
  );
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(
    initialCourseCode || (courses[0]?.courseCode ?? 'CS-201')
  );

  const selectedStudent = useMemo(
    () => students.find(s => s.studentId === selectedStudentId),
    [students, selectedStudentId]
  );

  const selectedCourse = useMemo(
    () => courses.find(c => c.courseCode === selectedCourseCode),
    [courses, selectedCourseCode]
  );

  // 1. Data for Single Student Trend
  const studentChartData = useMemo(() => {
    if (!selectedStudentId) return [];

    // Filter student records and sort chronologically
    const studentRecords = attendanceRecords
      .filter(r => r.studentId === selectedStudentId)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (studentRecords.length === 0) return [];

    let runningWeighted = 0;
    let runningNonExcused = 0;

    return studentRecords.map((r) => {
      let sessionWeight = 0;
      let isNonExcused = true;

      if (r.status === 'Present') sessionWeight = 1;
      else if (r.status === 'Late') sessionWeight = 0.7;
      else if (r.status === 'Absent') sessionWeight = 0;
      else if (r.status === 'Excused') isNonExcused = false;

      if (isNonExcused) {
        runningWeighted += sessionWeight;
        runningNonExcused += 1;
      }

      const cumulativeRate = runningNonExcused > 0
        ? Math.min(100, Math.round((runningWeighted / runningNonExcused) * 100))
        : 100;

      const sessionScore = isNonExcused
        ? Math.round(sessionWeight * 100)
        : null;

      // Format date label (e.g., '09/09' or 'Nov 04')
      const dateParts = r.date.split('-');
      const formattedDate = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}` : r.date;

      return {
        date: r.date,
        displayDate: formattedDate,
        courseCode: r.courseCode,
        status: r.status,
        topic: r.topic || 'General Lecture',
        cumulativeRate,
        sessionScore,
        isWarning: cumulativeRate < 75
      };
    });
  }, [attendanceRecords, selectedStudentId]);

  // 2. Data for Single Course Trend
  const courseChartData = useMemo(() => {
    if (!selectedCourseCode) return [];

    const courseRecords = attendanceRecords
      .filter(r => r.courseCode === selectedCourseCode)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (courseRecords.length === 0) return [];

    // Group by unique session date
    const dateMap = new Map<string, AttendanceRecord[]>();
    courseRecords.forEach(r => {
      const list = dateMap.get(r.date) || [];
      list.push(r);
      dateMap.set(r.date, list);
    });

    const dates = Array.from(dateMap.keys()).sort();

    let allTimeWeighted = 0;
    let allTimeNonExcused = 0;

    return dates.map(date => {
      const sessionRecords = dateMap.get(date)!;
      let sessionWeighted = 0;
      let sessionNonExcused = 0;

      sessionRecords.forEach(r => {
        if (r.status === 'Present') {
          sessionWeighted += 1;
          sessionNonExcused += 1;
        } else if (r.status === 'Late') {
          sessionWeighted += 0.7;
          sessionNonExcused += 1;
        } else if (r.status === 'Absent') {
          sessionNonExcused += 1;
        }
      });

      allTimeWeighted += sessionWeighted;
      allTimeNonExcused += sessionNonExcused;

      const sessionRate = sessionNonExcused > 0
        ? Math.round((sessionWeighted / sessionNonExcused) * 100)
        : 100;

      const cumulativeCourseRate = allTimeNonExcused > 0
        ? Math.round((allTimeWeighted / allTimeNonExcused) * 100)
        : 100;

      const primaryTopic = sessionRecords[0]?.topic || 'Lecture Session';
      const dateParts = date.split('-');
      const formattedDate = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}` : date;

      return {
        date,
        displayDate: formattedDate,
        courseCode: selectedCourseCode,
        sessionAttendance: sessionRate,
        cumulativeRate: cumulativeCourseRate,
        attendeesCount: sessionRecords.length,
        topic: primaryTopic,
        isWarning: cumulativeCourseRate < 75
      };
    });
  }, [attendanceRecords, selectedCourseCode]);

  // 3. Data for Cohort Comparison (Overlay multiple students over the timeline)
  const compareChartData = useMemo(() => {
    // Unique sorted dates across the semester
    const allDates = Array.from(new Set(attendanceRecords.map(r => r.date))).sort();
    if (allDates.length === 0) return [];

    // We track top representative students
    const keyStudents = [
      { id: 'STU-2024-001', name: 'Eleanor Vance (CS)' },
      { id: 'STU-2023-014', name: 'Amina Al-Mansoor (CS)' },
      { id: 'STU-2024-002', name: 'Julian Hayes (ME)' },
      { id: 'STU-2024-009', name: 'Devon Miller (EE)' },
      { id: 'STU-2024-041', name: 'Mateo Morales (CS)' },
    ];

    // Build timeline points with cumulative rate up to each date
    return allDates.map(date => {
      const dateParts = date.split('-');
      const displayDate = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}` : date;

      const row: Record<string, any> = {
        date,
        displayDate
      };

      keyStudents.forEach(stu => {
        const studentPastRecords = attendanceRecords
          .filter(r => r.studentId === stu.id && r.date <= date);

        if (studentPastRecords.length > 0) {
          let weighted = 0;
          let nonExcused = 0;
          studentPastRecords.forEach(r => {
            if (r.status === 'Present') { weighted += 1; nonExcused += 1; }
            else if (r.status === 'Late') { weighted += 0.7; nonExcused += 1; }
            else if (r.status === 'Absent') { nonExcused += 1; }
          });
          const rate = nonExcused > 0 ? Math.round((weighted / nonExcused) * 100) : 100;
          row[stu.name] = rate;
        } else {
          row[stu.name] = null;
        }
      });

      return row;
    });
  }, [attendanceRecords]);

  // Summary Metrics for the currently displayed student or course
  const currentSummary = useMemo(() => {
    if (viewMode === 'STUDENT') {
      if (studentChartData.length === 0) return null;
      const initial = studentChartData[0].cumulativeRate;
      const latest = studentChartData[studentChartData.length - 1].cumulativeRate;
      const peak = Math.max(...studentChartData.map(d => d.cumulativeRate));
      const trough = Math.min(...studentChartData.map(d => d.cumulativeRate));
      const isUnderThreshold = latest < 75;
      return {
        initial,
        latest,
        peak,
        trough,
        totalSessions: studentChartData.length,
        isUnderThreshold
      };
    } else if (viewMode === 'COURSE') {
      if (courseChartData.length === 0) return null;
      const initial = courseChartData[0].cumulativeRate;
      const latest = courseChartData[courseChartData.length - 1].cumulativeRate;
      const peak = Math.max(...courseChartData.map(d => d.cumulativeRate));
      const trough = Math.min(...courseChartData.map(d => d.cumulativeRate));
      const isUnderThreshold = latest < 75;
      return {
        initial,
        latest,
        peak,
        trough,
        totalSessions: courseChartData.length,
        isUnderThreshold
      };
    }
    return null;
  }, [viewMode, studentChartData, courseChartData]);

  // Custom Humanized Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white border border-[#CBD5E1] p-3 rounded-md shadow-md text-xs font-sans max-w-xs z-50">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#E2E8F0] font-mono text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">{dataPoint.date}</span>
            {dataPoint.courseCode && (
              <span className="bg-slate-100 px-1.5 py-0.2 rounded-xs font-bold text-slate-800">
                {dataPoint.courseCode}
              </span>
            )}
          </div>

          {viewMode === 'STUDENT' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cumulative Attendance:</span>
                <span className={`font-mono font-bold text-sm ${dataPoint.cumulativeRate < 75 ? 'text-[#9F1239]' : 'text-slate-900'}`}>
                  {dataPoint.cumulativeRate}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Session Status:</span>
                <span className={`font-medium ${
                  dataPoint.status === 'Present' ? 'text-emerald-700' :
                  dataPoint.status === 'Late' ? 'text-amber-700' :
                  dataPoint.status === 'Absent' ? 'text-rose-700' : 'text-slate-600'
                }`}>
                  {dataPoint.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-[#F1EFEA] italic">
                {dataPoint.topic}
              </div>
              {dataPoint.cumulativeRate < 75 && (
                <div className="text-[10px] bg-[#FFE4E6] text-[#9F1239] px-1.5 py-0.5 rounded-xs font-semibold mt-1">
                  ⚠️ Alert: Below 75% Mandatory Attendance
                </div>
              )}
            </div>
          )}

          {viewMode === 'COURSE' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cumulative Course Avg:</span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {dataPoint.cumulativeRate}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Daily Session Turnout:</span>
                <span className="font-mono font-medium text-slate-800">
                  {dataPoint.sessionAttendance}%
                </span>
              </div>
              <div className="text-[11px] text-slate-600 pt-1 border-t border-[#F1EFEA]">
                Topic: <span className="italic">{dataPoint.topic}</span>
              </div>
            </div>
          )}

          {viewMode === 'COMPARE' && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-700 mb-1">Cumulative Rates:</div>
              {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600">{entry.name}:</span>
                  </span>
                  <span className={`font-mono font-bold ${entry.value < 75 ? 'text-[#9F1239]' : 'text-slate-900'}`}>
                    {entry.value !== null ? `${entry.value}%` : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-md p-4 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#F1EFEA]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <TrendingUp className="w-4 h-4 text-[#1E293B]" />
            <h3 className="text-sm font-bold text-[#1E293B]">Semester Attendance Progression & Trends</h3>
          </div>
          <p className="text-xs text-slate-500">
            Interactive temporal analysis powered by Recharts with 75% regulatory warning boundary
          </p>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-[#F1EFEA] rounded-md text-xs font-medium shrink-0">
          <button
            onClick={() => setViewMode('STUDENT')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors ${
              viewMode === 'STUDENT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>By Student</span>
          </button>

          <button
            onClick={() => setViewMode('COURSE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors ${
              viewMode === 'COURSE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>By Course</span>
          </button>

          <button
            onClick={() => setViewMode('COMPARE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm transition-colors ${
              viewMode === 'COMPARE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Cohort Comparison</span>
          </button>
        </div>
      </div>

      {/* Target Selector Dropdown based on View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-md border border-[#E2E8F0]">
        {viewMode === 'STUDENT' && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Select Student:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="text-xs bg-white border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-slate-800 font-medium focus:outline-hidden focus:border-[#2563EB]"
            >
              {students.map(s => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentId} — {s.fullName} ({s.department})
                </option>
              ))}
            </select>
          </div>
        )}

        {viewMode === 'COURSE' && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Select Course Offering:
            </label>
            <select
              value={selectedCourseCode}
              onChange={(e) => setSelectedCourseCode(e.target.value)}
              className="text-xs bg-white border border-[#CBD5E1] rounded-md px-2.5 py-1.5 text-slate-800 font-medium focus:outline-hidden focus:border-[#2563EB]"
            >
              {courses.map(c => (
                <option key={c.courseCode} value={c.courseCode}>
                  {c.courseCode} — {c.title} ({c.faculty})
                </option>
              ))}
            </select>
          </div>
        )}

        {viewMode === 'COMPARE' && (
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="font-semibold text-slate-800">Comparative Overview:</span>
            <span>Overlaying active engineering & computer science students across the term</span>
          </div>
        )}

        {/* Legend Reference explanation */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-0.5 bg-[#1E293B] inline-block" />
            <span>Cumulative Attendance</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#9F1239]">
            <span className="w-3 h-0.5 bg-[#E11D48] border-dashed border-t-2 border-[#E11D48] inline-block" />
            <span>75% Regulatory Min</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'STUDENT' ? (
            <LineChart
              data={studentChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EFEA" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                ticks={[0, 25, 50, 75, 90, 100]}
                unit="%"
                fontFamily="JetBrains Mono, monospace"
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Regulatory 75% Reference Line */}
              <ReferenceLine
                y={75}
                stroke="#E11D48"
                strokeDasharray="4 4"
                label={{
                  value: '75% Mandatory Minimum',
                  fill: '#9F1239',
                  fontSize: 10,
                  position: 'insideBottomRight',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />

              {/* 90% Honors Line */}
              <ReferenceLine
                y={90}
                stroke="#059669"
                strokeDasharray="3 3"
                label={{
                  value: '90% Honors',
                  fill: '#065F46',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />

              <Line
                type="monotone"
                dataKey="cumulativeRate"
                name="Cumulative Attendance %"
                stroke="#1E293B"
                strokeWidth={2.5}
                dot={{ r: 3.5, stroke: '#1E293B', strokeWidth: 1.5, fill: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#1E293B' }}
              />
            </LineChart>
          ) : viewMode === 'COURSE' ? (
            <LineChart
              data={courseChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EFEA" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                ticks={[0, 25, 50, 75, 90, 100]}
                unit="%"
                fontFamily="JetBrains Mono, monospace"
              />
              <Tooltip content={<CustomTooltip />} />
              
              <ReferenceLine
                y={75}
                stroke="#E11D48"
                strokeDasharray="4 4"
                label={{
                  value: '75% Threshold',
                  fill: '#9F1239',
                  fontSize: 10,
                  position: 'insideBottomRight'
                }}
              />

              <Line
                type="monotone"
                dataKey="cumulativeRate"
                name="Course Cumulative %"
                stroke="#1E293B"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#FFFFFF', stroke: '#1E293B' }}
                activeDot={{ r: 6, fill: '#1E293B' }}
              />

              <Line
                type="monotone"
                dataKey="sessionAttendance"
                name="Daily Turnout %"
                stroke="#2563EB"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                dot={{ r: 2.5, fill: '#2563EB' }}
              />
            </LineChart>
          ) : (
            <LineChart
              data={compareChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1EFEA" vertical={false} />
              <XAxis
                dataKey="displayDate"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono, monospace"
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                ticks={[0, 25, 50, 75, 90, 100]}
                unit="%"
                fontFamily="JetBrains Mono, monospace"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />

              <ReferenceLine
                y={75}
                stroke="#E11D48"
                strokeDasharray="4 4"
                label={{
                  value: '75% Minimum Required',
                  fill: '#9F1239',
                  fontSize: 10,
                  position: 'insideBottomRight'
                }}
              />

              <Line
                type="monotone"
                dataKey="Eleanor Vance (CS)"
                stroke="#1E293B"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Amina Al-Mansoor (CS)"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Julian Hayes (ME)"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Devon Miller (EE)"
                stroke="#DC2626"
                strokeWidth={2.5}
                dot={{ r: 3.5 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="Mateo Morales (CS)"
                stroke="#D97706"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={{ r: 2.5 }}
                connectNulls
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Metric Rollup Cards Beneath Chart */}
      {currentSummary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-[#F1EFEA]">
          <div className="p-2.5 bg-[#FAF8F5] rounded-md border border-[#E2E8F0]">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Term Start</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
              {currentSummary.initial}%
            </span>
          </div>

          <div className="p-2.5 bg-[#FAF8F5] rounded-md border border-[#E2E8F0]">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Current Standing</span>
            <span className={`text-base font-bold font-mono mt-0.5 block ${currentSummary.isUnderThreshold ? 'text-[#9F1239]' : 'text-slate-900'}`}>
              {currentSummary.latest}%
            </span>
          </div>

          <div className="p-2.5 bg-[#FAF8F5] rounded-md border border-[#E2E8F0]">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Semester Peak</span>
            <span className="text-base font-bold font-mono text-emerald-700 mt-0.5 block">
              {currentSummary.peak}%
            </span>
          </div>

          <div className="p-2.5 bg-[#FAF8F5] rounded-md border border-[#E2E8F0]">
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Lowest Trough</span>
            <span className={`text-base font-bold font-mono mt-0.5 block ${currentSummary.trough < 75 ? 'text-[#9F1239]' : 'text-slate-700'}`}>
              {currentSummary.trough}%
            </span>
          </div>

          <div className={`p-2.5 rounded-md border col-span-2 sm:col-span-1 ${currentSummary.isUnderThreshold ? 'bg-[#FFE4E6] border-[#FECDD3]' : 'bg-[#D1FAE5] border-[#A7F3D0]'}`}>
            <span className="text-[10px] uppercase font-mono text-slate-600 block">Regulatory Status</span>
            <span className={`text-xs font-bold mt-0.5 block ${currentSummary.isUnderThreshold ? 'text-[#9F1239]' : 'text-[#065F46]'}`}>
              {currentSummary.isUnderThreshold ? 'Disbarment Alert' : 'Compliant (≥75%)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
