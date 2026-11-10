import { Student } from '../types';

export function validateStudentForm(student: Student) {
  const errors: Record<string, string> = {};
  const requiredFields: Array<keyof Student> = [
    'studentId',
    'fullName',
    'email',
    'phone',
    'dob',
    'department',
    'batch',
    'enrollmentDate'
  ];

  for (const field of requiredFields) {
    if (!String(student[field] ?? '').trim()) {
      errors[field] = 'This field is required.';
    }
  }

  if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    errors.email = 'Enter a valid email address.';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
