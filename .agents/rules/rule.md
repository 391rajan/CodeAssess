---
trigger: always_on
---

## CodeAssess AI — Project Rules

TECH STACK:

- Frontend: React + Vite + TailwindCSS + Monaco Editor
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Code execution: Docker via dockerode npm package
- Auth: JWT + bcrypt

STYLING RULES:

- Always use TailwindCSS. Never write raw CSS except for backdrop-filter glass effects.
- Page background: #0a0a0f
- Primary color (buttons): #7C3AED (electric purple)
- Accent color (badges, highlights): #06B6D4 (cyan)
- All cards use glassmorphism: background rgba(255,255,255,0.05),
  border 1px solid rgba(255,255,255,0.1), backdrop-filter blur(16px), border-radius 16px
- Monaco Editor font must always be Fira Code at 14px. Never change this.

BACKEND RULES:

- Every API route must return exactly this shape: { success, data, error }
- Docker container must always be destroyed inside a finally{} block, even if execution fails
- Never send hidden test cases to the frontend under any circumstances
- Supported languages: Python (python:3.11-slim), Java (openjdk:17), C++ (gcc:latest)
- Enforce 5-second timeout and 256MB memory limit on every container

AI FEEDBACK RULES:

- LLM prompt must always instruct the model to return JSON only — no extra prose, no markdown
- Expected JSON shape: { time_complexity, space_complexity, overall_rating,
  bugs_or_code_smells[], optimization_tips[], style_feedback }

GENERAL RULES:

- Never change mobile font sizes
- Every new feature must include proper error handling
- Guest users can attempt problems but their submissions are not saved to the database
