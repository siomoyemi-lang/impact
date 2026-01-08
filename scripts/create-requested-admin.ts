import { storage } from "../server/storage";
import { hashPassword } from "../server/auth-utils";

async function createAdmin() {
  const email = "siomoyemi@impacthouse.com";
  const password = Math.random().toString(36).slice(-10);
  
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    const hashedPassword = await hashPassword(password);
    await storage.updateUserPassword(existingUser.id, hashedPassword);
    console.log(`Admin user ${email} already exists. Password updated to: ${password}`);
  } else {
    const hashedPassword = await hashPassword(password);
    await storage.createUser({
      email,
      password: hashedPassword,
      name: "Siomoyemi Admin",
      role: "ADMIN"
    });
    console.log(`Admin user created: ${email}`);
    console.log(`Password: ${password}`);
  }
}

createAdmin().catch(console.error);
