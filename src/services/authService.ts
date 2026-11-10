/**
 * Role Access and Authentication Service
 * Standard SHA-256 hashing using the Web Crypto API
 */

export async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface UserRoleCapabilities {
  canEditStudents: boolean;
  canManageCourses: boolean;
  canEnterGrades: boolean;
  canTakeAttendance: boolean;
  canRecordPayments: boolean;
  isStudentPortal: boolean;
}

export function getRoleCapabilities(role: 'ADMIN' | 'FACULTY' | 'STUDENT'): UserRoleCapabilities {
  if (role === 'ADMIN') {
    return {
      canEditStudents: true,
      canManageCourses: true,
      canEnterGrades: true,
      canTakeAttendance: true,
      canRecordPayments: true,
      isStudentPortal: false
    };
  }
  if (role === 'FACULTY') {
    return {
      canEditStudents: false,
      canManageCourses: true,
      canEnterGrades: true,
      canTakeAttendance: true,
      canRecordPayments: false,
      isStudentPortal: false
    };
  }
  // STUDENT
  return {
    canEditStudents: false,
    canManageCourses: false,
    canEnterGrades: false,
    canTakeAttendance: false,
    canRecordPayments: false,
    isStudentPortal: true
  };
}
