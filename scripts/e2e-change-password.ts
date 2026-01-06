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
const NEW_PASSWORD = 'NewStrongPass1!';

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

  const cookie = setCookie.split(';')[0];
  console.log('Logged in, cookie:', cookie);

  // list admin users
  const usersRes = await fetch(`${BASE}/api/admin/users/ADMIN`, {
    method: 'GET',
    headers: { Cookie: cookie },
  });
  if (!usersRes.ok) {
    console.error('Failed to fetch users', await usersRes.text());
    process.exit(1);
  }
  const users = await usersRes.json();
  if (!users || users.length === 0) {
    console.error('No users found to change password');
    process.exit(1);
  }

  const user = users[0];
  console.log('Changing password for user id', user.id, 'email', user.email);

  const patchRes = await fetch(`${BASE}/api/admin/users/${user.id}/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ password: NEW_PASSWORD }),
  });

  if (!patchRes.ok) {
    console.error('Failed to change password', await patchRes.text());
    process.exit(1);
  }

  console.log('Password change status:', patchRes.status);
  const ct = (patchRes.headers.get('content-type') || '').toLowerCase();
  if (ct.includes('application/json')) {
    console.log('Password change response:', await patchRes.json());
  } else {
    const text = await patchRes.text();
    console.log('Password change response (text):', text);
  }

  // verify by logging in with new password (use a fresh session)
  const verifyRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user.email, password: NEW_PASSWORD }),
  });

  if (!verifyRes.ok) {
    console.error('Verification login failed', await verifyRes.text());
    process.exit(1);
  }

  console.log('Verification login succeeded for', user.email);
}

run().catch((e) => { console.error(e); process.exit(1); });
