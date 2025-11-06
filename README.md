# EdVisingU

This repository contains a Next.js frontend and a FastAPI backend. The instructions below show how to set up both projects locally on Windows PowerShell. 

Prerequisites
- Node.js and your package manager of choice (npm comes with Node)
- Python 3.10+ 
- Git

Frontend (Next.js)

Windows Powershell:

1. Open a PowerShell terminal and go to the frontend folder:
```
   cd frontend
```
2. Install dependencies:
```
   npm install
```
3. Run the dev server:
```
   npm run dev
```
Backend (FastAPI)

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
4. Install dependencies:
```
   pip install -r requirements.txt
```
6. Run the development server:
```
   uvicorn app.main:app --reload --port 8000
```
