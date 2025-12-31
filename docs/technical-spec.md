# Technical Specification  
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. Project Structure

This section describes the complete folder structure of the project and explains the purpose of each major directory. The project is divided into backend and frontend components, following a clean separation of concerns.

---

### 1.1 Backend Project Structure

text
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── tenant.controller.js
│   │   ├── user.controller.js
│   │   ├── project.controller.js
│   │   └── task.controller.js
│   │
│   ├── models/
│   │   ├── Tenant.js
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── AuditLog.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── tenant.routes.js
│   │   ├── user.routes.js
│   │   ├── project.routes.js
│   │   └── task.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── tenant.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── utils/
│   │   ├── jwt.util.js
│   │   ├── password.util.js
│   │   ├── logger.util.js
│   │   └── constants.js
│   │
│   ├── config/
│   │   ├── database.js
│   │   ├── env.js
│   │   └── cors.js
│   │
│   ├── app.js
│   └── server.js
│
├── migrations/
│   └── seed.js
│
├── tests/
│   ├── auth.test.js
│   ├── user.test.js
│   └── project.test.js
│
├── Dockerfile
├── package.json
└── .env

**Backend Folder Explanation**

| Folder | Purpose |
|--------|---------|
| `controllers/` | Contains request-handling logic for each module (authentication, tenants, users, projects, tasks). |
| `models/` | MongoDB schemas defining the structure of data and enforcing tenant isolation using `tenant_id`. |
| `routes/` | Defines REST API endpoints and maps them to controllers. |
| `middleware/` | Handles authentication, role-based access control, tenant validation, and global error handling. |
| `utils/` | Common utility functions such as JWT generation, password hashing, and logging. |
| `config/` | Configuration files for database connection, environment variables, and CORS setup. |
| `app.js` | Initializes Express app, middleware, and routes. |
| `server.js` | Starts the HTTP server. |
| `migrations/` | Contains scripts to seed initial data such as super admin user and default plans. |
| `tests/` | Automated test cases for API endpoints. |

### 1.2 Frontend Project Structure

frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── ProjectDetails.jsx
│   │   └── Users.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   └── useAuth.js
│   │
│   ├── utils/
│   │   └── constants.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── Dockerfile
├── package.json
└── .env


**Frontend Folder Explanation**

| Folder | Purpose |
|--------|---------|
| `components/` | Reusable UI components. |
| `pages/` | Application screens mapped to routes. |
| `services/` | Handles API communication with the backend. |
| `context/` | Global authentication state management. |
| `hooks/` | Custom React hooks for logic reuse. |
| `utils/` | Constants and helper functions. |

## 2. Development Setup Guide

This section explains how to set up and run the project locally using Docker.

### 2.1 Prerequisites

Ensure the following software is installed:
- **Node.js**: v18.x or later
- **Docker**: v24.x or later
- **Docker Compose**: v2.x or later
- **Git**

### 2.2 Environment Variables

All environment variables are defined using development-safe values and are committed for evaluation purposes.

## ⚙️ Backend Environment Variables (`backend/.env`)

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://postgres:postgres@database:5432/multitenant_saas

JWT_SECRET=dev_secret_key
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://frontend:3000
```

**Frontend Environment Variables** (`frontend/.env`)

```
VITE_API_URL=http://backend:5000/api
```

### 2.3 Installation Steps

1. Clone the repository:
```
git clone <repository-url>
cd project-root

```

2. Ensure Docker is running.

### 2.4 Running the Project (One Command)

The entire application can be started using a single command:

```
docker-compose up -d
```

This command will:
- Start Postgresql
- Start backend API server
- Start frontend React application
- Run database seed scripts automatically

### 2.5 Accessing the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:5000/api |
| **Health Check** | http://localhost:5000/api/health |

### 2.6 Running Tests

To run backend tests:
```
docker exec -it backend npm test
```

### 2.7 Stopping the Application

To stop all running services:
```
docker-compose down

```
