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

(async () => {
  try {
    const { hashPassword } = await import('../server/auth-utils');
    const { storage } = await import('../server/storage');

    const targetEmail = 'siomoyemi@gmail.com';
    const newPassword = 'DirectNewPass1!';

    const user = await storage.getUserByEmail(targetEmail);
    if (!user) {
      console.error('User not found:', targetEmail);
      process.exit(1);
    }

    const hashed = await hashPassword(newPassword);
    await storage.updateUserPassword(user.id, hashed);
    console.log('Password updated for user id', user.id);

    // verify via API login
    const base = process.env.BASE_URL || 'http://localhost:5000';
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: targetEmail, password: newPassword }),
    });
    console.log('Login verify status:', loginRes.status);
    console.log('Login verify body:', await loginRes.text());
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
