import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth } from "./auth";
import { hashPassword } from "./auth-utils";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import passport from "passport";

// Multer setup
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageMulter = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storageMulter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth setup (Passport)
  setupAuth(app);

  // --- Auth Routes ---
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ id: user.id, email: user.email, role: user.role });
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user as any;
    res.json({ id: user.id, email: user.email, role: user.role });
  });


  // --- Middleware ---
  const requireAdmin = (req: Request, res: any, next: any) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
  };

  const requireTeacher = (req: Request, res: any, next: any) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "TEACHER") {
      return res.status(403).json({ message: "Forbidden: Teachers only" });
    }
    next();
  };

  const requireAccounting = (req: Request, res: any, next: any) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "ACCOUNTING") {
      return res.status(403).json({ message: "Forbidden: Accounting only" });
    }
    next();
  };

  const requireParent = (req: Request, res: any, next: any) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "PARENT") {
      return res.status(403).json({ message: "Forbidden: Parents only" });
    }
    next();
  };

  // --- Admin Routes ---

  // Create another admin
  app.post(api.admin.createAdmin.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.createAdmin.input.parse(req.body);
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword, role: "ADMIN" });
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Create parent
  app.post(api.admin.createParent.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.createParent.input.parse(req.body);
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword, role: "PARENT" });
      await storage.createParent(user.id);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Create teacher
  app.post("/api/admin/users/teacher", requireAdmin, async (req, res) => {
    try {
      const input = api.admin.createAdmin.input.parse(req.body); // reuse same schema
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword, role: "TEACHER" });
      await storage.createTeacher(user.id);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Create accounting
  app.post("/api/admin/users/accounting", requireAdmin, async (req, res) => {
    try {
      const input = api.admin.createAdmin.input.parse(req.body); // reuse same schema
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword, role: "ACCOUNTING" });
      await storage.createAccounting(user.id);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Change any user's password (admin only)
  app.patch(api.admin.changeUserPassword.path, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.admin.changeUserPassword.input.parse(req.body);
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const hashed = await hashPassword(input.password);
      await storage.updateUserPassword(id, hashed);
      res.json({ message: 'Password updated' });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Update user details (email)
  app.patch(api.admin.updateUser.path, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.admin.updateUser.input.parse(req.body);
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (input.email) {
        const updated = await storage.updateUserEmail(id, input.email);
        res.json(updated);
      } else {
        res.status(400).json({ message: 'No fields to update' });
      }
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Delete user
  app.delete(api.admin.deleteUser.path, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      await storage.deleteUser(id);
      res.json({ message: 'User deleted' });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Students
  app.get(api.admin.listStudents.path, requireAdmin, async (req, res) => {
    const students = await storage.getAllStudents();
    res.json(students);
  });

  app.post(api.admin.createStudent.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.createStudent.input.parse(req.body);
      const { parentEmail, ...studentData } = input;
      
      if (parentEmail) {
        const parent = await storage.getParentByEmail(parentEmail);
        if (!parent) {
          return res.status(404).json({ message: `No parent found with email: ${parentEmail}. Please create the parent account first.` });
        }
        const student = await storage.createStudent(studentData);
        await storage.linkParentToStudent(parent.id, student.id);
        res.status(201).json(student);
      } else {
        const student = await storage.createStudent(studentData);
        res.status(201).json(student);
      }
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Update student
  app.patch(api.admin.updateStudent.path, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.admin.updateStudent.input.parse(req.body);
      const { parentEmail, ...studentData } = input as any;
      const exists = await storage.getStudent(id);
      if (!exists) return res.status(404).json({ message: 'Student not found' });

      const updated = await storage.updateStudent(id, studentData as any);

      if (parentEmail) {
        const parent = await storage.getParentByEmail(parentEmail);
        if (!parent) return res.status(404).json({ message: `No parent found with email: ${parentEmail}.` });
        await storage.linkParentToStudent(parent.id, id);
      }

      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: (err as Error).message });
    }
  });

    // Delete student
    app.delete(api.admin.deleteStudent.path, requireAdmin, async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const exists = await storage.getStudent(id);
        if (!exists) return res.status(404).json({ message: 'Student not found' });
        await storage.deleteStudent(id);
        res.json({ message: 'Student deleted' });
      } catch (err) {
        res.status(500).json({ message: (err as Error).message });
      }
    });

  app.get(api.admin.listUsersByRole.path, requireAdmin, async (req, res) => {
    const role = req.params.role as "ADMIN" | "PARENT" | "TEACHER" | "ACCOUNTING";
    if (role !== "ADMIN" && role !== "PARENT" && role !== "TEACHER" && role !== "ACCOUNTING") return res.status(400).json({ message: "Invalid role" });
    const users = await storage.getUsersByRole(role);
    res.json(users);
  });

  app.post(api.admin.linkParent.path, requireAdmin, async (req, res) => {
    try {
      const { parentEmail, studentId } = api.admin.linkParent.input.parse(req.body);
      const parent = await storage.getParentByEmail(parentEmail);
      if (!parent) return res.status(404).json({ message: "Parent not found with that email" });
      
      await storage.linkParentToStudent(parent.id, studentId);
      res.json({ message: "Linked successfully" });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Bills
  app.get(api.admin.listBills.path, requireAdmin, async (req, res) => {
    const bills = await storage.getAllBills();
    res.json(bills);
  });

  app.post(api.admin.createBill.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.createBill.input.parse(req.body);
      const bill = await storage.createBill(input);
      res.status(201).json(bill);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // Receipts
  app.get(api.admin.listReceipts.path, requireAdmin, async (req, res) => {
    const receipts = await storage.getAllReceipts();
    res.json(receipts);
  });

  app.patch(api.admin.updateReceiptStatus.path, requireAdmin, async (req, res) => {
    try {
      const { status } = api.admin.updateReceiptStatus.input.parse(req.body);
      const id = parseInt(req.params.id);
      const receipt = await storage.updateReceiptStatus(id, status);
      res.json(receipt);
    } catch (err) {
       if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
       res.status(500).json({ message: (err as Error).message });
    }
  });

  // Results Upload
  app.post(api.admin.uploadResult.path, requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      
      // We need to parse body manually since it's multipart
      // Assuming studentId and term are sent as form fields
      const studentId = parseInt(req.body.studentId);
      const term = req.body.term;
      
      if (!studentId || !term) return res.status(400).json({ message: "studentId and term are required" });

      const result = await storage.createResult({
        studentId,
        term,
        fileUrl: `/uploads/${req.file.filename}`
      });
      res.status(201).json(result);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });

  // --- Parent Routes ---

  app.get(api.parent.listWards.path, requireParent, async (req, res) => {
    const parent = await storage.getParentByUserId((req.user as any).id);
    if (!parent) return res.status(404).json({ message: "Parent profile not found" });
    const students = await storage.getStudentsByParentId(parent.id);
    res.json(students);
  });

  app.get(api.parent.listBills.path, requireParent, async (req, res) => {
    const parent = await storage.getParentByUserId((req.user as any).id);
    if (!parent) return res.status(404).json({ message: "Parent profile not found" });
    const students = await storage.getStudentsByParentId(parent.id);
    
    let allBills: any[] = [];
    for (const student of students) {
      const bills = await storage.getBillsByStudentId(student.id);
      allBills = [...allBills, ...bills.map(b => ({...b, student}))];
    }
    res.json(allBills);
  });

  app.post(api.parent.uploadReceipt.path, requireParent, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const parent = await storage.getParentByUserId((req.user as any).id);
      if (!parent) return res.status(404).json({ message: "Parent profile not found" });

      const billId = parseInt(req.body.billId);
      if (!billId) return res.status(400).json({ message: "billId is required" });
      
      // Verify ownership of the bill (bill -> student -> parent)
      const bill = await storage.getBill(billId);
      if (!bill) return res.status(404).json({ message: "Bill not found" });
      
      const wards = await storage.getStudentsByParentId(parent.id);
      if (!wards.find(w => w.id === bill.studentId)) {
         return res.status(403).json({ message: "This bill does not belong to your ward" });
      }

      const receipt = await storage.createReceipt({
        billId,
        uploadedByParentId: parent.id,
        fileUrl: `/uploads/${req.file.filename}`
      });
      res.status(201).json(receipt);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });

  app.get(api.parent.listResults.path, requireParent, async (req, res) => {
    const parent = await storage.getParentByUserId((req.user as any).id);
    if (!parent) return res.status(404).json({ message: "Parent profile not found" });
    
    const studentId = parseInt(req.params.studentId);
    
    // Verify ownership
    const wards = await storage.getStudentsByParentId(parent.id);
    if (!wards.find(w => w.id === studentId)) {
       return res.status(403).json({ message: "This student is not linked to you" });
    }

    const results = await storage.getResultsByStudentId(studentId);
    res.json(results);
  });
  
  // Serve uploaded files securely (requires auth)
  app.get('/uploads/:filename', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send('Unauthorized');
    const filepath = path.join(uploadDir, req.params.filename);
    res.sendFile(filepath);
  });


  // --- Seed Data ---
  await seedAdmin();
  await seedDemoRoles();

  return httpServer;
}

