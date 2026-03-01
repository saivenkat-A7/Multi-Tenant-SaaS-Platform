# 🚀 Multi-Tenant SaaS Platform

> **A production-ready, containerized Project & Task Management System built with a strict Multi-Tenant Architecture.**

This application is a full-stack SaaS platform designed for organizations to manage teams, projects, and tasks in a completely isolated environment. It demonstrates advanced architectural patterns including **Data Isolation**, **Role-Based Access Control (RBAC)**, and **Subscription Management**.




## 🌟 Key Features

1.  **Strict Tenant Isolation**
    * Implements "Shared Database, Shared Schema" architecture.
    * Global middleware automatically enforces `where: { tenantId }` on every database query to prevent data leakage.
2.  **Role-Based Access Control (RBAC)**
    * **Super Admin:** System-wide visibility, manages tenants and plans (Tenant ID is NULL).
    * **Tenant Admin:** Full control over their organization's users and projects.
    * **Standard User:** Restricted access to assigned tasks and projects.
3.  **Subscription Plan Limits**
    * Enforces `max_users` and `max_projects` limits based on the tenant's plan (Free, Pro, Enterprise).
    * Prevents resource creation (HTTP 403) when limits are exceeded.
4.  **Secure Authentication**
    * Stateless JWT (JSON Web Token) authentication with 24-hour expiry.
    * Passwords securely hashed using `bcrypt`.
5.  **Full Docker Containerization**
    * Production-ready `docker-compose` setup.
    * Orchestrates Database, Backend, and Frontend with a single command.
    * **Auto-Healing:** Backend waits for Database readiness before starting.
6.  **Robust Data Persistence**
    * Configured **Named Docker Volumes** for PostgreSQL.
    * Data survives container restarts and shutdowns, ensuring no data loss.
7.  **Automated Database Operations**
    * **Zero-Touch Startup:** Migrations and Seed Data run automatically on container startup.
    * No manual SQL execution required.
8.  **Security Best Practices**
    * **Helmet:** Sets secure HTTP headers.
    * **CORS:** Configured for frontend-backend communication.
    * **Input Validation:** Strict typing on API endpoints.
9.  **Modern Responsive UI**
    * Built with **React + Vite + Tailwind CSS**.
    * Dynamic Sidebar navigation based on user role.
    * Real-time dashboard statistics.

---

##  Technology Stack

### **Frontend**
* **Framework:** React 18 (Vite Build Tool)
* **Language:** JavaScript (ES6+)
* **Styling:** Tailwind CSS 3.4
* **HTTP Client:** Axios
* **Icons:** Lucide React

### **Backend**
* **Runtime:** Node.js v18 (Alpine Linux)
* **Framework:** Express.js
* **Database:** PostgreSQL 15
* **ORM:** Sequelize
* **Authentication:** JSON Web Tokens (JWT)

### **DevOps**
* **Containerization:** Docker & Docker Compose
* **Orchestration:** Multi-stage builds
* **Environment:** Alpine Linux base images for minimal footprint

---

##  Architecture Overview

The system follows a **Three-Tier Architecture**:

1.  **Presentation Layer (Frontend):** React SPA running on port `3000`.
2.  **Application Layer (Backend):** Express REST API running on port `5000`.
3.  **Data Layer (Database):** PostgreSQL running on port `5432`.

*(See `docs/architecture.md` for the detailed system diagram)*

---

##  Installation & Setup

### **Prerequisites**
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Running)
* Git

### **Step-by-Step Guide**

**1. Clone the Repository**
```bash
git clone <repo url>
```

**2. Start the Application**
Run the following command in the root directory. This will build the images, start the containers, run migrations, and seed the database.

```bash
docker-compose up -d --build

```

**3. Verify Installation**

* **Backend:** Visit [http://localhost:5000/api/health](https://www.google.com/search?q=http://localhost:5000/api/health)
* *Expected Response:* `{"status":"ok","database":"connected"}`
* **Frontend:** Visit [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

**4. Stop the Application**

```bash
docker-compose down

```

*(Add `-v` to `down` if you want to wipe the database volume)*

---

## ⚙️ Environment Variables

The application is pre-configured for the evaluation environment. The `.env` variables are handled via `docker-compose.yml`.

| Variable | Description | Default Value |
| --- | --- | --- |
| `PORT` | Backend API Port | `5000` |
| `DB_HOST` | Database Service Name | `database` |
| `DB_PORT` | PostgreSQL Port | `5432` |
| `DB_NAME` | Database Name | `saas_db` |
| `DB_USER` | Database User | `postgres` |
| `DB_PASSWORD` | Database Password | `postgres` |
| `JWT_SECRET` | Secret for signing tokens | `supersecretkey...` |
| `FRONTEND_URL` | CORS Origin URL | `http://frontend:3000` |

---

##  API Documentation

The backend exposes a comprehensive REST API. Full documentation is available in `docs/API.md`.

**Core Endpoints:**

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | User login | Public |
| `POST` | `/api/auth/register-tenant` | Register new organization | Public |
| `GET` | `/api/projects` | List projects for tenant | Auth Required |
| `POST` | `/api/projects` | Create new project | Tenant Admin |
| `GET` | `/api/tenants` | List all tenants | Super Admin |

---

##  Test Credentials (Pre-Seeded)

The system automatically seeds these accounts on startup. You can use them to test different roles.

### **1. Tenant Admin (Demo Company)**

*Full access to "Demo Company" resources.*

* **Email:** `admin@demo.com`
* **Password:** `Demo@123`
* **Subdomain:** `demo`

### **2. Regular User (Demo Company)**

*Restricted access. Cannot manage users or delete projects.*

* **Email:** `user1@demo.com`
* **Password:** `User@123`
* **Subdomain:** `demo`

### **3. Super Admin (System)**

*System-wide access. No specific tenant.*

* **Email:** `superadmin@system.com`
* **Password:** `Admin@123`

---

##  Project Structure

```bash
multi-tenant-saas-platform/
├── backend/                # Express.js Backend
│   ├── src/
│   │   ├── config/         # DB Connection
│   │   ├── controllers/    # Business Logic
│   │   ├── middleware/     # Auth & Isolation
│   │   ├── models/         # Sequelize Models
│   │   ├── routes/         # API Routes
│   │   └── scripts/        # Migrations & Seeds
│   └── Dockerfile
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Route Views
│   │   └── api/            # API Integration
│   └── Dockerfile
├── docs/                   # Documentation Artifacts
├── docker-compose.yml      # Container Orchestration
└── submission.json         # Automated Test Credentials

```

