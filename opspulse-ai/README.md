# OpsPulse AI — Autonomous Supply Chain & Procurement Agent

OpsPulse AI is a production-ready, agentic AI platform designed to automate e-commerce inventory monitoring, reorder planning, vendor evaluations, and purchase order dispatches. Powered by **Google Gemini 2.5 API**, OpsPulse AI executes multi-step operational decision loops with full real-time reasoning logs.

---

## 🌟 Key Features

1. **Autonomous Reorder Loop (`agentExecutor.js`)**:
   - Accepts operational stock triggers (e.g. `SKU-102 stock critically low`).
   - Executes 4 distinct agentic phases: `ANALYZE_STOCK` ➔ `EVALUATE_SUPPLIERS` ➔ `DRAFT_PURCHASE_ORDER` ➔ `SIMULATE_OUTREACH`.
   - Records structured thoughts, tool actions, and output payloads into the SQLite `agent_logs` table.
2. **Gemini 2.5 AI Integration (`gemini.js`)**:
   - Uses Gemini API with structured JSON output formatting.
   - Includes intelligent fallback logic for zero-downtime evaluation.
3. **Cyberpunk Real-Time Agent Terminal (`AgentTerminal.jsx`)**:
   - Dark-mode hacker interface displaying live step-by-step reasoning logs, status badges, and JSON payloads.
4. **Supply Chain Dashboard (`Dashboard.jsx`)**:
   - Live telemetry KPI cards, low-stock warnings, searchable SKU inventory table, supplier SLA performance, and generated purchase order logs.
5. **Robust JWT & Zod Security**:
   - Complete signup/login authentication flow backed by bcrypt password hashing and Zod payload validation schemas.

---

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: SQLite (`better-sqlite3` with memory fallback handler)
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Validation**: Zod schema validation
- **AI Engine**: Google Gemini API (`@google/genai`)

### Frontend
- **Framework**: React.js 18 + Vite
- **Styling**: Tailwind CSS (Glassmorphism & Cyberpunk dark theme)
- **Icons**: Lucide React
- **HTTP Client**: Axios with automatic Bearer token interceptor
- **Routing**: React Router v7

---

## 📁 Repository Structure

```
opspulse-ai/
├── backend/
│   ├── src/
│   │   ├── config/ (db.js, env.js)
│   │   ├── middleware/ (auth.js, validate.js)
│   │   ├── services/ (gemini.js, agentExecutor.js)
│   │   ├── routes/ (auth.routes.js, agent.routes.js, inventory.routes.js)
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/ (axios.js)
│   │   ├── components/ (AgentTerminal.jsx, Navbar.jsx, MetricCard.jsx)
│   │   ├── pages/ (Login.jsx, Dashboard.jsx, AgentRunner.jsx)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── index.html
│   └── vite.config.js
└── README.md
```

---

## 🛠 Local Quickstart Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### 1. Backend Setup
```bash
cd opspulse-ai/backend
npm install
```

Create a `.env` file in `opspulse-ai/backend/.env`:
```env
PORT=5000
JWT_SECRET=opspulse_super_secret_jwt_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
# Server listening on http://localhost:5000
```

### 2. Frontend Setup
In a new terminal window:
```bash
cd opspulse-ai/frontend
npm install
npm run dev
# Frontend running on http://localhost:3000
```

---

## 🔑 Quick Evaluator Access

When opening the frontend (`http://localhost:3000`), click **"One-Click Demo Access"** on the Login screen to instantly sign in as a pre-configured Ops Manager (`demo@opspulse.ai`).

---

## 🌐 Production Deployment Guide

### Deploying Backend to Render
1. Push your repository to GitHub.
2. Log into [Render Dashboard](https://render.com) and click **New > Web Service**.
3. Connect your GitHub repository and select the `opspulse-ai/backend` directory.
4. Set build & start settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
5. Add Environment Variables under **Environment**:
   - `PORT`: `5000`
   - `JWT_SECRET`: `<your-random-secret>`
   - `GEMINI_API_KEY`: `<your-gemini-api-key>`
6. Click **Deploy Web Service**. Render will output your live backend URL (e.g. `https://opspulse-backend.onrender.com`).

### Deploying Frontend to Vercel
1. Log into [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. Set Root Directory to `opspulse-ai/frontend`.
4. Framework Preset: **Vite**.
5. Configure `vite.config.js` or Environment Variable `VITE_API_BASE_URL` if proxying to your Render backend URL.
6. Click **Deploy**.

---

## 📄 License
MIT License. Built for hackathon demonstration.
