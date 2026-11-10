import React, { useState, useMemo } from 'react';
import { AcademicEvent, AcademicEventType, AppUser } from '../types';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Plus, 
  Clock, AlertCircle, MapPin, Users, BookOpen, Flag, Check, X, ShieldAlert, FileText
} from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';
import { generateIcsCalendar } from '../utils/icalGenerator';

interface CalendarModuleProps {
  events: AcademicEvent[];
  currentUser: AppUser;
  onAddEvent: (event: AcademicEvent) => { success: boolean; error?: string };
  onDeleteEvent: (eventId: string) => void;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({
  events,
  currentUser,
  onAddEvent,
  onDeleteEvent
}) => {
  // Calendar Navigation: default to current semester month (e.g. November 2024 or current date)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2024, 10, 1)); // November 2024
  const [viewFormat, setViewFormat] = useState<'MONTH' | 'AGENDA'>('MONTH');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  
  // Selected Event Modal & Add Modal
  const [selectedEvent, setSelectedEvent] = useState<AcademicEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Event Form State
  const initialFormState: AcademicEvent = {
    eventId: '',
    title: '',
    eventType: 'EXAM',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    location: '',
    targetCohort: 'All Academic Cohorts',
    isMandatory: true
  };
  const [formData, setFormData] = useState<AcademicEvent>(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY';

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (selectedTypeFilter !== 'ALL' && e.eventType !== selectedTypeFilter) return false;
      return true;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, selectedTypeFilter]);

