import { AcademicEvent } from '../types';

const escapeIcalText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

const formatDate = (date: string) => date.replace(/-/g, '');

export function generateIcsCalendar(events: AcademicEvent[], calendarName = 'Academic Calendar') {
  const entries = events.map(event => {
    const start = new Date(`${event.startDate}T00:00:00`);
    const inclusiveEnd = event.endDate || event.startDate;
    const end = new Date(`${inclusiveEnd}T00:00:00`);
    end.setDate(end.getDate() + 1);
    const lines = [
      'BEGIN:VEVENT',
      `UID:${event.eventId}@student-management-system`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `DTSTART;VALUE=DATE:${formatDate(event.startDate)}`,
      `DTEND;VALUE=DATE:${formatDate(end.toISOString().slice(0, 10))}`,
      `SUMMARY:${escapeIcalText(event.title)}`,
      `DESCRIPTION:${escapeIcalText(event.description)}`,
    ];
    if (event.location) lines.push(`LOCATION:${escapeIcalText(event.location)}`);
    lines.push('END:VEVENT');
    return lines.join('\r\n');
  });
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Student Management System//Academic Calendar//EN',
    `X-WR-CALNAME:${escapeIcalText(calendarName)}`,
    ...entries,
    'END:VCALENDAR'
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${calendarName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
