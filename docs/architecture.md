# System Architecture Design (PostgreSQL-Based Multi-Tenant SaaS)

---

## PART 1: System Architecture Diagram

![System Architecture Overview](./architecture.png)

### Architecture Flow

1. **Browser** → React Frontend (`tenant.app.com`)
2. **Frontend** → Node.js + Express Backend API calls
3. **Backend** → JWT Middleware → PostgreSQL (tenant_id isolation)
4. **JWT Flow**:  
   Login → JWT Token → All requests include  
   `Authorization: Bearer <token>`

---

### Key Components

- **Load Balancer**
  - Distributes traffic across backend instances
  - Enables horizontal scaling

- **Redis**
  - Rate limiting (per tenant + IP)
  - Token/session caching
  - OTP & password reset tokens

- **PostgreSQL**
  - Primary relational database
  - Strong ACID guarantees
  - Indexed tenant-based isolation
  - UUID-based primary keys

---

## PART 2: Database ERD (PostgreSQL)

![Database Entity Relationship Diagram](./erd.png)

### Database Design Strategy

- **Single database, multi-tenant architecture**
- Tenant isolation enforced via:
  - `tenant_id` foreign keys
  - Application-level filtering
  - Optional PostgreSQL Row-Level Security (RLS)
- UUID used instead of ObjectId
- Strict relational constraints for data integrity

---

## PostgreSQL Tables

---

### tenants

```sql
tenants
-------
id UUID (PK)
subdomain VARCHAR UNIQUE NOT NULL
name VARCHAR NOT NULL
logo_url VARCHAR
settings JSONB
status ENUM('active', 'suspended')
created_at TIMESTAMP


users
-----
id UUID (PK)
tenant_id UUID (FK → tenants.id)
email VARCHAR UNIQUE NOT NULL
password_hash VARCHAR NOT NULL
name VARCHAR NOT NULL
roles TEXT[] 
avatar_url VARCHAR
created_at TIMESTAMP


projects
--------
id UUID (PK)
tenant_id UUID (FK → tenants.id)
name VARCHAR NOT NULL
description TEXT
created_at TIMESTAMP


project_members
---------------
id UUID (PK)
project_id UUID (FK → projects.id)
user_id UUID (FK → users.id)
role VARCHAR


tasks
-----
id UUID (PK)
tenant_id UUID (FK → tenants.id)
project_id UUID (FK → projects.id)
title VARCHAR NOT NULL
description TEXT
assignee_id UUID (FK → users.id)
status ENUM('todo', 'in_progress', 'review', 'done')
due_date TIMESTAMP
created_at TIMESTAMP


task_comments
-------------
id UUID (PK)
task_id UUID (FK → tasks.id)
user_id UUID (FK → users.id)
comment TEXT
created_at TIMESTAMP


audit_logs
----------
id UUID (PK)
tenant_id UUID (FK → tenants.id)
user_id UUID (FK → users.id)
action VARCHAR
resource VARCHAR
ip_address VARCHAR
timestamp TIMESTAMP


CREATE INDEX idx_tenant_id ON users(tenant_id);
CREATE INDEX idx_tenant_projects ON projects(tenant_id);
CREATE INDEX idx_tenant_tasks ON tasks(tenant_id);
CREATE INDEX idx_tenant_created_at ON tasks(tenant_id, created_at DESC);
CREATE UNIQUE INDEX idx_users_email ON users(email);


## PART 3: API Architecture

---

### API Design Principles

- RESTful endpoints
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Tenant-aware queries
- Consistent JSON response envelope

---

### API Endpoints

| Module   | Method | Endpoint                              | Auth | Role Required                     |
|---------|--------|---------------------------------------|------|-----------------------------------|
| Auth    | POST   | `/api/v1/auth/login`                  | ❌   | All                               |
| Auth    | POST   | `/api/v1/auth/register`               | ❌   | All                               |
| Auth    | POST   | `/api/v1/auth/refresh`                | ✅   | All                               |
| Auth    | POST   | `/api/v1/auth/forgot-password`        | ❌   | All                               |
| Auth    | POST   | `/api/v1/auth/reset-password`         | ❌   | All                               |
| Tenant  | GET    | `/api/v1/tenants/:id`                 | ✅   | tenant_admin                      |
| Tenant  | PUT    | `/api/v1/tenants/:id`                 | ✅   | tenant_admin                      |
| Tenant  | POST   | `/api/v1/tenants/:id/invite`          | ✅   | tenant_admin                      |
| Tenant  | GET    | `/api/v1/tenants/:id/analytics`       | ✅   | tenant_admin                      |
| Users   | GET    | `/api/v1/users`                       | ✅   | tenant_admin                      |
| Users   | POST   | `/api/v1/users`                       | ✅   | tenant_admin                      |
| Users   | PUT    | `/api/v1/users/:id`                   | ✅   | tenant_admin, self                |
| Users   | DELETE | `/api/v1/users/:id`                   | ✅   | tenant_admin                      |
| Projects| GET    | `/api/v1/projects`                    | ✅   | tenant_admin, team_member         |
| Projects| POST   | `/api/v1/projects`                    | ✅   | tenant_admin                      |
| Projects| GET    | `/api/v1/projects/:id`                | ✅   | project_member                    |
| Projects| PUT    | `/api/v1/projects/:id`                | ✅   | tenant_admin                      |
| Projects| DELETE | `/api/v1/projects/:id`                | ✅   | tenant_admin                      |
| Tasks   | GET    | `/api/v1/tasks`                       | ✅   | project_member                    |
| Tasks   | POST   | `/api/v1/tasks`                       | ✅   | project_member                    |
| Tasks   | GET    | `/api/v1/tasks/:id`                   | ✅   | task_assignee                     |
| Tasks   | PUT    | `/api/v1/tasks/:id`                   | ✅   | task_assignee                     |
| Tasks   | DELETE | `/api/v1/tasks/:id`                   | ✅   | project_manager                   |
| Tasks   | POST   | `/api/v1/tasks/:id/comments`          | ✅   | task_assignee                     |

---

### API Statistics

- **Total Endpoints**: 25+
- **API Versioning**: `/api/v1/`
- **Authentication**: JWT Bearer Token
- **Error Handling**: Standard HTTP status codes
- **Rate Limiting**: Redis-backed (per tenant + IP)

---

### Security & Tenant Isolation

- JWT contains `tenant_id`
- All SQL queries include `WHERE tenant_id = ?`
- Foreign key constraints prevent cross-tenant access
- Optional PostgreSQL Row-Level Security (RLS)
- Encrypted passwords using `bcrypt`
- HTTPS enforced in production

---

### Scalability & Future Enhancements

- Read replicas for PostgreSQL
- Database partitioning by `tenant_id`
- Redis caching for heavy read operations
- Background workers for emails and audit logs
- Docker Based deployment

---
