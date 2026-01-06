import { db } from "./db";
import { 
  users, parents, students, parentStudents, bills, receipts, results,
  type User, type InsertUser, type Student, type InsertStudent, 
  type Bill, type InsertBill, type Receipt, type InsertReceipt, 
  type Result, type InsertResult, type Parent
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User & Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { role: "ADMIN" | "PARENT" }): Promise<User>;
  
  // Parent & Students
  createParent(userId: number): Promise<Parent>;
  getParentByUserId(userId: number): Promise<Parent | undefined>;
  getParentByEmail(email: string): Promise<Parent | undefined>; // Helper to find parent by user email
  createStudent(student: InsertStudent): Promise<Student>;
  getAllStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  linkParentToStudent(parentId: number, studentId: number): Promise<void>;
  getStudentsByParentId(parentId: number): Promise<Student[]>;
  
  // Bills
  createBill(bill: InsertBill): Promise<Bill>;
  getBillsByStudentId(studentId: number): Promise<Bill[]>;
  getAllBills(): Promise<(Bill & { student: Student })[]>; // Admin view
  getBill(id: number): Promise<Bill | undefined>;
  
  // Receipts
  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  getReceiptsByBillId(billId: number): Promise<Receipt[]>;
  getAllReceipts(): Promise<(Receipt & { bill: Bill, uploadedBy: Parent })[]>; // Admin view
  updateReceiptStatus(id: number, status: "APPROVED" | "REJECTED"): Promise<Receipt>;
  getReceipt(id: number): Promise<Receipt | undefined>;
  
  // Results
  createResult(result: InsertResult): Promise<Result>;
  getResultsByStudentId(studentId: number): Promise<Result[]>;
  getUsersByRole(role: "ADMIN" | "PARENT"): Promise<User[]>;
  
  // Session Store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  // --- User ---
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUsersByRole(role: "ADMIN" | "PARENT"): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role)).orderBy(desc(users.createdAt));
  }

  async createUser(user: InsertUser & { role: "ADMIN" | "PARENT" }): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // --- Parent & Student ---
  async createParent(userId: number): Promise<Parent> {
    const [parent] = await db.insert(parents).values({ userId }).returning();
    return parent;
  }

  async getParentByUserId(userId: number): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.userId, userId));
    return parent;
  }

  async getParentByEmail(email: string): Promise<Parent | undefined> {
    // Join users and parents to find parent by email
    const result = await db.select({
      parent: parents,
      user: users
    })
    .from(parents)
    .innerJoin(users, eq(parents.userId, users.id))
    .where(eq(users.email, email));
    
    return result[0]?.parent;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async getAllStudents(): Promise<(Student & { parentEmail?: string })[]> {
    const rows = await db.select({
      student: students,
      parentUser: users
    })
    .from(students)
    .leftJoin(parentStudents, eq(students.id, parentStudents.studentId))
    .leftJoin(parents, eq(parentStudents.parentId, parents.id))
    .leftJoin(users, eq(parents.userId, users.id))
    .orderBy(desc(students.createdAt));
    
    return rows.map(r => ({
      ...r.student,
      parentEmail: r.parentUser?.email || undefined
    }));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async linkParentToStudent(parentId: number, studentId: number): Promise<void> {
    await db.insert(parentStudents).values({ parentId, studentId }).onConflictDoNothing();
  }

  async getStudentsByParentId(parentId: number): Promise<Student[]> {
    const result = await db.select({
      student: students
    })
    .from(parentStudents)
    .innerJoin(students, eq(parentStudents.studentId, students.id))
    .where(eq(parentStudents.parentId, parentId));
    
    return result.map(r => r.student);
  }

  // --- Bills ---
  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db.insert(bills).values(bill).returning();
    return newBill;
  }

  async getBillsByStudentId(studentId: number): Promise<Bill[]> {
    return await db.select().from(bills).where(eq(bills.studentId, studentId)).orderBy(desc(bills.createdAt));
  }

  async getAllBills(): Promise<(Bill & { student: Student })[]> {
    const rows = await db.select({
      bill: bills,
      student: students
    })
    .from(bills)
    .innerJoin(students, eq(bills.studentId, students.id))
    .orderBy(desc(bills.createdAt));
    
    return rows.map(r => ({ ...r.bill, student: r.student }));
  }

  async getBill(id: number): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill;
  }

  // --- Receipts ---
  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const [newReceipt] = await db.insert(receipts).values(receipt).returning();
    
    // Auto-update bill status to PENDING (if logic requires, but requirements say approvals handle it)
    // Actually, receipt upload doesn't automatically mark bill as paid.
    
    return newReceipt;
  }

  async getReceiptsByBillId(billId: number): Promise<Receipt[]> {
    return await db.select().from(receipts).where(eq(receipts.billId, billId));
  }

  async getAllReceipts(): Promise<(Receipt & { bill: Bill, uploadedBy: Parent })[]> {
    const rows = await db.select({
      receipt: receipts,
      bill: bills,
      parent: parents
    })
    .from(receipts)
    .innerJoin(bills, eq(receipts.billId, bills.id))
    .innerJoin(parents, eq(receipts.uploadedByParentId, parents.id))
    .orderBy(desc(receipts.createdAt));
    
    return rows.map(r => ({ ...r.receipt, bill: r.bill, uploadedBy: r.parent }));
  }

  async updateReceiptStatus(id: number, status: "APPROVED" | "REJECTED"): Promise<Receipt> {
    const [updated] = await db.update(receipts)
      .set({ status })
      .where(eq(receipts.id, id))
      .returning();
      
    if (status === "APPROVED" && updated) {
      // Mark bill as PAID
      await db.update(bills).set({ status: "PAID" }).where(eq(bills.id, updated.billId));
    }
    
    return updated;
  }

  async getReceipt(id: number): Promise<Receipt | undefined> {
    const [receipt] = await db.select().from(receipts).where(eq(receipts.id, id));
    return receipt;
  }

  // --- Results ---
  async createResult(result: InsertResult): Promise<Result> {
    const [newResult] = await db.insert(results).values(result).returning();
    return newResult;
  }

  async getResultsByStudentId(studentId: number): Promise<Result[]> {
    return await db.select().from(results).where(eq(results.studentId, studentId)).orderBy(desc(results.createdAt));
  }
}

export const storage = new DatabaseStorage();
