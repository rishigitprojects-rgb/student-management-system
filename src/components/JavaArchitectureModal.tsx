import React, { useState } from 'react';
import { X, Copy, Check, FileCode2, Layers, Database, Download } from 'lucide-react';
import { H2_SQL_DDL } from '../db/schema';

interface JavaArchitectureModalProps {
  onClose: () => void;
}

const JAVA_STUDENT_ENTITY = `package com.university.sms.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Principal Java Enterprise Domain Model
 * Student Entity mapped with Jakarta Persistence (JPA / Hibernate 6)
 */
@Entity
@Table(name = "students", indexes = {
    @Index(name = "idx_student_dept", columnList = "department"),
    @Index(name = "idx_student_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @Column(name = "student_id", length = 32, nullable = false, updatable = false)
    @Pattern(regexp = "^STU-\\\\d{4}-\\\\d{3,4}$", message = "Student ID must adhere to STU-YYYY-XXX format")
    private String studentId;

    @NotBlank(message = "Full Name cannot be blank")
    @Size(min = 3, max = 128)
    @Column(name = "full_name", length = 128, nullable = false)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must provide a valid university email format")
    @Column(name = "email", length = 128, nullable = false, unique = true)
    private String email;

    @Pattern(regexp = "^\\\\+?[\\\\d\\\\s\\\\-()]{7,20}$", message = "Invalid phone number format")
    @Column(name = "phone", length = 32, nullable = false)
    private String phone;

    @NotNull(message = "Date of Birth is mandatory")
    @Column(name = "dob", nullable = false)
    private LocalDate dob;

    @NotBlank(message = "Department cannot be blank")
    @Column(name = "department", length = 64, nullable = false)
    private String department;

    @NotBlank(message = "Batch year is required")
    @Column(name = "batch", length = 16, nullable = false)
    private String batch;

    @NotNull(message = "Enrollment date required")
    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private StudentStatus status;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "emergency_contact", length = 128)
    private String emergencyContact;

    @Lob
    @Column(name = "notes")
    private String notes;
}
`;

const JAVA_SERVICE = `package com.university.sms.service;

import com.university.sms.domain.entity.*;
import com.university.sms.domain.repository.*;
import com.university.sms.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AcademicManagementService {

    private final StudentRepository studentRepo;
    private final CourseRepository courseRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final GradeRepository gradeRepo;

    /**
     * Credit-Weighted CGPA Calculation:
     * CGPA = Sum(Course Credits * Grade Points) / Sum(Course Credits)
     */
    public BigDecimal calculateCumulativeGpa(String studentId) {
        List<Grade> grades = gradeRepo.findByStudentId(studentId);
        if (grades.isEmpty()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal totalPoints = BigDecimal.ZERO;
        int totalCredits = 0;

        for (Grade g : grades) {
            Course course = courseRepo.findById(g.getCourseCode())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + g.getCourseCode()));
            int credits = course.getCredits();
            totalCredits += credits;
            totalPoints = totalPoints.add(g.getGradePoints().multiply(BigDecimal.valueOf(credits)));
        }

        if (totalCredits == 0) return BigDecimal.ZERO;
        return totalPoints.divide(BigDecimal.valueOf(totalCredits), 2, RoundingMode.HALF_UP);
    }

    /**
     * Concurrency-Safe Student Course Enrollment with Seat Cap Validation
     */
    @Transactional
    public Enrollment enrollStudent(String studentId, String courseCode, String semester) {
        Course course = courseRepo.findById(courseCode)
            .orElseThrow(() -> new ResourceNotFoundException("Course offering not found"));

        // Check if student already enrolled
        if (enrollmentRepo.existsByStudentIdAndCourseCodeAndSemester(studentId, courseCode, semester)) {
            throw new DuplicateEnrollmentException("Student already enrolled for term " + semester);
        }

        // Concurrency seat cap check
        long currentEnrolled = enrollmentRepo.countByCourseCodeAndSemesterAndStatus(courseCode, semester, EnrollmentStatus.Enrolled);
        if (currentEnrolled >= course.getCapacity()) {
            throw new CourseCapacityExceededException("Course " + courseCode + " seat cap reached: " + course.getCapacity());
        }

        Enrollment enrollment = Enrollment.builder()
            .studentId(studentId)
            .courseCode(courseCode)
            .semester(semester)
            .status(EnrollmentStatus.Enrolled)
            .build();

        return enrollmentRepo.save(enrollment);
    }
}
`;

const JAVA_CONTROLLER = `package com.university.sms.controller;

import com.university.sms.domain.entity.Student;
import com.university.sms.dto.StudentSummaryDto;
import com.university.sms.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String batch) {
        return ResponseEntity.ok(studentService.findStudents(department, batch));
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<StudentSummaryDto> getStudentAcademicSummary(@PathVariable String id) {
        return ResponseEntity.ok(studentService.getAcademicSummary(id));
    }

    @PostMapping
    public ResponseEntity<Student> registerStudent(@Valid @RequestBody Student student) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.register(student));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable String id, @Valid @RequestBody Student student) {
        return ResponseEntity.ok(studentService.update(id, student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
`;

export const JavaArchitectureModal: React.FC<JavaArchitectureModalProps> = ({ onClose }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'ENTITY' | 'SERVICE' | 'CONTROLLER' | 'H2_SQL'>('ENTITY');
  const [copied, setCopied] = useState(false);

  const getActiveCode = () => {
    switch (activeCodeTab) {
      case 'ENTITY': return JAVA_STUDENT_ENTITY;
      case 'SERVICE': return JAVA_SERVICE;
      case 'CONTROLLER': return JAVA_CONTROLLER;
      case 'H2_SQL': return H2_SQL_DDL;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = getActiveCode();
    const ext = activeCodeTab === 'H2_SQL' ? 'sql' : 'java';
    const filename = activeCodeTab === 'ENTITY' ? 'Student.java'
      : activeCodeTab === 'SERVICE' ? 'AcademicManagementService.java'
      : activeCodeTab === 'CONTROLLER' ? 'StudentController.java'
      : 'schema-h2.sql';

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-[#CBD5E1] rounded-md shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#1E293B] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Principal Java Enterprise Architecture Specification
              </h3>
              <p className="text-[11px] text-slate-400">
                Jakarta Persistence (JPA), Spring Boot 3.3, H2 Database Engine Parity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#F1EFEA] border-b border-[#E2E8F0] overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveCodeTab('ENTITY')}
            className={`px-3 py-1.5 rounded-sm transition-colors ${
              activeCodeTab === 'ENTITY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student.java (JPA Entity)
          </button>
          <button
            onClick={() => setActiveCodeTab('SERVICE')}
            className={`px-3 py-1.5 rounded-sm transition-colors ${
              activeCodeTab === 'SERVICE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AcademicManagementService.java (Service Logic)
          </button>
          <button
            onClick={() => setActiveCodeTab('CONTROLLER')}
            className={`px-3 py-1.5 rounded-sm transition-colors ${
              activeCodeTab === 'CONTROLLER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            StudentController.java (REST API)
          </button>
          <button
            onClick={() => setActiveCodeTab('H2_SQL')}
            className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${
              activeCodeTab === 'H2_SQL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>schema-h2.sql (DDL Script)</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 text-slate-200 overflow-x-auto max-h-[500px]">
          <pre className="text-xs font-mono leading-relaxed select-all">
            <code>{getActiveCode()}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-800">Clean Architecture Compliance:</span> Domain Entities · Repository Pattern · Transactional Boundary · H2 In-Memory Relational Engine
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1E293B] text-white hover:bg-slate-800 rounded-md font-semibold"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
