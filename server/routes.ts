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

  // Students
  app.get(api.admin.listStudents.path, requireAdmin, async (req, res) => {
    const students = await storage.getAllStudents();
    res.json(students);
  });

  app.post(api.admin.createStudent.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.createStudent.input.parse(req.body);
      const student = await storage.createStudent(input);
      res.status(201).json(student);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: (err as Error).message });
    }
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

  return httpServer;
}

async function seedAdmin() {
  const adminEmail = "siomoyemi@gmail.com";
  const existing = await storage.getUserByEmail(adminEmail);
  if (!existing) {
    const hashedPassword = await hashPassword("Admin123!@#"); // Strong temporary password
    await storage.createUser({
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN"
    });
    console.log("Seeded initial admin account");
  }
}
