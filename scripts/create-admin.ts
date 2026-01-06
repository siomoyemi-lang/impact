import fs from "fs";

function loadEnv() {
  const p = "./.env";
  if (!fs.existsSync(p)) return;
  const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    process.env[k] = v;
  }
}

loadEnv();

import { hashPassword } from "../server/auth-utils";
import { storage } from "../server/storage";

async function main() {
  const email = "siomoyemi@impacthouse.com";
  const password = "Uydyrsjeahreaejtr3#";

  try {
    const existing = await storage.getUserByEmail(email);
    const hashed = await hashPassword(password);
    if (existing) {
      await storage.updateUserPassword(existing.id, hashed);
      console.log(`Updated password for existing user id ${existing.id}`);
    } else {
      const user = await storage.createUser({ email, password: hashed, role: "ADMIN" as any });
      console.log(`Created admin user id ${user.id}`);
    }

    // verify login via API
    const base = process.env.BASE_URL || "http://localhost:5000";
    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });
    console.log("Login verify status:", loginRes.status);
    console.log("Login verify body:", await loginRes.text());
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
