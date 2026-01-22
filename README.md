# EdVisingU

This repository contains a Next.js frontend and a FastAPI backend for managing BSWD/CSG-DSE applications. The instructions below show how to set up both projects locally on Windows PowerShell. 

## Prerequisites
- Node.js and your package manager of choice (npm comes with Node)
- Python 3.11 
- Git
- Supabase account (for database and authentication)

## Quick Setup

### 1. Database Setup
Run the SQL migration in Supabase Dashboard > SQL Editor:
- Execute: `supabase/migrations/001_create_user_roles.sql`

### 2. Enable Authentication
In Supabase Dashboard:
- Go to Authentication > Providers
- Enable Email provider
- **Important for development**: Disable "Confirm email" to skip email verification

### 3. Create Admin User
After signing up through the app:
```sql
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Frontend (Next.js)

Windows Powershell:

1. Open a PowerShell terminal and go to the frontend folder:
```
   cd frontend
```
2. Install dependencies:
```
   npm install
```
3. Create `.env.local` file with your Supabase credentials:
```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
4. Run the dev server:
```
   npm run dev
```
5. Access the application:
   - Main app: http://localhost:3000
   - Login: http://localhost:3000/login
   - Sign up: http://localhost:3000/signup
   - Admin: http://localhost:3000/admin (requires admin role)

## Backend (FastAPI)

Windows PowerShell:

1. Open a PowerShell terminal and go to the backend folder:
```
   cd backend
```
2. Create a virtual environment and activate it USING PYTHON 3.11(get it here https://www.python.org/downloads/release/python-3119/):
```
   & "[PATH_TO_YOUR_PYTHON_3.11_EXE]" -m venv .venv  
   .venv\Scripts\Activate.ps1
```
3. Install dependencies:
```
   pip install -r requirements.txt
```
4. Run the development server:
```
   uvicorn app.main:app --reload --port 8000
```

## Features

- **User Authentication**: Login and account creation
- **Student Portal**: Multi-step BSWD/CSG-DSE application form
- **Admin Dashboard**: Review and manage applications with AI-powered analysis
- **Chatbot**: AI assistant for students and admins
- **Document Management**: Upload and manage supporting documents

## User Roles

- **Student** (default): Submit applications, check status
- **Admin**: Access admin dashboard, review applications
