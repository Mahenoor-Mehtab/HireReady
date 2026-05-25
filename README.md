<div align="center">
<br />

```
██╗  ██╗██╗██████╗ ███████╗██████╗ ███████╗ █████╗ ██████╗ ██╗   ██╗
██║  ██║██║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝
███████║██║██████╔╝█████╗  ██████╔╝█████╗  ███████║██║  ██║ ╚████╔╝ 
██╔══██║██║██╔══██╗██╔══╝  ██╔══██╗██╔══╝  ██╔══██║██║  ██║  ╚██╔╝  
██║  ██║██║██║  ██║███████╗██║  ██║███████╗██║  ██║██████╔╝   ██║   
╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝   
```

### 🚀 AI-Powered Resume Builder & Interview Prep Platform

**Paste a Job Description. Get an ATS-Optimized Resume. Ace the Interview.**

<br />

[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Claude AI](https://img.shields.io/badge/Claude-AI_Powered-CC785C?style=for-the-badge)](https://anthropic.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

<br />

[🚀 Live Demo](#) · [📖 Documentation](#) · [🐛 Report Bug](#) · [💡 Request Feature](#)

<br />
</div>

---

## 🤔 What is HireReady?

**HireReady** is a full-stack MERN application that helps job seekers land their dream job faster.

You paste a Job Description — HireReady analyzes it, builds a tailored **ATS-optimized resume**, gives you an **ATS score**, prepares **interview questions**, and even lets you practice with an **AI chatbot** — all in one place.

> *"Stop applying with generic resumes. Start applying with resumes built for the job."*

---

## ✨ Features

### 🔴 Core Features (MVP)

| Feature | Description |
|---|---|
| **JD Analyzer** | Paste any Job Description — AI extracts top keywords, skills & priorities |
| **Resume Builder** | Upload existing resume OR fill a form — both paths supported |
| **ATS Resume Generator** | AI generates a clean, ATS-friendly resume tailored to the JD |
| **ATS Score Checker** | See how well your resume matches the JD (percentage score) |
| **Interview Prep** | Get role-specific interview questions with suggested answers |
| **PDF Download** | Download your generated resume as a clean PDF instantly |
| **User Auth** | Secure Signup / Login with JWT authentication |

### 🟡 Smart Features

| Feature | Description |
|---|---|
| **AI Chatbot** | Context-aware assistant that knows your JD + Resume — ask anything |
| **Skills Gap Analysis** | See exactly which skills from the JD are missing in your resume |
| **Cover Letter Generator** | Auto-generate a cover letter based on JD + your resume |
| **Resume History** | All your generated resumes saved — revisit anytime |

### 🔥 Unique Features

| Feature | Description |
|---|---|
| **Resume Roaster** | Get brutally honest AI feedback on your resume — then fix it |
| **Salary Estimator** | AI estimates salary range based on JD + your experience + location |
| **JD Comparator** | Paste multiple JDs — AI ranks which one fits your profile best |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | Core frontend framework |
| Tailwind CSS | Styling |
| React Router DOM | Client-side routing |
| React Hook Form | Form handling |
| Zustand | Global state management |
| TanStack Query | Server state & data fetching |
| Axios | HTTP requests |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT + bcryptjs | Authentication & password hashing |
| Multer | File uploads (resume PDF/DOCX) |
| pdf-parse | Extract text from uploaded PDFs |

### AI Layer
| Technology | Purpose |
|---|---|
| Claude API (Anthropic) | Resume generation, ATS scoring, interview prep, chatbot |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         React 18 Frontend (Vite)        │
│   Zustand · React Query · Tailwind CSS  │
└──────────────────┬──────────────────────┘
                   │ REST API (HTTP)
┌──────────────────▼──────────────────────┐
│        Node.js + Express Backend        │
│    JWT Auth · Multer · pdf-parse        │
└───────────┬──────────────┬──────────────┘
            │              │
┌───────────▼────┐  ┌──────▼───────────────┐
│  Claude AI API │  │  MongoDB Atlas        │
│  (Anthropic)   │  │  Users · Resumes      │
│  Resume Gen    │  │  Sessions · History   │
│  ATS Score     │  └──────────────────────┘
│  Interview Q   │
│  Chatbot       │
└────────────────┘
```

---

## 📁 Project Structure

```
hireready/
│
├── client/                        → React + Vite Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── JDInput.jsx
│   │   │   ├── ResumeBuilder.jsx
│   │   │   └── InterviewPrep.jsx
│   │   ├── components/
│   │   │   ├── Chatbot.jsx        → Floating AI chatbot
│   │   │   ├── ATSScore.jsx       → Score display
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/              → All API call functions
│   │   ├── store/                 → Zustand global state
│   │   └── App.jsx
│   ├── .env
│   └── package.json
│
└── server/                        → Node + Express Backend
    ├── controllers/
    │   ├── authController.js
    │   ├── resumeController.js
    │   ├── jdController.js
    │   ├── interviewController.js
    │   └── chatController.js
    ├── models/
    │   ├── User.js
    │   ├── Resume.js
    │   └── Session.js
    ├── routes/
    │   ├── auth.js
    │   ├── resume.js
    │   ├── jd.js
    │   ├── interview.js
    │   └── chat.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    ├── services/
    │   └── aiService.js           → All Claude API calls
    ├── config/
    │   └── db.js
    ├── .env
    └── index.js
```

---

## 🗄️ Database Schema (MongoDB)

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password": "hashed string",
  "createdAt": "date"
}
```

### Resumes Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "originalResume": "string (raw text)",
  "generatedResume": "string (ATS optimized)",
  "atsScore": "number",
  "jdText": "string",
  "createdAt": "date"
}
```

### Sessions Collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "jdText": "string",
  "resumeText": "string",
  "interviewQuestions": ["array"],
  "chatHistory": ["array"],
  "createdAt": "date"
}
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) (free tier works)
- [Anthropic API Key](https://console.anthropic.com/)
- [VS Code](https://code.visualstudio.com/)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/hireready.git
cd hireready
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_key
ANTHROPIC_API_KEY=your_claude_api_key
```

### 3. Setup Frontend
```bash
cd ../client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd server
npm run dev        # Runs on http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev        # Runs on http://localhost:5173
```

---

## 🔄 User Flow

```
1. Signup / Login
       ↓
2. Paste Job Description
       ↓
3. Upload Resume (PDF/DOCX) OR Fill Resume Form
       ↓
4. AI Generates ATS-Optimized Resume
       ↓
5. View ATS Score + Skills Gap
       ↓
6. View Interview Questions + Suggested Answers
       ↓
7. Practice with AI Chatbot
       ↓
8. Download Resume as PDF ✅
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch — `git checkout -b feat/AmazingFeature`
3. Commit your changes — `git commit -m 'feat: add AmazingFeature'`
4. Push to the branch — `git push origin feat/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

- [Anthropic Claude](https://anthropic.com/) — AI backbone of HireReady
- [MongoDB Atlas](https://www.mongodb.com/) — Cloud database
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [Tailwind CSS](https://tailwindcss.com/) — Styling framework

---

<div align="center">

**Built with ❤️ for every job seeker who deserves better than a generic resume**

*Agar HireReady ne help ki, toh ⭐ zaroor do GitHub pe!*

</div>