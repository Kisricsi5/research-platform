# ResearchBridge

A platform connecting university students with professors for research opportunities.

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, TypeScript, Tailwind CSS  |
| Backend  | Node.js, Express, TypeScript        |
| ORM      | Prisma                              |
| Database | PostgreSQL                          |
| Auth     | JWT (access + refresh tokens)       |
| Email    | Nodemailer                          |

## Prerequisites

- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm or yarn

## Setup

### 1. Clone and install

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
- Set `DATABASE_URL` to your PostgreSQL connection string
- Set a strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Set SMTP credentials (use [Mailtrap](https://mailtrap.io) for development)
- Set `FRONTEND_URL=http://localhost:5173`

### 3. Set up the database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed          # optional: adds sample data
```

### 4. Run locally

Terminal 1 (backend):
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

Terminal 2 (frontend):
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

## Seed accounts

After running `npm run db:seed`:

| Role      | Email                          | Password    |
|-----------|--------------------------------|-------------|
| Professor | prof.smith@university.edu      | password123 |
| Professor | prof.johnson@university.edu    | password123 |
| Student   | student@university.edu         | password123 |

## Project Structure

```
research-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Seed data
│   └── src/
│       ├── config/              # Env, Prisma client
│       ├── controllers/         # Route handlers
│       ├── middleware/          # Auth, upload, error
│       ├── routes/              # Express routers
│       ├── types/               # TypeScript types
│       ├── utils/               # JWT, email, pagination
│       └── app.ts               # Express entry point
└── frontend/
    └── src/
        ├── api/                 # Axios API calls
        ├── components/          # Reusable UI components
        ├── context/             # Auth context
        ├── pages/               # Route-level pages
        ├── types/               # TypeScript types
        └── utils/               # Helpers
```

## API Endpoints

### Auth
| Method | Path                      | Description          |
|--------|---------------------------|----------------------|
| POST   | /api/auth/signup          | Create account       |
| POST   | /api/auth/login           | Sign in              |
| POST   | /api/auth/refresh         | Refresh access token |
| GET    | /api/auth/verify-email    | Verify email         |
| POST   | /api/auth/forgot-password | Request reset link   |
| POST   | /api/auth/reset-password  | Reset password       |
| GET    | /api/auth/me              | Get current user     |

### Public
| Method | Path                | Description              |
|--------|---------------------|--------------------------|
| GET    | /api/professors     | Browse/search professors |
| GET    | /api/professors/:id | Professor public profile |
| GET    | /api/projects       | Browse/search projects   |
| GET    | /api/projects/:id   | Project detail           |

### Student (authenticated)
| Method | Path                              | Description        |
|--------|-----------------------------------|--------------------|
| GET    | /api/student/profile              | Get own profile    |
| PUT    | /api/student/profile              | Update profile     |
| POST   | /api/student/cv                   | Upload CV          |
| POST   | /api/student/applications         | Submit application |
| GET    | /api/student/applications         | My applications    |
| GET    | /api/student/saved-professors     | Bookmarked profs   |
| POST   | /api/student/saved-professors     | Save professor     |
| DELETE | /api/student/saved-professors/:id | Remove bookmark    |

### Professor (authenticated)
| Method | Path                                  | Description            |
|--------|---------------------------------------|------------------------|
| GET    | /api/professor/profile                | Get own profile        |
| PUT    | /api/professor/profile                | Update profile         |
| GET    | /api/professor/dashboard              | Dashboard stats        |
| GET    | /api/professor/projects               | My projects            |
| POST   | /api/professor/projects               | Create project         |
| PUT    | /api/professor/projects/:id           | Update project         |
| DELETE | /api/professor/projects/:id           | Delete project         |
| GET    | /api/professor/applications           | Received applications  |
| GET    | /api/professor/applications/:id       | Application detail     |
| PUT    | /api/professor/applications/:id/status| Update status + notes  |

## Deployment

### Backend (Railway / Render)
1. Set environment variables in the platform dashboard
2. Set build command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
3. Set start command: `npm start`

### Frontend (Vercel / Netlify)
1. Set build command: `npm run build`
2. Set output directory: `dist`
3. Set env var: `VITE_API_URL` if not using Vite proxy

### Database
- Use [Railway](https://railway.app) or [Supabase](https://supabase.com) for a managed PostgreSQL instance
- Run `npx prisma migrate deploy` after each schema change
