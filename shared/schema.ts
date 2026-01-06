import { pgTable, text, serial, integer, boolean, timestamp, varchar, numeric, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Enums ---
export const userRoles = ["ADMIN", "PARENT"] as const;
export const billStatus = ["PENDING", "PAID"] as const;
export const receiptStatus = ["PENDING", "APPROVED", "REJECTED"] as const;

// --- Tables ---

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: userRoles }).notNull().default("PARENT"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  className: text("class_name").notNull(), // 'class' is reserved
  admissionNumber: text("admission_number").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const parentStudents = pgTable("parent_students", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull().references(() => parents.id),
  studentId: integer("student_id").notNull().references(() => students.id),
}, (t) => ({
  uniqueLink: uniqueIndex("unique_parent_student").on(t.parentId, t.studentId),
}));

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  amount: numeric("amount").notNull(),
  term: text("term").notNull(),
  description: text("description"), // For bill details
  status: text("status", { enum: billStatus }).notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull().references(() => bills.id),
  uploadedByParentId: integer("uploaded_by_parent_id").notNull().references(() => parents.id),
  fileUrl: text("file_url").notNull(),
  status: text("status", { enum: receiptStatus }).notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  term: text("term").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Relations ---

export const usersRelations = relations(users, ({ one }) => ({
  parent: one(parents, {
    fields: [users.id],
    references: [parents.userId],
  }),
}));

export const parentsRelations = relations(parents, ({ one, many }) => ({
  user: one(users, {
    fields: [parents.userId],
    references: [users.id],
  }),
  parentStudents: many(parentStudents),
  uploadedReceipts: many(receipts),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  parentStudents: many(parentStudents),
  bills: many(bills),
  results: many(results),
}));

export const parentStudentsRelations = relations(parentStudents, ({ one }) => ({
  parent: one(parents, {
    fields: [parentStudents.parentId],
    references: [parents.id],
  }),
  student: one(students, {
    fields: [parentStudents.studentId],
    references: [students.id],
  }),
}));

export const billsRelations = relations(bills, ({ one, many }) => ({
  student: one(students, {
    fields: [bills.studentId],
    references: [students.id],
  }),
  receipts: many(receipts),
}));

export const receiptsRelations = relations(receipts, ({ one }) => ({
  bill: one(bills, {
    fields: [receipts.billId],
    references: [bills.id],
  }),
  uploadedBy: one(parents, {
    fields: [receipts.uploadedByParentId],
    references: [parents.id],
  }),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  student: one(students, {
    fields: [results.studentId],
    references: [students.id],
  }),
}));

// --- Zod Schemas ---

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertParentSchema = createInsertSchema(parents).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true }).extend({
  parentEmail: z.string().email().optional(),
});
export const insertParentStudentSchema = createInsertSchema(parentStudents).omit({ id: true });
export const insertBillSchema = createInsertSchema(bills).omit({ id: true, createdAt: true });
export const insertReceiptSchema = createInsertSchema(receipts).omit({ id: true, createdAt: true, status: true }); // Status is set by admin
export const insertResultSchema = createInsertSchema(results).omit({ id: true, createdAt: true });

// --- Types ---
export type User = typeof users.$inferSelect;
export type Parent = typeof parents.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type Receipt = typeof receipts.$inferSelect;
export type Result = typeof results.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;
export type InsertResult = z.infer<typeof insertResultSchema>;