async function seedDemoRoles() {
  const roles = [
    { email: "teacher@impacthouse.com", role: "TEACHER" as const },
    { email: "accounting@impacthouse.com", role: "ACCOUNTING" as const }
  ];
  const password = await hashPassword("kjbhjashjc@@WW222");

  for (const r of roles) {
    const existing = await storage.getUserByEmail(r.email);
    if (!existing) {
      const user = await storage.createUser({ email: r.email, password, role: r.role });
      if (r.role === "TEACHER") await storage.createTeacher(user.id);
      if (r.role === "ACCOUNTING") await storage.createAccounting(user.id);
      console.log(`Seeded ${r.role} account: ${r.email}`);
    }
  }
}

async function seedAdmin() {
  const adminEmail = "siomoyemi@impacthouse.com";
  const existing = await storage.getUserByEmail(adminEmail);
  const password = "kjbhjashjc@@WW222";
  const hashedPassword = await hashPassword(password);
  
  if (!existing) {
    await storage.createUser({
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN"
    });
    console.log(`Seeded admin account: ${adminEmail}`);
  } else {
    // Update existing user to ensure password and role are correct
    await storage.updateUserPassword(existing.id, hashedPassword);
    // Role update if needed (assuming storage has a way or just direct DB)
    console.log(`Updated admin account: ${adminEmail}`);
  }
}
