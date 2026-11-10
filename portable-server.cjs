const http = require('node:http');
const { readFile, writeFile, stat } = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 3000);
const dataFile = path.join(__dirname, 'server-data.json');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const seedData = {
  users: [
    { id: 'USR-ADMIN-1', username: 'admin', displayName: 'Dean of Academic Affairs', role: 'ADMIN', department: 'Office of the Registrar' },
    { id: 'USR-FAC-1', username: 'faculty', displayName: 'Dr. Aisha Khan', role: 'FACULTY', department: 'Computer Science' },
    { id: 'USR-STU-1', username: 'student', displayName: 'Ava Thompson', role: 'STUDENT', studentId: 'STU-2024-001', department: 'Computer Science' },
  ],
  students: [
    {
      studentId: 'STU-2024-001',
      fullName: 'Ava Thompson',
      email: 'ava.thompson@campus.edu',
      phone: '+1-555-0181',
      dob: '2003-08-14',
      department: 'Computer Science',
      batch: '2024',
      enrollmentDate: '2024-09-01',
      status: 'Active',
      initialGpa: 3.82,
      address: '42 Maple Avenue, Boston',
      emergencyContact: 'Mila Thompson - +1-555-0144',
      notes: 'Strong in software engineering projects.'
    },
    {
      studentId: 'STU-2024-002',
      fullName: 'Lucas Chen',
      email: 'lucas.chen@campus.edu',
      phone: '+1-555-0187',
      dob: '2002-11-25',
      department: 'Mechanical Engineering',
      batch: '2024',
      enrollmentDate: '2024-09-02',
      status: 'Probation',
      initialGpa: 2.91,
      address: '18 River Street, Austin',
      emergencyContact: 'Yun Chen - +1-555-0138',
      notes: 'Needs academic coaching in applied math.'
    },
    {
      studentId: 'STU-2024-003',
      fullName: 'Nora Patel',
      email: 'nora.patel@campus.edu',
      phone: '+1-555-0190',
      dob: '2004-03-09',
      department: 'Business Administration',
      batch: '2024',
      enrollmentDate: '2024-09-03',
      status: 'Active',
      initialGpa: 3.56,
      address: '29 Cedar Lane, Chicago',
      emergencyContact: 'Kiran Patel - +1-555-0112',
      notes: 'Excellent leadership and presentation skills.'
    }
  ],
  records: [
    { id: 'REC-101', userId: 'USR-STU-1', studentId: 'STU-2024-001', type: 'student_profile', title: 'Academic profile updated', createdAt: '2026-11-10T09:30:00.000Z' },
    { id: 'REC-102', userId: 'USR-FAC-1', studentId: 'STU-2024-002', type: 'attendance_alert', title: 'Attendance warning logged', createdAt: '2026-11-10T10:05:00.000Z' },
    { id: 'REC-103', userId: 'USR-ADMIN-1', studentId: 'STU-2024-003', type: 'fee_record', title: 'Fee ledger reviewed', createdAt: '2026-11-10T11:15:00.000Z' }
  ]
};

async function ensureDataStore() {
  try {
    await readFile(dataFile, 'utf8');
  } catch {
    await writeFile(dataFile, JSON.stringify(seedData, null, 2));
  }
}

async function readDataStore() {
  await ensureDataStore();
  const raw = await readFile(dataFile, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return JSON.parse(JSON.stringify(seedData));
  }
}

async function writeDataStore(store) {
  await writeFile(dataFile, JSON.stringify(store, null, 2));
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  response.end(JSON.stringify(payload));
}

async function parseBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8').trim();
      if (!body) return resolve({});

      try {
        return resolve(JSON.parse(body));
      } catch {
        try {
          const params = new URLSearchParams(body);
          return resolve(Object.fromEntries(params.entries()));
        } catch {
          return reject(new Error('Invalid request body'));
        }
      }
    });
    request.on('error', reject);
  });
}

