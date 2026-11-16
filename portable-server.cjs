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
    { id: 'USR-ADMIN-1', username: 'admin', displayName: 'Dr. K. Muthusamy', role: 'ADMIN', department: 'Office of the Registrar' },
    { id: 'USR-FAC-1', username: 'faculty', displayName: 'Dr. Arulmozhi Selvan', role: 'FACULTY', department: 'Computer Science' },
    { id: 'USR-STU-1', username: '8115U25AD064', displayName: 'Kavin Rajendran', role: 'STUDENT', studentId: '8115U25AD064', department: 'Computer Science' },
  ],
  students: [
    {
      studentId: '8115U25AD064',
      fullName: 'Kavin Rajendran',
      email: 'kavin.rajendran@krce.edu.in',
      phone: '+91-9876501001',
      dob: '2003-08-14',
      department: 'Computer Science',
      batch: '2024',
      enrollmentDate: '2024-09-01',
      status: 'Active',
      initialGpa: 3.82,
      address: 'Trichy Tamil Nadu',
      emergencyContact: 'Rajendran - +91-9876502001',
      notes: 'Strong in software engineering projects.'
    },
    {
      studentId: '8115U25AD065',
      fullName: 'Nithya Ramesh',
      email: 'nithya.ramesh@krce.edu.in',
      phone: '+91-9876501002',
      dob: '2002-11-25',
      department: 'Mechanical Engineering',
      batch: '2024',
      enrollmentDate: '2024-09-02',
      status: 'Probation',
      initialGpa: 2.91,
      address: 'Thuraiyur Tamil Nadu',
      emergencyContact: 'Ramesh - +91-9876502002',
      notes: 'Needs academic coaching in applied math.'
    },
    {
      studentId: '8115U25AD066',
      fullName: 'Dharani Raj',
      email: 'dharani.raj@krce.edu.in',
      phone: '+91-9876501003',
      dob: '2004-03-09',
      department: 'Business Administration',
      batch: '2024',
      enrollmentDate: '2024-09-03',
      status: 'Active',
      initialGpa: 3.56,
      address: 'Musiri Tamil Nadu',
      emergencyContact: 'Raj - +91-9876502003',
      notes: 'Excellent leadership and presentation skills.'
    }
  ],
  records: [
    { id: 'REC-101', userId: 'USR-STU-1', studentId: '8115U25AD064', type: 'student_profile', title: 'Academic profile updated', createdAt: '2026-11-10T09:30:00.000Z' },
    { id: 'REC-102', userId: 'USR-FAC-1', studentId: '8115U25AD065', type: 'attendance_alert', title: 'Attendance warning logged', createdAt: '2026-11-10T10:05:00.000Z' },
    { id: 'REC-103', userId: 'USR-ADMIN-1', studentId: '8115U25AD066', type: 'fee_record', title: 'Fee ledger reviewed', createdAt: '2026-11-10T11:15:00.000Z' }
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

async function parseBody(request, maxBytes = Infinity) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;
    let exceededLimit = false;
    request.on('end', () => {
      if (exceededLimit) return;
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
    request.on('data', chunk => {
      if (exceededLimit) return;
      totalBytes += chunk.length;
      if (totalBytes > maxBytes) {
        exceededLimit = true;
        reject(Object.assign(new Error('Request body is too large'), { statusCode: 413 }));
        return;
      }
      chunks.push(chunk);
    });
    request.on('error', reject);
  });
}

function getProjectAssistantContext(input) {
  const context = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const courseCatalog = Array.isArray(context.courseCatalog)
    ? context.courseCatalog.slice(0, 20).flatMap(course => {
        if (!course || typeof course !== 'object') return [];
        const title = typeof course.title === 'string' ? course.title.slice(0, 100) : '';
        const fee = Number(course.semesterFee);
        return title && Number.isFinite(fee) && fee >= 0
          ? [{ title, semesterFeeINR: fee }]
          : [];
      })
    : [];
  const activeSection = typeof context.activeSection === 'string'
    ? context.activeSection.slice(0, 40)
    : 'Dashboard';
  const studentCount = Number.isInteger(context.studentCount) && context.studentCount >= 0
    ? Math.min(context.studentCount, 10000)
    : 0;
  const averageAttendance = Number.isFinite(context.averageAttendance)
    ? Math.max(0, Math.min(100, context.averageAttendance))
    : null;
  const outstandingBalanceINR = Number.isFinite(context.outstandingBalanceINR)
    ? Math.max(0, context.outstandingBalanceINR)
    : null;

  return { activeSection, studentCount, courseCatalog, averageAttendance, outstandingBalanceINR };
}

