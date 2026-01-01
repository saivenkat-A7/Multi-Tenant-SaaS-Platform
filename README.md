# Multi-Tenant SaaS Project & Task Manager

A production-ready **multi-tenant SaaS task management platform** built with Node.js, PostgreSQL, React, and Docker.  
The system supports tenant isolation, role-based access control, automatic database initialization, and containerized deployment for evaluation.

**Target Audience:**  
Students, developers, and evaluators reviewing multi-tenant backend architecture, Dockerized deployments, and role-based SaaS systems.

---

##  Features

- Multi-tenant architecture with strict tenant isolation
- Role-based access control (super_admin, tenant_admin, user)
- Secure JWT-based authentication
- Tenant registration with unique subdomains
- User management per tenant
- Project creation and assignment
- Task management per project
- Automatic database migrations
- Automatic seed data loading
- PostgreSQL relational data model
- RESTful API design
- Docker & Docker Compose based deployment
- Health check endpoint for readiness verification
- Audit logging support
- Responsive frontend UI

---

##  Technology Stack

### Frontend
- React 19
- React Router DOM 7
- Axios 1.13
- Vite 7

### Backend
- Node.js 20
- Express 5
- PostgreSQL 15
- pg (node-postgres)
- bcrypt
- jsonwebtoken
- dotenv

### Database
- PostgreSQL 15

### DevOps & Tools
- Docker
- Docker Compose
- Git

---

##  Architecture Overview

This application follows a **three-tier architecture**:

1. **Frontend (React)**  
   - Runs in its own container  
   - Communicates with backend via REST APIs

2. **Backend (Express API)**  
   - Handles authentication, authorization, and business logic  
   - Enforces tenant isolation and role permissions  
   - Executes database migrations and seed scripts automatically on startup

3. **Database (PostgreSQL)**  
   - Isolated persistent storage using Docker volumes  
   - Initialized automatically using migration and seed SQL files
   
### Architecture Diagram

![System Architecture](docs/images/system-architecture.png)

### Database ERD

![Database ERD](docs/images/database-erd.png)


> All services communicate using Docker service names (not localhost).

---

##  Installation & Setup

### Prerequisites
- Docker
- Docker Compose
- Git

---

###  Clone Repository
```bash
git clone <your-repo-url>
cd multi-tenant-saas-project-task-manager
````

---

### Environment Variables

Create `.env` inside the **backend root**:

```env
DB_HOST=database
DB_PORT=5432
DB_NAME=multi_tenant_saas
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=dev_secret_key_min_32_chars_long
JWT_EXPIRES_IN=24h

PORT=5000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000
```


---

###  Start Application (MANDATORY)

```bash
docker-compose up -d --build
```

This single command will:

* Start PostgreSQL
* Run migrations automatically
* Load seed data automatically
* Start backend API
* Start frontend UI

---

###  Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response **after DB + migrations + seeds**:

```json
{
  "status": "ok",
  "database": "connected"
}
```

---

###  Access Application

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend API: [http://localhost:5000](http://localhost:5000)

---

##  Database Migrations

Migrations are executed automatically on backend startup.

Location:

```
backend/migrations/
```

Files:

* 001_create_tenants.sql
* 002_create_users.sql
* 003_create_projects.sql
* 004_create_tasks.sql
* 005_create_audit_logs.sql
* 006_add_indexes.sql

---

##  Seed Data

Seed data is automatically loaded after migrations.

Location:

```
backend/seeds/seed_data.sql
```

Seeded data includes:

* Super Admin user
* Tenant
* Tenant Admin user
* Regular user
* Sample project
* Sample tasks

---

##  Test Credentials (Seeded)

These credentials are used by the evaluation script:

| Role         | Email                                                 | Password  | Subdomain |
| ------------ | ----------------------------------------------------- | --------- | --------- |
| Super Admin  | [superadmin@system.com](mailto:superadmin@system.com) | Admin@123 | —         |
| Tenant Admin | [admin@demo.com](mailto:admin@demo.com)               | Demo@123  | demo      |
| User         | [user@demo.com](mailto:user@demo.com)                 | User@123  | demo      |

---

##  Environment Variables Explained

| Variable       | Purpose                                 |
| -------------- | --------------------------------------- |
| DB_HOST        | Database hostname (Docker service name) |
| DB_PORT        | PostgreSQL port                         |
| DB_NAME        | Database name                           |
| DB_USER        | Database user                           |
| DB_PASSWORD    | Database password                       |
| JWT_SECRET     | JWT signing key                         |
| JWT_EXPIRES_IN | Token expiry duration                   |
| FRONTEND_URL   | Allowed CORS origin                     |
| NODE_ENV       | Environment mode                        |

---

##  API Documentation

Detailed API documentation is available at:

```
docs/API.md
```

Includes:

* All endpoints
* HTTP methods
* Auth requirements
* Request & response examples

---

## Evaluation Compliance

- Automatic database migrations
-  Automatic seed data
-  Docker-only setup
-  Health check implemented
-  Role-based authentication
-  Tenant isolation

---

##  License

This project is for educational and evaluation purposes.