  // Calendar Math for Monthly Grid
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Shift Monday to 0 index (Mon=0, Tue=1 ... Sun=6)
  const startDayOffset = (firstDayOfMonth + 6) % 7;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2024, 10, 1)); // Center on Fall 2024 term
  };

  // Map events to day numbers for current month
  const eventsByDay = useMemo(() => {
    const map = new Map<number, AcademicEvent[]>();
    filteredEvents.forEach(evt => {
      const [y, m, d] = evt.startDate.split('-').map(Number);
      if (y === currentYear && m === currentMonth + 1) {
        const list = map.get(d) || [];
        list.push(evt);
        map.set(d, list);
      }
    });
    return map;
  }, [filteredEvents, currentYear, currentMonth]);

  // Next Upcoming Highlights
  const todayStr = '2024-10-08'; // System reference date
  const upcomingEvents = events
    .filter(e => e.startDate >= todayStr)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const nextExam = upcomingEvents.find(e => e.eventType === 'EXAM');
  const nextEnrollment = upcomingEvents.find(e => e.eventType === 'ENROLLMENT');
  const nextHoliday = upcomingEvents.find(e => e.eventType === 'HOLIDAY');

  // Submit Handler for Add Event
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim() || !formData.startDate) {
      setFormError('Please provide an event title and start date.');
      return;
    }

    const newEvt: AcademicEvent = {
      ...formData,
      eventId: `EVT-${Date.now().toString().slice(-4)}`
    };

    const res = onAddEvent(newEvt);
    if (!res.success) {
      setFormError(res.error || 'Failed to save academic event.');
    } else {
      setIsAddModalOpen(false);
      setFormData(initialFormState);
    }
  };

  // CSV Exporter
  const handleExportCsv = () => {
    const exportData = filteredEvents.map(e => ({
      EventID: e.eventId,
      Title: e.title,
      Category: e.eventType,
      StartDate: e.startDate,
      EndDate: e.endDate || e.startDate,
      Mandatory: e.isMandatory ? 'Yes' : 'No',
      TargetCohort: e.targetCohort || 'All Cohorts',
      Location: e.location || 'Campus Wide',
      Description: e.description
    }));

    exportToCsv('academic_calendar_schedule', exportData);
  };

  // Helper for Badge styling
  const renderTypeBadge = (type: AcademicEventType) => {
    switch (type) {
      case 'EXAM':
        return (
          <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-[#FFE4E6] text-[#9F1239] border border-[#FECDD3]">
            EXAM
          </span>
        );
      case 'ENROLLMENT':
        return (
          <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            ENROLLMENT
          </span>
        );
      case 'HOLIDAY':
        return (
          <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">
            HOLIDAY
          </span>
        );
      case 'MILESTONE':
        return (
          <span className="inline-block px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
            MILESTONE
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <CalendarIcon className="w-4 h-4 text-[#1E293B]" />
            <h2 className="text-base font-semibold text-[#1E293B]">Academic Calendar & Registrar Timetable</h2>
          </div>
          <p className="text-xs text-slate-500">
            Fall 2024 / Spring 2025 examination periods, registration windows, and university holidays
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => generateIcsCalendar(filteredEvents)}
            title="Download iCal file compatible with Google Calendar, Apple Calendar, and Outlook"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync to iCal (.ics)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-md hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {canManage && (
            <button
              onClick={() => {
                setFormData(initialFormState);
                setFormError(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E293B] rounded-md hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Academic Date</span>
            </button>
          )}
        </div>
      </div>

      {/* Key Dates Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Next Exam Period */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 transition-colors hover:border-slate-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Upcoming Exam Window</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <span className="text-sm font-bold text-slate-900 block truncate">
            {nextExam ? nextExam.title : 'No exams scheduled'}
          </span>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            {nextExam ? `${nextExam.startDate} ${nextExam.endDate ? `to ${nextExam.endDate}` : ''}` : 'Term concluded'}
          </span>
        </div>

        {/* Next Registration Deadline */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 transition-colors hover:border-slate-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Registration / Fee Due Date</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <span className="text-sm font-bold text-slate-900 block truncate">
            {nextEnrollment ? nextEnrollment.title : 'All deadlines passed'}
          </span>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            {nextEnrollment ? nextEnrollment.startDate : 'N/A'}
          </span>
        </div>

        {/* Next Holiday */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 transition-colors hover:border-slate-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Next University Recess</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-sm font-bold text-slate-900 block truncate">
            {nextHoliday ? nextHoliday.title : 'Classes in continuous session'}
          </span>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            {nextHoliday ? nextHoliday.startDate : 'N/A'}
          </span>
        </div>

        {/* Total Events in Schedule */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-3.5 transition-colors hover:border-slate-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Academic Milestones</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-xl font-bold font-mono text-slate-900 leading-none">
            {events.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across 2 academic semesters
          </span>
        </div>
      </div>

      {/* Filter and View Selector Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-md p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <button
            onClick={() => setSelectedTypeFilter('ALL')}
            className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
              selectedTypeFilter === 'ALL'
                ? 'bg-[#1E293B] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Dates ({events.length})
          </button>
          <button
            onClick={() => setSelectedTypeFilter('EXAM')}
            className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
              selectedTypeFilter === 'EXAM'
                ? 'bg-[#FFE4E6] text-[#9F1239] border border-[#FECDD3]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Examinations
          </button>
          <button
            onClick={() => setSelectedTypeFilter('ENROLLMENT')}
            className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
              selectedTypeFilter === 'ENROLLMENT'
                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Enrollment & Fees
          </button>
          <button
            onClick={() => setSelectedTypeFilter('HOLIDAY')}
            className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
              selectedTypeFilter === 'HOLIDAY'
                ? 'bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Holidays & Recesses
          </button>
          <button
            onClick={() => setSelectedTypeFilter('MILESTONE')}
            className={`px-2.5 py-1 rounded-sm font-medium transition-colors ${
              selectedTypeFilter === 'MILESTONE'
                ? 'bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Milestones
          </button>
        </div>

        {/* View Switcher (Grid vs Agenda) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-[#F1EFEA] rounded-md text-xs font-medium">
            <button
              onClick={() => setViewFormat('MONTH')}
              className={`px-2.5 py-1 rounded-xs transition-colors ${
                viewFormat === 'MONTH' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewFormat('AGENDA')}
              className={`px-2.5 py-1 rounded-xs transition-colors ${
                viewFormat === 'AGENDA' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Agenda Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewFormat === 'MONTH' ? (
        <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
          {/* Month Header & Controls */}
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-900 font-mono">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <span className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-xs">
                Fall Term 2024
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1.5 rounded-md hover:bg-slate-200/60 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-medium bg-white border border-[#E2E8F0] hover:bg-slate-100 rounded-md text-slate-700"
              >
                Semester View
              </button>

              <button
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1.5 rounded-md hover:bg-slate-200/60 text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-[#E2E8F0] bg-slate-50 text-center text-xs font-semibold text-slate-600 py-2">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div className="text-slate-400">Sat</div>
            <div className="text-slate-400">Sun</div>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E2E8F0]">
            {/* Empty slots before first day */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-24 p-2 bg-[#FBFBFA]/50" />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayEvents = eventsByDay.get(dayNum) || [];
              const isToday = currentYear === 2024 && currentMonth === 9 && dayNum === 8;

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-24 p-2 transition-colors hover:bg-slate-50/80 ${
                    isToday ? 'bg-amber-50/30' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-[11px]'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dayEvents.length} evt
                      </span>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(evt => (
                      <div
                        key={evt.eventId}
                        onClick={() => setSelectedEvent(evt)}
                        title={evt.title}
                        className={`text-[10px] p-1 rounded-xs cursor-pointer truncate font-medium border ${
                          evt.eventType === 'EXAM'
                            ? 'bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3] hover:bg-rose-100'
                            : evt.eventType === 'ENROLLMENT'
                            ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] hover:bg-amber-100'
                            : evt.eventType === 'HOLIDAY'
                            ? 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0] hover:bg-emerald-100'
                            : 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE] hover:bg-blue-100'
                        }`}
                      >
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-slate-500 font-mono block pl-1">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda / Timeline Schedule View */
        <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E2E8F0] text-slate-600 font-semibold">
                  <th className="py-2.5 px-3 font-mono">Date</th>
                  <th className="py-2.5 px-3">Event Name & Details</th>
                  <th className="py-2.5 px-3 text-center">Category</th>
                  <th className="py-2.5 px-3">Target Cohort</th>
                  <th className="py-2.5 px-3">Venue / Location</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFEA]">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No academic dates match the active category filter.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt, idx) => {
                    const isEven = idx % 2 === 1;

                    return (
                      <tr
                        key={evt.eventId}
                        className={`hover:bg-[#F4F1EC] transition-colors ${
                          isEven ? 'bg-[#FAF8F5]' : 'bg-white'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono text-slate-900 whitespace-nowrap">
                          <span className="font-bold">{evt.startDate}</span>
                          {evt.endDate && evt.endDate !== evt.startDate && (
                            <span className="text-[11px] text-slate-500 block">
                              to {evt.endDate}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div
                            onClick={() => setSelectedEvent(evt)}
                            className="font-bold text-slate-900 hover:text-[#2563EB] cursor-pointer"
                          >
                            {evt.title}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {evt.description}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {renderTypeBadge(evt.eventType)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {evt.targetCohort || 'All Cohorts'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {evt.location || 'Campus Wide'}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedEvent(evt)}
                              className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-semibold"
                            >
                              Details
                            </button>
                            {canManage && (
                              <button
                                onClick={() => {
                                  if (confirm(`Remove event "${evt.title}" from academic calendar?`)) {
                                    onDeleteEvent(evt.eventId);
                                  }
                                }}
                                className="text-[11px] text-rose-600 hover:text-rose-800 font-medium"
                              >
                                Delete
                              </button>
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
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-md shadow-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <div className="flex items-center gap-2">
                {renderTypeBadge(selectedEvent.eventType)}
                <span className="text-xs font-mono text-slate-500">{selectedEvent.eventId}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {selectedEvent.title}
              </h3>

              <div className="p-3 bg-[#FAF8F5] border border-[#E2E8F0] rounded-md space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-slate-900">
                    {selectedEvent.startDate}
                    {selectedEvent.endDate ? ` through ${selectedEvent.endDate}` : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Venue / Location:</span>
                  <span className="text-slate-800 font-sans">{selectedEvent.location || 'Campus Wide'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Cohort:</span>
                  <span className="text-slate-800 font-sans">{selectedEvent.targetCohort || 'All Students & Faculty'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Attendance Requirement:</span>
                  <span className={selectedEvent.isMandatory ? 'text-[#9F1239] font-bold' : 'text-slate-600'}>
                    {selectedEvent.isMandatory ? 'Mandatory Academic Presence' : 'Optional / Self-Governed'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Administrative Description:</span>
                <p className="text-slate-600 leading-relaxed bg-white p-2.5 border border-[#E2E8F0] rounded-md">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                <button
                  onClick={() => generateIcsCalendar([selectedEvent], selectedEvent.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-medium text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ics file</span>
                </button>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-1.5 bg-[#1E293B] text-white hover:bg-slate-800 rounded-md font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal for Admin / Faculty */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-md shadow-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Academic Calendar Event</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-2.5 bg-[#FFE4E6] border border-[#FECDD3] text-xs text-[#9F1239] rounded-md flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Mechanical Engineering Capstone Expo"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value as AcademicEventType })}
                    className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                  >
                    <option value="EXAM">Examination Period</option>
                    <option value="ENROLLMENT">Enrollment & Deadlines</option>
                    <option value="HOLIDAY">Academic Holiday</option>
                    <option value="MILESTONE">University Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attendance</label>
                  <select
                    value={formData.isMandatory ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isMandatory: e.target.value === 'true' })}
                    className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                  >
                    <option value="true">Mandatory</option>
                    <option value="false">Optional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 font-mono border border-[#E2E8F0] rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 font-mono border border-[#E2E8F0] rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Venue / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Science Auditorium / Online"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Cohort</label>
                <input
                  type="text"
                  placeholder="e.g. Class of 2024, Senior Engineers"
                  value={formData.targetCohort || ''}
                  onChange={(e) => setFormData({ ...formData, targetCohort: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed instructions or syllabus notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-md"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E293B] hover:bg-slate-800 rounded-md"
                >
                  Publish to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
