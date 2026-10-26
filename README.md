# 🔧 QuickFix – Local Service Platform

A full-stack MERN application that connects customers with verified local service professionals (plumbers, electricians, AC technicians, painters, carpenters, and more).

![React](https://img.shields.io/badge/React-19-blue) ![Express](https://img.shields.io/badge/Express-5-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4) ![Socket.IO](https://img.shields.io/badge/Socket.IO-4-black)

---

## 📋 Experiments Covered

| # | Experiment | Technology | Status |
|---|-----------|------------|--------|
| 1 | Build responsive & interactive UIs | React + Tailwind CSS | ✅ |
| 2 | React Hooks (useEffect, useContext, custom hooks) | React Hooks | ✅ |
| 3 | Manage complex state with Context API + useReducer | React Context | ✅ |
| 4 | REST API Design with MongoDB + Mongoose | Express + Mongoose | ✅ |
| 5 | Secure, production-ready RESTful APIs | Helmet + Rate Limiting + Validation | ✅ |
| 6 | JWT Authentication & User Roles | JWT + bcrypt | ✅ |
| 7 | Validating RESTful APIs using Postman | Postman Collection | ✅ |
| 8 | Real-time communication via WebSockets + Email | Socket.IO + Nodemailer | ✅ |
| 9 | CI/CD Deployment with GitHub Actions + Vercel | GitHub Actions + Vercel | ✅ |

---

## 🏗️ Project Structure

```
local-service-platform/
├── src/                        # React Frontend
│   ├── components/Navbar.jsx   # Responsive navbar with mobile menu
│   ├── context/                # AuthContext + ServiceContext (Exp 2, 3)
│   │   ├── AuthContext.jsx     # Auth state management
│   │   └── ServiceContext.jsx  # Service request state (useReducer)
│   │   └── serviceReducer.js   # Reducer for complex state
│   ├── hooks/                  # Custom React hooks (Exp 2)
│   │   ├── useAuth.js
│   │   └── useRequests.js
│   └── pages/
│       ├── Home.jsx            # Landing page with booking modal
│       ├── Dashboard.jsx       # Role-based dashboard (Client/Worker/Admin)
│       ├── Login.jsx
│       └── Register.jsx
├── backend/                    # Express API
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + role guard (Exp 5, 6)
│   │   └── validate.js         # Input validation (Exp 5)
│   ├── models/
│   │   ├── User.js             # User model with roles
│   │   └── ServiceRequest.js   # Service request model
│   ├── routes/
│   │   ├── authRoutes.js       # Register + Login endpoints
│   │   └── requestRoutes.js    # CRUD + WebSocket + Email
│   ├── utils/
│   │   └── sendEmail.js        # Email notifications (Exp 8)
│   └── server.js               # Express + Socket.IO server
├── postman/                    # Postman collection (Exp 7)
├── .github/workflows/ci.yml   # GitHub Actions CI/CD (Exp 9)
├── vercel.json                 # Vercel deployment config (Exp 9)
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd local-service-platform

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Configure Environment

```bash
# Backend: copy and edit .env
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT secret

# Frontend: copy and edit .env
cp .env.example .env
# Edit .env with your API URL (default: http://localhost:5000)
```

### 3. Run Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
npm run dev
```

Frontend runs on `http://localhost:5173`, Backend on `http://localhost:5000`.

---

## 🔐 Security Features (Experiment 5)

- **Helmet** – Sets secure HTTP headers
- **Rate Limiting** – 100 requests per 15 minutes per IP
- **Input Validation** – express-validator on all routes
- **JWT Authentication** – Token-based auth with role guards
- **Password Hashing** – bcrypt with salt rounds

---

## 📧 Email Notifications (Experiment 8)

When a worker accepts a job, confirmation emails are sent to:
- **Customer** – "Your request has been accepted by [Worker Name]"
- **Worker** – "Your role has been confirmed for [Service] at [Location]"

Configure email in `backend/.env`:
```env
# Gmail
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

---

## 🧪 Postman Validation (Experiment 7)

Import `postman/QuickFix_API.postman_collection.json` into Postman.

The collection includes:
- Auth: Register (client/worker), Login, Validation errors
- Requests: CRUD operations with auth tokens
- Security: Rate limit testing, unauthorized access tests
- Auto-set variables: Token is auto-captured after login

---

## 🚢 Deployment (Experiment 9)

### Frontend → Vercel
1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`
4. Deploy!

### Backend → Render
1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repo
3. Set root directory to `backend`
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variables (MONGO_URI, JWT_SECRET, etc.)

### CI/CD → GitHub Actions
The `.github/workflows/ci.yml` pipeline automatically:
- Lints frontend code
- Builds production bundle
- Validates backend syntax
- Deploys to Vercel on push to `main`

Required GitHub Secrets:
- `VERCEL_TOKEN` – From Vercel dashboard
- `VERCEL_ORG_ID` – From `.vercel/project.json`
- `VERCEL_PROJECT_ID` – From `.vercel/project.json`

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Client** | Book services, track requests, cancel pending requests |
| **Worker** | View available jobs, accept jobs, mark as completed |
| **Admin** | View all requests, delete any request, platform overview |

---

## 📡 WebSocket Events (Experiment 8)

| Event | Direction | Description |
|-------|-----------|-------------|
| `requestUpdated` | Server → Client | Real-time status change broadcast |
| `newRequest` | Server → Client | New service request created |
| `requestDeleted` | Server → Client | Request removed from system |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS 3, Vite 8, Lucide Icons, Socket.IO Client
- **Backend**: Express 5, MongoDB + Mongoose 9, JWT, Socket.IO 4, Nodemailer
- **Security**: Helmet, express-rate-limit, express-validator, bcryptjs
- **DevOps**: GitHub Actions, Vercel, Docker-ready
