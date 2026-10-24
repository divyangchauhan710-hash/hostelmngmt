# HostelHub — Everyday Hostel Services Web Application

HostelHub is a complete, production-minded hostel management web application built with React, TypeScript, Tailwind CSS, Node.js, Express, and MongoDB.

It centralizes three everyday hostel services into one reliable, responsive platform:
1. **Cleanliness Management:** Students report facility and sanitation problems, track real-time resolution progression, and inspect complete maintenance histories.
2. **Mess & Canteen:** Students view daily and weekly dining menus, rate meals (1–5 stars) with duplicate-prevention, inspect calculated kitchen ratings, and check live canteen prices and availability in Indian Rupees (INR).
3. **Rector & Hostel Information:** Verified rector and warden contact cards with walk-in hours, official emergency guidance, rules, and circular notices.

---

## Visual Design & Aesthetics

- **Restrained Aesthetic:** Inspired by Linear, Stripe Dashboard, and Vercel. Soft off-white backgrounds, deep slate surfaces, subtle 1px borders, and a sophisticated deep teal accent palette (`#0f766e`).
- **Zero Emojis:** Strictly adheres to professional product design standards. Interface icons are exclusively consistent SVG icons from Lucide React.
- **Responsive Shell:** Fully optimized for mobile phones (360px–390px), tablets (768px), laptops (1024px–1280px), and desktops (1440px+).

---

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS with custom design tokens
- **Routing:** React Router v6
- **Forms & Validation:** React Hook Form with Zod schema validation
- **Icons:** Lucide React
- **Notifications:** Built-in accessible toast alert notification center

### Backend
- **Runtime:** Node.js (ES Modules) with TypeScript (tsx)
- **Framework:** Express.js REST API
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) with secure HTTP-only cookies and Bearer tokens
- **Security:** bcryptjs password hashing, role-based authorization middleware
- **File Uploads:** Multer with file type (JPEG, PNG, WebP) and 5MB size validation
- **Testing:** Vitest with Supertest integration test suite

---

## Configured Demonstration Accounts

HostelHub includes 1-click demo login buttons directly on the `/login` page and a quick **Role Switcher** in the top navigation bar to evaluate each user role:

| Role | Email | Password | Primary Permissions |
|---|---|---|---|
| **Student** | `student@hostelhub.local` | `Student@123` | Submit complaints, view own issues, rate meals, view menus & notices |
| **Rector / Warden** | `rector@hostelhub.local` | `Rector@123` | Complaint oversight, publish hostel notices, official contacts |
| **Housekeeping** | `housekeeping@hostelhub.local` | `Staff@123` | Manage cleanliness complaints, update ticket statuses, add notes |
| **Mess Staff** | `mess@hostelhub.local` | `Staff@123` | Edit 7-day weekly dining menu, timings, dietary notes |
| **Canteen Staff** | `canteen@hostelhub.local` | `Staff@123` | Toggle live item availability, update pricing in INR, add snacks |
| **Administrator** | `admin@hostelhub.local` | `Admin@123` | System overview, user directory, role assignments, full access |

---

## Application Routes

### Public Pages
- `/login` — Sign in with institutional credentials or 1-click demo accounts
- `/register` — Resident student account registration
- `/forgot-password` — Password reset instruction flow
- `/unauthorized` — Graceful access-denied page

### Student Services
- `/dashboard` — Personalized dashboard (Today's 4-meal menu, complaint counts, canteen preview, rector summary)
- `/cleanliness` — Cleanliness complaints list with filters (status, category, priority, search)
- `/cleanliness/new` — Report cleanliness issue with optional photo upload
- `/cleanliness/:id` — Complaint detail with 4-stage pipeline (`Submitted → Assigned → In Progress → Resolved`)
- `/mess` — 7-day weekly mess menu with day switcher tabs and dietary indicators
- `/reviews` — 1–5 star meal reviews with duplicate prevention and calculated breakdown bars
- `/canteen` — Cafeteria items with search, category filtering, and live availability labels
- `/hostel-info` — Emergency protocol guidance, notice board, and hostel rules
- `/rector` — Rector and warden directory with clickable `tel:` and `mailto:` links
- `/notifications` — In-app notification center with unread count and item links
- `/profile` — Student profile and room/emergency contact management

### Administration
- `/admin` — High-level operational overview & statistics
- `/admin/complaints` — Assign technicians and update complaint resolution statuses
- `/admin/menus` — Weekly mess menu editor & canteen items manager
- `/admin/reviews` — Student meal review moderation and deletion
- `/admin/contacts` — Rector, warden, clinic, and security contact details
- `/admin/notices` — Publish, pin, and delete circular hostel notices
- `/admin/users` — User directory and role privilege adjustments

---

## Installation and Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher (v24+ recommended)
- **MongoDB:** Local MongoDB instance running on port `27017` (e.g. `mongodb://127.0.0.1:27017/hostelhub`) or a cloud MongoDB connection string

### 1. Clone the repository
```bash
git clone https://github.com/divyangchauhan710-hash/hostelmngmt.git
cd hostelmngmt
```

### 2. Install dependencies
```bash
# Install root, backend, and frontend packages
npm run install:all
```

### 3. Configure environment variables
Create `.env` inside `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hostelhub
JWT_SECRET=hostelhub-dev-jwt-secret-key-2026-production-ready
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Seed the database with demonstration data
Populate realistic 7-day menus, cleanliness complaints, canteen items, notices, contacts, and accounts:
```bash
npm run seed
```

### 5. Start the development servers
Start both backend (port 5000) and frontend (port 5173) concurrently:
```bash
npm run dev
```

The frontend application will be accessible at:
```
http://localhost:5173
```

---

## Testing

Run the automated integration test suite covering authentication, role authorization, complaint workflows, duplicate review prevention, and admin routes:
```bash
npm test
```

To run only backend tests:
```bash
npm test --prefix backend
```

---

## Production Build

To compile both frontend and backend for production deployment:
```bash
npm run build
```

The compiled frontend bundle will be located in `frontend/dist/` and backend in `backend/dist/`.

---

## License

This project is licensed under the MIT License.
