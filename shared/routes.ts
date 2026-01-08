import { z } from 'zod';
import { 
  insertUserSchema, 
  insertStudentSchema, 
  insertBillSchema, 
  insertResultSchema,
  users,
  students,
  bills,
  receipts,
  results,
  parents,
  userRoles
} from './schema';

// Shared error schemas
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// --- API Contract ---

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
      input: z.object({
        username: z.string().email("Invalid email address"), // Using 'username' for passport compatibility
        password: z.string().min(1, "Password is required"),
      }),
      responses: {
        200: z.object({ 
          id: z.number(), 
          email: z.string(), 
          role: z.enum(userRoles) 
        }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
      responses: {
        200: z.object({ 
          id: z.number(), 
          email: z.string(), 
          role: z.enum(userRoles) 
        }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  
  // --- Admin Routes ---
  admin: {
    createAdmin: {
      method: 'POST' as const,
      path: '/api/admin/users/admin',
      input: insertUserSchema.pick({ email: true, password: true }).extend({
        password: z.string()
          .min(12, "Password must be at least 12 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[0-9]/, "Password must contain at least one number")
          .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol")
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    createParent: {
      method: 'POST' as const,
      path: '/api/admin/users/parent',
      input: insertUserSchema.pick({ email: true, password: true }).extend({
        password: z.string()
          .min(12, "Password must be at least 12 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[0-9]/, "Password must contain at least one number")
          .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol")
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    createTeacher: {
      method: 'POST' as const,
      path: '/api/admin/users/teacher',
      input: insertUserSchema.pick({ email: true, password: true }).extend({
        password: z.string()
          .min(12, "Password must be at least 12 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[0-9]/, "Password must contain at least one number")
          .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol")
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    createAccounting: {
      method: 'POST' as const,
      path: '/api/admin/users/accounting',
      input: insertUserSchema.pick({ email: true, password: true }).extend({
        password: z.string()
          .min(12, "Password must be at least 12 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[0-9]/, "Password must contain at least one number")
          .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol")
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listStudents: {
      method: 'GET' as const,
      path: '/api/admin/students',
      responses: {
        200: z.array(z.custom<typeof students.$inferSelect & { parentEmail?: string }>()),
      },
    },
    createStudent: {
      method: 'POST' as const,
      path: '/api/admin/students',
      input: insertStudentSchema,
      responses: {
        201: z.custom<typeof students.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    updateStudent: {
      method: 'PATCH' as const,
      path: '/api/admin/students/:id',
      input: insertStudentSchema.partial(),
      responses: {
        200: z.custom<typeof students.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    deleteStudent: {
      method: 'DELETE' as const,
      path: '/api/admin/students/:id',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    changeUserPassword: {
      method: 'PATCH' as const,
      path: '/api/admin/users/:id/password',
      input: z.object({ password: z.string().min(12) }),
      responses: {
        200: z.object({ message: z.string() }),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    updateUser: {
      method: 'PATCH' as const,
      path: '/api/admin/users/:id',
      input: z.object({ email: z.string().email() }).partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    deleteUser: {
      method: 'DELETE' as const,
      path: '/api/admin/users/:id',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    linkParent: {
      method: 'POST' as const,
      path: '/api/admin/link-parent',
      input: z.object({
        parentEmail: z.string().email(),
        studentId: z.number(),
      }),
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    createBill: {
      method: 'POST' as const,
      path: '/api/admin/bills',
      input: insertBillSchema,
      responses: {
        201: z.custom<typeof bills.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listBills: { // All bills overview
      method: 'GET' as const,
      path: '/api/admin/bills',
      responses: {
        200: z.array(z.custom<typeof bills.$inferSelect & { student: typeof students.$inferSelect }>()),
      },
    },
    uploadResult: {
      method: 'POST' as const,
      path: '/api/admin/results',
      input: insertResultSchema,
      responses: {
        201: z.custom<typeof results.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listReceipts: {
      method: 'GET' as const,
      path: '/api/admin/receipts',
      responses: {
        200: z.array(z.custom<typeof receipts.$inferSelect & { bill: typeof bills.$inferSelect, uploadedBy: typeof parents.$inferSelect }>()),
      },
    },
    listUsersByRole: {
      method: 'GET' as const,
      path: '/api/admin/users/:role',
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    updateReceiptStatus: {
      method: 'PATCH' as const,
      path: '/api/admin/receipts/:id',
      input: z.object({ status: z.enum(["APPROVED", "REJECTED"]) }),
      responses: {
        200: z.custom<typeof receipts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // --- Parent Routes ---
  parent: {
    listWards: {
      method: 'GET' as const,
      path: '/api/parent/wards',
      responses: {
        200: z.array(z.custom<typeof students.$inferSelect>()),
      },
    },
    listBills: {
      method: 'GET' as const,
      path: '/api/parent/bills',
      responses: {
        200: z.array(z.custom<typeof bills.$inferSelect & { student: typeof students.$inferSelect }>()),
      },
    },
    uploadReceipt: {
      method: 'POST' as const,
      path: '/api/parent/receipts',
      // Input is FormData, simpler schema here for the JSON response
      input: z.object({ billId: z.coerce.number() }), 
      responses: {
        201: z.custom<typeof receipts.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listResults: {
      method: 'GET' as const,
      path: '/api/parent/results/:studentId',
      responses: {
        200: z.array(z.custom<typeof results.$inferSelect>()),
        403: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type LoginInput = z.infer<typeof api.auth.login.input>;
export type UserResponse = z.infer<typeof api.auth.login.responses[200]>;
