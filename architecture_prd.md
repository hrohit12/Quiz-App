# QuizFlow: AI-Powered Learning Platform - Architecture & PRD

## 1. Overview
QuizFlow is a full-stack React/Node.js application designed to streamline quiz creation using AI (OpenRouter) and provide an engaging, competitive learning environment for students.

## 2. Architecture Overview
- **Frontend:** React (Next.js) with TailwindCSS for a responsive, modern UI.
- **Backend:** Node.js/Express REST API.
- **Database:** PostgreSQL (SQL) for relational data management.
- **Auth:** JWT-based authentication with role-based access (Student vs. Admin).
- **AI:** OpenRouter API integration for automated quiz generation.

## 3. Database Schema (PostgreSQL)

### Users Table
- `id`: UUID (PK)
- `email`: String (Unique)
- `password_hash`: String
- `role`: Enum ('student', 'admin')
- `full_name`: String
- `created_at`: Timestamp

### Quizzes Table
- `id`: UUID (PK)
- `title`: String
- `description`: Text
- `creator_id`: UUID (FK to Users)
- `status`: Enum ('draft', 'published')
- `created_at`: Timestamp

### Questions Table
- `id`: UUID (PK)
- `quiz_id`: UUID (FK to Quizzes)
- `question_text`: Text
- `options`: JSONB (Array of strings)
- `correct_answer`: String
- `points`: Integer

### Attempts Table
- `id`: UUID (PK)
- `user_id`: UUID (FK to Users)
- `quiz_id`: UUID (FK to Quizzes)
- `score`: Integer
- `time_taken`: Integer (seconds)
- `completed_at`: Timestamp

## 4. Folder Structure
```text
/root
  /client (React/Next.js)
    /components (UI components)
    /hooks (Custom hooks for state/data)
    /pages (App routes)
    /services (API client)
  /server (Node.js/Express)
    /controllers (Business logic)
    /models (DB queries)
    /routes (API endpoints)
    /middleware (Auth, validation)
    /utils (AI integration, helpers)
```

## 5. API Routes
- `POST /api/auth/register`: User signup
- `POST /api/auth/login`: User login
- `GET /api/quizzes`: List available quizzes
- `POST /api/quizzes/generate`: (Admin) Generate quiz via OpenRouter
- `POST /api/quizzes/submit`: Submit quiz answers
- `GET /api/leaderboard`: Get weekly top 5 performers
