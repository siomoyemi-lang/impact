# Impacthouse College - School Management Portal

## Overview

Impacthouse College is a full-stack school management portal designed for educational institutions. The application provides role-based access for administrators and parents, enabling student management, billing, receipt tracking, and academic result uploads. Administrators have full system control including user creation and receipt approvals, while parents can view their linked wards, bills, and academic results.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with Local Strategy, session-based auth using HTTP-only cookies
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **File Uploads**: Multer middleware with configurable upload directory
- **API Design**: RESTful endpoints with role-based middleware protection

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Managed via drizzle-kit with `db:push` command

### Project Structure
- `client/` - React frontend application
- `server/` - Express backend with routes, auth, and storage logic
- `shared/` - Shared types, schemas, and API route definitions
- `migrations/` - Database migration files

### Authentication Flow
1. Single login page for all users at `/auth`
2. Server validates credentials and returns user role
3. Client redirects based on role: ADMIN → `/admin/dashboard`, PARENT → `/parent/dashboard`
4. Protected routes enforce authentication and role-based access
5. Passwords hashed using scrypt with random salt

### Role-Based Access
- **ADMIN**: Full system access - manage students, parents, bills, receipts, results, and other admins
- **PARENT**: Limited access - view linked wards, bills, receipts, and academic results only

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage in PostgreSQL

### Authentication & Security
- **Passport.js**: Authentication middleware with Local Strategy
- **express-session**: Session management with secure cookie configuration

### File Storage
- **Multer**: File upload handling for PDFs, images (receipts, results)
- **Upload Directory**: Configurable via `UPLOAD_DIR` environment variable, defaults to `./uploads`

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Secret for session encryption (defaults to fallback in dev)
- `UPLOAD_DIR`: Directory for file uploads (optional, defaults to "uploads")
- `NODE_ENV`: Environment mode (development/production)

### Key NPM Dependencies
- `drizzle-orm` / `drizzle-kit`: Database ORM and migration tooling
- `@tanstack/react-query`: Server state management
- `zod` / `drizzle-zod`: Schema validation
- `bcrypt` or `scrypt`: Password hashing (implemented via crypto module)
- Radix UI primitives: Accessible component foundations