async function handleApi(request, response) {
  const url = new URL(request.url, 'http://127.0.0.1');
  const pathname = decodeURIComponent(url.pathname);

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (pathname === '/api/health') {
    sendJson(response, 200, { status: 'ok', service: 'student-management-system-api' });
    return;
  }

  if (pathname === '/api/users' && request.method === 'GET') {
    const store = await readDataStore();
    sendJson(response, 200, { users: store.users });
    return;
  }

  if (pathname === '/api/students' && request.method === 'GET') {
    const store = await readDataStore();
    sendJson(response, 200, { students: store.students });
    return;
  }

  if (pathname === '/api/students' && request.method === 'POST') {
    const payload = await parseBody(request);
    const store = await readDataStore();
    const student = { ...payload, studentId: payload.studentId || `STU-${Date.now()}` };
    store.students.push(student);
    await writeDataStore(store);
    sendJson(response, 201, { success: true, student });
    return;
  }

  const studentMatch = pathname.match(/^\/api\/students\/([^/]+)$/);
  if (studentMatch) {
    const studentId = decodeURIComponent(studentMatch[1]);
    const store = await readDataStore();
    const student = store.students.find(item => item.studentId === studentId);

    if (!student && request.method !== 'POST') {
      sendJson(response, 404, { success: false, error: 'Student record not found' });
      return;
    }

    if (request.method === 'GET') {
      sendJson(response, 200, { student });
      return;
    }

    if (request.method === 'PUT') {
      const payload = await parseBody(request);
      const index = store.students.findIndex(item => item.studentId === studentId);
      if (index === -1) {
        sendJson(response, 404, { success: false, error: 'Student record not found' });
        return;
      }
      store.students[index] = { ...store.students[index], ...payload, studentId };
      await writeDataStore(store);
      sendJson(response, 200, { success: true, student: store.students[index] });
      return;
    }

    if (request.method === 'DELETE') {
      store.students = store.students.filter(item => item.studentId !== studentId);
      store.records = store.records.filter(item => item.studentId !== studentId);
      await writeDataStore(store);
      sendJson(response, 200, { success: true, deletedStudentId: studentId });
      return;
    }
  }

  const userRecordsMatch = pathname.match(/^\/api\/users\/([^/]+)\/records$/);
  if (userRecordsMatch) {
    const userId = decodeURIComponent(userRecordsMatch[1]);
    const store = await readDataStore();
    const user = store.users.find(item => item.id === userId);
    if (!user) {
      sendJson(response, 404, { success: false, error: 'User not found' });
      return;
    }

    const records = store.records.filter(record => record.userId === userId || (user.studentId && record.studentId === user.studentId));
    sendJson(response, 200, { user, records });
    return;
  }

  if (pathname === '/api/records' && request.method === 'GET') {
    const { userId, studentId } = Object.fromEntries(url.searchParams.entries());
    const store = await readDataStore();
    let filtered = store.records;
    if (userId) filtered = filtered.filter(record => record.userId === userId);
    if (studentId) filtered = filtered.filter(record => record.studentId === studentId);
    sendJson(response, 200, { records: filtered });
    return;
  }

  sendJson(response, 404, { success: false, error: 'API route not found' });
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.startsWith('/api/')) {
      await handleApi(request, response);
      return;
    }

    const requestedPath = path.resolve(root, `.${pathname}`);
    if (requestedPath !== root && !requestedPath.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    let filePath = requestedPath;
    try {
      if (!(await stat(filePath)).isFile()) filePath = path.join(root, 'index.html');
    } catch {
      filePath = path.join(root, 'index.html');
    }

    const content = await readFile(filePath);
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': content.length,
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(content);
  } catch (error) {
    console.error('Unable to serve request:', error);
    if (!response.headersSent) response.writeHead(500);
    response.end('Internal server error');
  }
});

server.on('error', error => {
  console.error(`Unable to start the local server on port ${port}:`, error.message);
  process.exitCode = 1;
});

server.listen(port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${port}`;
  console.log(`Student Management System is running at ${url}`);
  console.log(`API endpoints available under ${url}/api`);
  const browser = spawn('cmd.exe', ['/d', '/c', 'start', '', url], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  browser.on('error', error => console.warn('Could not open a browser automatically:', error.message));
  browser.unref();
});