async function handleProjectAssistant(request, response) {
  const origin = request.headers.origin;
  let originHost;
  try {
    originHost = origin ? new URL(origin).host : null;
  } catch {
    originHost = null;
  }
  if (origin && (!originHost || originHost !== request.headers.host)) {
    sendJson(response, 403, { success: false, error: 'The project assistant only accepts requests from this application.' });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    sendJson(response, 503, {
      success: false,
      error: 'The assistant is not configured. Set OPENROUTER_API_KEY in the local server environment and restart the app.'
    });
    return;
  }

  let payload;
  try {
    payload = await parseBody(request, 16 * 1024);
  } catch (error) {
    const statusCode = error.statusCode || 400;
    sendJson(response, statusCode, { success: false, error: statusCode === 413 ? 'Chat request is too large.' : 'Invalid chat request.' });
    return;
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !Array.isArray(payload.messages) || payload.messages.length < 1 || payload.messages.length > 12) {
    sendJson(response, 400, { success: false, error: 'Send between 1 and 12 recent chat messages.' });
    return;
  }

  const messages = [];
  for (const message of payload.messages) {
    if (
      !message ||
      !['user', 'assistant'].includes(message.role) ||
      typeof message.content !== 'string' ||
      !message.content.trim() ||
      message.content.length > 1500
    ) {
      sendJson(response, 400, { success: false, error: 'Each chat message must contain valid text no longer than 1,500 characters.' });
      return;
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }

  const context = getProjectAssistantContext(payload.context);
  const systemPrompt = [
    'You are the Student Management System ERP project assistant.',
    'Answer questions only about this local KRCE/State University ERP project, its dashboard, available modules, course catalog, Tamil Nadu demo dataset, INR semester fees, grades, attendance, fee ledger, calendar, and application usage.',
    'If a request is unrelated to this project, politely say you can only help with this ERP project and suggest a relevant project topic.',
    'Use only the supplied context and your general knowledge about explaining the listed ERP features. Never claim access to student records, source code, credentials, or data not included here. Do not invent student-specific information.',
    'Do not ask for or reveal passwords, API keys, or other credentials. Keep answers concise, practical, and clear.',
    `Current anonymous project summary: ${JSON.stringify(context)}`
  ].join(' ');

  try {
    const upstreamResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': `http://127.0.0.1:${port}`,
        'X-Title': 'Student Management System ERP Assistant'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 500,
        temperature: 0.3
      }),
      signal: AbortSignal.timeout(30000)
    });
    const result = await upstreamResponse.json();
    if (!upstreamResponse.ok) {
      console.error('OpenRouter assistant request failed with status:', upstreamResponse.status);
      sendJson(response, 502, { success: false, error: 'The AI provider could not complete this request. Check the local server configuration and try again.' });
      return;
    }

    const reply = result.choices?.[0]?.message?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      sendJson(response, 502, { success: false, error: 'The AI provider returned an empty reply. Please try again.' });
      return;
    }

    sendJson(response, 200, { success: true, reply: reply.trim() });
  } catch (error) {
    console.error('OpenRouter assistant connection failed:', error.message);
    sendJson(response, 502, { success: false, error: 'Could not reach the AI provider. Check the connection and try again.' });
  }
}

async function handleApi(request, response) {
  const url = new URL(request.url, 'http://127.0.0.1');
  const pathname = decodeURIComponent(url.pathname);

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (pathname === '/api/project-assistant') {
    if (request.method !== 'POST') {
      sendJson(response, 405, { success: false, error: 'Use POST to send a chat message.' });
      return;
    }
    await handleProjectAssistant(request, response);
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

const host = process.env.HOST || '127.0.0.1';
server.listen(port, host, () => {
  const displayHost = host === '0.0.0.0' ? 'localhost' : host;
  const url = `http://${displayHost}:${port}`;
  console.log(`Student Management System is running at ${url}`);
  console.log(`API endpoints available under ${url}/api`);
  if (process.platform === 'win32' && host === '127.0.0.1') {
    const browser = spawn('cmd.exe', ['/d', '/c', 'start', '', url], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    browser.on('error', error => console.warn('Could not open a browser automatically:', error.message));
    browser.unref();
  }
});
