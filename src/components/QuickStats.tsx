import React from 'react';
import { 
  Users, BookOpen, GraduationCap, CheckCircle2, 
  AlertTriangle, TrendingUp, TrendingDown, ArrowUpRight 
} from 'lucide-react';
import { StudentAcademicSummary, Course, FeeLedgerEntry } from '../types';
import { formatINR } from '../utils/currency';

interface QuickStatsProps {
  summaries: StudentAcademicSummary[];
  courses: Course[];
  feeLedgers: FeeLedgerEntry[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ summaries, courses, feeLedgers }) => {
  const totalStudents = summaries.length;
  const activeStudents = summaries.filter(s => s.student.status === 'Active').length;
  
  const totalCourses = courses.length;
  const totalSeatCapacity = courses.reduce((acc, c) => acc + c.capacity, 0);
  const totalEnrolledSeats = courses.reduce((acc, c) => acc + c.enrolledCount, 0);
  const seatFillPercentage = totalSeatCapacity > 0 ? Math.round((totalEnrolledSeats / totalSeatCapacity) * 100) : 0;

  // Calculate Institute Average GPA
  const studentsWithGpa = summaries.filter(s => s.cgpa > 0);
  const avgGpa = studentsWithGpa.length > 0
    ? (studentsWithGpa.reduce((acc, s) => acc + s.cgpa, 0) / studentsWithGpa.length).toFixed(2)
    : '0.00';

  // Calculate Institute Attendance Rate
  const avgAttendance = summaries.length > 0
    ? Math.round(summaries.reduce((acc, s) => acc + s.attendanceRate, 0) / summaries.length)
    : 100;
  const lowAttendanceCount = summaries.filter(s => s.attendanceRate < 75).length;

  // Fee ledger calculations
  const overdueEntries = feeLedgers.filter(f => f.status === 'Overdue');
  const overdueTotal = overdueEntries.reduce((acc, f) => acc + f.balanceAmount, 0);
  const totalCollected = feeLedgers.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalBilled = feeLedgers.reduce((acc, f) => acc + f.totalFees, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Reusable inline mini SVG Sparkline component
  const MiniSparkline: React.FC<{
    data: number[];
    color: string;
    strokeColor: string;
    fillColor: string;
    height?: number;
    width?: number;
  }> = ({ data, color, strokeColor, fillColor, height = 24, width = 64 }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);

    const points = data.map((val, idx) => {
      const x = idx * step;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const fillPath = `0,${height} ${points} ${width},${height}`;

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points={fillPath} fill={`url(#grad-${color})`} />
        <polyline 
          points={points} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Pulsing endpoint dot */}
        <circle 
          cx={width} 
          cy={height - ((data[data.length - 1] - min) / range) * (height - 6) - 3} 
          r="2.5" 
          fill={strokeColor} 
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      
      {/* 1. Enrolled Students Bento */}
      <div className="bento-card p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold tracking-tight text-slate-500 uppercase">
              Enrolled Students
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-baseline justify-between gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 leading-none">
              {totalStudents}
            </span>
            {/* Delta Badge */}
            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>+12.4%</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-500 mt-1 block">
            {activeStudents} active · 4 depts
          </span>
        </div>

        {/* Mini Sparkline Footer */}
        <div className="pt-2 mt-2 border-t border-[#F1EFEA] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">7-cohort trend</span>
          <MiniSparkline 
            data={[12, 14, 16, 15, 18, 20, 24]} 
            color="emerald" 
            strokeColor="#10B981" 
            fillColor="#34D399" 
          />
        </div>
      </div>

      {/* 2. Active Courses Bento */}
      <div className="bento-card p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold tracking-tight text-slate-500 uppercase">
              Active Courses
            </span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-baseline justify-between gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 leading-none">
              {totalCourses}
            </span>
            {/* Seat Fill Delta Badge */}
            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              <span>{seatFillPercentage}% cap</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-500 mt-1 block font-mono">
            {totalEnrolledSeats}/{totalSeatCapacity} seats occupied
          </span>
        </div>

        {/* Mini Sparkline Footer */}
        <div className="pt-2 mt-2 border-t border-[#F1EFEA] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">Enrollment load</span>
          <MiniSparkline 
            data={[8, 11, 10, 14, 13, 16, 17]} 
            color="blue" 
            strokeColor="#2563EB" 
            fillColor="#60A5FA" 
          />
        </div>
      </div>

      {/* 3. Institute Avg GPA Bento */}
      <div className="bento-card p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold tracking-tight text-slate-500 uppercase">
              Average GPA
            </span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 leading-none">
                {avgGpa}
              </span>
              <span className="text-[11px] font-mono text-slate-400">/4.00</span>
            </div>
            {/* GPA Delta Badge */}
            <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              <TrendingUp className="w-3 h-3 text-amber-600" />
              <span>+0.08 pt</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-500 mt-1 block">
            Credit-weighted scale
          </span>
        </div>

        {/* Mini Sparkline Footer */}
        <div className="pt-2 mt-2 border-t border-[#F1EFEA] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">GPA curve</span>
          <MiniSparkline 
            data={[3.32, 3.38, 3.42, 3.40, 3.51, 3.58, 3.64]} 
            color="amber" 
            strokeColor="#F59E0B" 
            fillColor="#FBBF24" 
          />
        </div>
      </div>

      {/* 4. Dynamic Attendance Rate Bento */}
      <div className="bento-card p-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold tracking-tight text-slate-500 uppercase">
              Attendance Rate
            </span>
            <CheckCircle2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-baseline justify-between gap-1">
            <span className={`text-2xl font-bold font-mono tabular-nums leading-none ${
              avgAttendance < 75 ? 'text-rose-700' : 'text-slate-900'
            }`}>
              {avgAttendance}%
            </span>
            {/* Shortage or Target Badge */}
            {lowAttendanceCount > 0 ? (
              <span className="inline-flex items-center text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                {lowAttendanceCount} &lt;75%
              </span>
            ) : (
              <span className="inline-flex items-center text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Optimal
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-500 mt-1 block">
            Semester attendance log
          </span>
        </div>

        {/* Mini Sparkline Footer */}
        <div className="pt-2 mt-2 border-t border-[#F1EFEA] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">Weekly rate</span>
          <MiniSparkline 
            data={[88, 91, 89, 93, 90, 94, 92]} 
            color="indigo" 
            strokeColor="#6366F1" 
            fillColor="#818CF8" 
          />
        </div>
      </div>

      {/* 5. Pending Fee Warnings & Collection Bento */}
      <div className="bento-card p-3.5 flex flex-col justify-between col-span-2 md:col-span-1">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold tracking-tight text-slate-500 uppercase">
              Tuition Collections
            </span>
            <AlertTriangle className={`w-4 h-4 ${overdueEntries.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>

          <div className="flex items-baseline justify-between gap-1">
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 leading-none">
              {formatINR(overdueTotal)}
            </span>
            {/* Collection Delta Badge */}
            <span className="inline-flex items-center text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {collectionRate}% recov
            </span>
          </div>

          <span className="text-[11px] text-slate-500 mt-1 block font-mono">
            {overdueEntries.length} delinquent account(s)
          </span>
        </div>

        {/* Mini Sparkline Footer */}
        <div className="pt-2 mt-2 border-t border-[#F1EFEA] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">Cash intake</span>
          <MiniSparkline 
            data={[14, 18, 22, 28, 35, 41, 48]} 
            color="emerald" 
            strokeColor="#059669" 
            fillColor="#34D399" 
          />
        </div>
      </div>

    </div>
  );
};
