# Student Management System (SMS)

A full-stack, human-crafted academic management application engineered with Principal Java enterprise domain architecture (Jakarta Persistence / Spring Boot patterns) paired with an embedded relational persistence engine, Recharts temporal attendance analytics, and an interactive academic calendar.

Built by Development Team: **Rishi Aravindh**, **Sakthi Vignesh**, and **Rohith**.

---

## 🚀 How to Run in Visual Studio Code

### Prerequisites
- **Node.js** v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm** (comes bundled with Node.js)
- **Visual Studio Code** ([Download VS Code](https://code.visualstudio.com/))

---

### Step-by-Step Instructions

1. **Extract the ZIP file**
   Extract `student-management-system.zip` into your desired projects directory.

2. **Open in VS Code**
   - Launch Visual Studio Code.
   - Go to **File** > **Open Folder...** (or `Ctrl+K Ctrl+O` on Windows/Linux, `Cmd+O` on macOS).
   - Select the extracted folder (`student-management-system`).

3. **Open the Integrated Terminal**
   - In VS Code, press `` Ctrl+` `` (or `Cmd+~` on macOS) or select **Terminal** > **New Terminal** from the top menu.

4. **Install Dependencies**
   Run the following command in the terminal to install all required packages:
   ```bash
   npm install
   ```

5. **Start the Development Server**
   Start the local Vite dev server:
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   - Open your browser and navigate to:
     ```
     http://localhost:3000
     ```
   - The application will load with all features pre-populated with realistic university seed records!

---

## 🛠 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on `http://localhost:3000` |
| `npm run build` | Builds optimized production static assets into the `dist/` directory |
| `npm run preview` | Previews the production build locally |
| `npm run api` | Starts the local API-enabled server that serves the app and exposes record/user endpoints |
| `npm run lint` | Runs TypeScript compilation checks with zero emit errors |

---

## 🔌 User and Record API

The local server also exposes a small REST API for record interaction.

- `GET /api/health` — Server status check
- `GET /api/users` — List users
- `GET /api/students` — List student records
- `GET /api/students/:studentId` — Fetch one student record
- `POST /api/students` — Create a student record
- `PUT /api/students/:studentId` — Update a student record
- `DELETE /api/students/:studentId` — Delete a student record
- `GET /api/users/:userId/records` — Return a user and their related records
- `GET /api/records?userId=...&studentId=...` — Filter records by user or student

Example:

```bash
curl http://127.0.0.1:3000/api/users/USR-STU-1/records
curl -X POST "http://127.0.0.1:3000/api/students" --data "studentId=STU-2024-1000&fullName=Test+Student&email=test.student%40campus.edu&phone=%2B1-555-9000&dob=2002-02-02&department=Data+Science&batch=2024&enrollmentDate=2024-09-01&status=Active"
```

---

## 📦 Project Structure

```
student-management-system/
├── index.html                   # HTML entry point with fonts & metadata
├── metadata.json                # Project capabilities & permissions
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript strict configuration
├── vite.config.ts               # Vite & Tailwind CSS plugins
├── README.md                    # Setup instructions
│
├── public/
│   └── student-management-system.zip  # Downloadable project archive
│
└── src/
    ├── main.tsx                 # React DOM root entry point
    ├── App.tsx                  # Main application orchestrator & state
    ├── index.css                # Tailwind CSS & print media styling
    │
    ├── types/
    │   └── index.ts             # Domain models (Student, Course, Grade, Fee, Event)
    │
    ├── db/
    │   ├── schema.ts            # Seed dataset & ANSI H2 SQL DDL script
    │   └── storage.ts           # Relational DatabaseService & persistence
    │
    ├── services/
    │   └── authService.ts       # Role capabilities & Web Crypto SHA-256
    │
    ├── utils/
    │   ├── validation.ts        # RFC Email & Phone regex validation
    │   ├── exportCsv.ts         # Generic tabular CSV exporter
    │   └── icalGenerator.ts     # RFC 5545 iCalendar (.ics) generator
    │
    ├── assets/
    │   └── images/              # Official university crest seal
    │
    └── components/
        ├── Header.tsx           # 3-Zone top navigation with search & role switcher
        ├── QuickStats.tsx       # Compact metrics row (GPA, attendance, courses, fees)
        ├── StudentModule.tsx    # Student directory, filtering, and CRUD drawer
        ├── CourseModule.tsx     # Course catalog with real-time seat cap validation
        ├── GradeModule.tsx      # Credit-weighted GPA & CGPA grading engine
        ├── AttendanceModule.tsx # Attendance tracker with dynamic percentage calculation
        ├── AttendanceTrendChart.tsx # Recharts temporal line graph (75% threshold)
        ├── FeeLedgerModule.tsx  # Bursar fee ledger & payment recorder
        ├── CalendarModule.tsx   # Academic calendar (month grid, agenda, .ics sync)
        ├── TranscriptModal.tsx  # Official printable university academic transcript
        ├── ReceiptModal.tsx     # Official printable Bursar payment voucher
        ├── JavaArchitectureModal.tsx # Principal Java domain entities & Spring Boot explorer
        ├── SqlConsoleModal.tsx  # Virtual H2 / SQLite query console & .sql dump
        └── StudentPortalView.tsx# Student self-service perspective
```

---

## 🌟 Key Application Features

1. **Student Directory & Management**: Multi-field filter bar (Department, Batch, Status, GPA Tier, Attendance), sorting, and side-panel drawer with RFC regex validation for emails and phone numbers.
2. **Course Catalog & Concurrency Seat Cap**: Real-time seat allocation checks preventing enrollment beyond room capacities.
3. **Credit-Weighted GPA Engine**: Automatic $40\%$ assignment / $60\%$ exam weighted composite score calculation, 4.00 quality points scale, and printable academic transcripts.
4. **Attendance Tracker & Recharts Line Graph**: Session logging, dynamic semester %, 75% regulatory warning flag, and temporal trend visualization by student, course, or cohort comparison.
5. **Bursar Fee Ledger & Payment Receipts**: Outstanding balance tracking, delinquent account isolation, and one-click printable voucher issuance.
6. **Academic Calendar Module**: Exam windows, enrollment deadlines, holidays, with month grid, agenda, and standard `.ics` export.
7. **Role-Based Access**: Seamlessly toggle between Administrator/Registrar, Faculty Member, and Student views.
8. **Java Enterprise Architecture & Virtual H2 SQL Console**: Inspect production-ready Spring Boot / JPA code (`Student.java`, `AcademicManagementService.java`, `StudentController.java`) and run live SQL queries.
