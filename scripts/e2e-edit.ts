import fs from 'fs';

function loadEnv() {
  const p = './.env';
  if (!fs.existsSync(p)) return;
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    process.env[k] = v;
  }
}

loadEnv();

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const ADMIN_EMAIL = 'siomoyemi@gmail.com';
const ADMIN_PASSWORD = 'Admin123!@#';

async function run() {
  console.log('Base URL:', BASE);

  // login
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    redirect: 'manual',
  });

  if (!loginRes.ok) {
    console.error('Login failed', await loginRes.text());
    process.exit(1);
  }

  const setCookie = loginRes.headers.get('set-cookie');
  if (!setCookie) {
    console.error('No set-cookie from login');
    process.exit(1);
  }

  console.log('Logged in, cookie:', setCookie.split(';')[0]);

  // list students
  const studentsRes = await fetch(`${BASE}/api/admin/students`, {
    method: 'GET',
    headers: { Cookie: setCookie },
  });
  if (!studentsRes.ok) {
    console.error('Failed to fetch students', await studentsRes.text());
    process.exit(1);
  }
  const students = await studentsRes.json();
  if (!students || students.length === 0) {
    console.error('No students found to edit');
    process.exit(1);
  }

  const student = students[0];
  console.log('Editing student id', student.id, 'current name:', student.fullName);

  const newName = student.fullName + ' (edited)';
  const patchRes = await fetch(`${BASE}/api/admin/students/${student.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: setCookie },
    body: JSON.stringify({ fullName: newName }),
  });

  if (!patchRes.ok) {
    console.error('Failed to update student', await patchRes.text());
    process.exit(1);
  }

  const updated = await patchRes.json();
  console.log('Updated student:', updated);
}

run().catch((e) => { console.error(e); process.exit(1); });
