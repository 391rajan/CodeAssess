# CodeAssess AI - Project Workflow and Architecture

## 🚀 Overview
**CodeAssess AI** is a modern, full-stack educational technology platform tailored for coding assessments and interactive learning. It allows students to solve programming problems in a browser-based IDE, test their solutions in a secure server-side playground, and receive intelligent, context-aware hints and code reviews powered by LLMs (Large Language Models). 

---

## 🛠️ Tech Stack & Frameworks

### **Frontend** (React + Vite ecosystem)
*   **Core**: **React 19** combined with **Vite**, offering lightning-fast cold server starts and instant hot module replacement (HMR).
*   **Routing**: **React Router DOM (v7)** handles seamless client-side page transitions without page reloads.
*   **Styling & UI**: 
    *   **Tailwind CSS**: A utility-first CSS framework for building modern and responsive layouts.
    *   **Lucide React**: For inserting scalable, clean SVG icons natively.
*   **Motion & Animation**: **Framer Motion** drives the premium feel of the platform (page transitions, staggered list animations, hover effects, and number counters).
*   **Code Editor**: **Monaco Editor** (`@monaco-editor/react`) powers the in-browser IDE, bringing the same robust code-editing experience found in VS Code (syntax highlighting, intelligent typing, etc.) natively to the web app.
*   **Notifications**: **React Hot Toast** manages toast notifications when users successfully save code, encounter errors, etc.

### **Backend** (Node.js ecosystem)
*   **Core**: **Node.js** with **Express.js** providing a robust and scalable REST API.
*   **Database Integration**: **MongoDB** with **Mongoose**. Mongoose maps JSON models to MongoDB documents (e.g., student accounts, problems, and submission history).
*   **Authentication & Security**: 
    *   **JWT (JSON Web Tokens)**: Issues secure cookies to manage the session state.
    *   **Bcrypt.js**: Cryptographically hashes user passwords before persisting them in the database.
*   **Code Execution Engine**: **Dockerode** is an essential piece. It programmatically manages isolated Docker containers to execute student code securely, preventing malicious loops or system access.
*   **AI Integrations**: 
    *   **@google/generative-ai**, **@anthropic-ai/sdk**, and **groq-sdk** are present to handle requests to various leading AI inference engines. They are leveraged for evaluating code, offering personalized hints, and providing code reviews.

---

## 🔄 Project Workflow (How it works)

**1. Authentication & Onboarding**
*   **Workflow**: A user (Student or Admin) navigates to the portal. The frontend sends their credentials to the backend via `/api/auth`.
*   **Action**: The server hashes the password (for signup) or verifies it via Bcrypt, and responds with an `httpOnly` secure JWT cookie, establishing the user session securely.

**2. Problem Browsing & Selection**
*   **Workflow**: The user enters the main dashboard. A request is made to `/api/problems`.
*   **Action**: The backend fetches all available problems from MongoDB and sends them to the frontend where they are animated into a staggered grid using Framer Motion.

**3. Interactive IDE & Development**
*   **Workflow**: Once a problem is selected, the user is presented with the Monaco Editor. They begin drafting a solution. 
*   **Action**: As they type, state is maintained in React. If they ask for a hint, the `/api/hints` endpoint is hit. The backend sends their *current* code and the problem details to an integrated LLM (e.g., Anthropic or Google Gemini) to stream back an incremental, contextual hint without giving away the direct answer.

**4. "Run Code" Sandbox (Testing without submitting)**
*   **Workflow**: The user hits "Run". The frontend sends the source code to `/api/run`.
*   **Action**: 
    *   The backend spins up a localized **Docker container** configured to run that specific language.
    *   It tests the user's code against the visual problem examples (dry-run).
    *   It returns standard output, time taken, or standard-error (syntax issues) directly to the user so they can adjust their code dynamically without penalizing their score.

**5. "Submit Code" (Grading)**
*   **Workflow**: The user hits "Submit". The code goes to the `/api/submit` endpoint.
*   **Action**: 
    *   The Docker runtime executes the code against a much larger suite of hidden test cases.
    *   Once pass/fail is determined, the backend saves an official "Submission" record in MongoDB. 
    *   If passed, it updates the student's metrics (problems solved, scores) and potentially requests the AI APIs to do a code-complexity review (Big-O analysis) to offer performance feedback.

**6. Admin Dashboard Management** 
*   **Workflow**: Site Administrators interact with `/api/admin` endpoints. 
*   **Action**: They have a control layer allowing them to seed new coding problems onto the platform, review overall student telemetry, and examine application usage metrics.
