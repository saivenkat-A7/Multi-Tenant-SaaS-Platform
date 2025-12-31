# Multi-Tenancy Research Document

## PART 1: Multi-Tenancy Analysis

Multi-tenancy enables a single SaaS application instance to serve multiple customers (tenants) while keeping their data logically separated. This architecture is crucial for SaaS because it optimizes resource usage, reduces infrastructure costs, and simplifies maintenance compared to deploying separate instances per tenant.[web:1][web:2]

### Approach 1: Shared Database + Shared Schema
**Definition**: One database, one set of tables. Each table has `tenant_id` field.  
**Example**: `users(id, name, email, tenant_id)`  

**Pros**:
- Easy to manage and deploy
- Lowest infrastructure cost
- Scales well horizontally
- Simple database backups

**Cons**:
- Requires strict query filtering
- Risk of data leaks if `tenant_id` missed
- Complex indexing requirements

### Approach 2: Shared Database + Separate Schema
**Definition**: One database, each tenant has own schema.  
**Example**: `tenant1.users`, `tenant2.users`

**Pros**:
- Better logical isolation
- Cleaner per-tenant data separation
- Schema-specific optimizations

**Cons**:
- Schema management complexity
- Database bloat with many tenants
- Harder to migrate schemas
- Scaling limitations

### Approach 3: Separate Database per Tenant
**Definition**: Each tenant gets completely isolated database.

**Pros**:
- Strongest isolation possible
- Best for compliance (GDPR, HIPAA)
- Independent scaling per tenant
- No cross-tenant risk

**Cons**:
- Very expensive at scale
- Complex connection management
- Backup/monitoring nightmare
- Poor resource utilization

### Comparison Table

| Approach                     | Cost   | Isolation   | Scalability | Complexity |
|------------------------------|--------|-------------|-------------|------------|
| Shared DB + Shared Schema    | **Low** | Medium      | **High**    | **Low**    |
| Shared DB + Schema per Tenant| Medium | **High**    | Medium      | **High**   |
| Separate DB per Tenant       | **High**| **Very High**| **Low**     | **Very High** |

**Final Choice**: This project uses **Shared Database + Shared Schema with `tenant_id`**.

**Justification**: 
- Perfect balance of cost vs isolation for startup SaaS
- MongoDB excels at `tenant_id` indexing and query performance
- Shopify, Jira, Slack use similar patterns serving millions of tenants
- Application-layer enforcement provides sufficient security
- Scales to 10,000+ tenants without schema explosion

## PART 2: Technology Stack Justification

###  Backend Framework Chosen: Node.js + Express

**Why Node.js + Express**:
- Event-driven, non-blocking I/O handles 100k+ concurrent connections
- 2M+ npm packages accelerate SaaS feature development
- Express middleware perfect for `tenant_id` enforcement
- JSON-native for MongoDB integration
- 70% faster development than Java/Spring Boot

**Alternatives Considered**:
- **Spring Boot**: Enterprise-heavy, slower startup, Java verbosity
- **Django**: Python ecosystem smaller for real-time features

###  Frontend Framework Chosen: React

**Why React**:
- Component reusability across tenant dashboards/admin panels
- Virtual DOM ensures 60fps performance with large datasets
- 1.8M+ developers = massive SaaS-specific libraries
- Next.js integration for SSR/SSG multi-tenant routing
- TypeScript support for enterprise-grade typing

**Alternatives Considered**:
- **Angular**: Overkill for most SaaS, steep learning curve
- **Vue**: Smaller ecosystem for complex state management

### Database Chosen: PostgreSQL

**Why PostgreSQL**:
- Strong relational integrity with foreign keys ensures consistent SaaS data
- Excellent support for multi-tenant architectures using `tenant_id`
- Advanced indexing (B-tree, GIN, GiST) enables fast queries at scale
- JSONB support combines structured and semi-structured data flexibility
- Powerful query planner and CTEs replace complex application-side logic
- Row-Level Security (RLS) enforces tenant isolation at the database level
- ACID compliance guarantees reliable transactions under concurrency

**Alternatives Considered**:
- **MongoDB**: Weaker relational guarantees and complex cross-collection transactions
- **MySQL**: Limited advanced indexing, JSON querying, and weaker analytical capabilities

###  Authentication Chosen: JWT

**Why JWT**:
- Stateless = infinite horizontal scaling
- `tenant_id` + `user_id` claims in single token
- RS256 signing prevents tampering
- 15min expiry + refresh tokens = optimal security

###  Deployment Chosen: Docker + Docker Compose

**Why Docker**:
- docker-compose up = production-ready in 30s

- Identical environments dev/staging/prod
- Multi-service orchestration (Node + Mongo + Redis)
- Zero-config scaling with Docker Swarm/K8s

## PART 3: Security Considerations

### 1. Tenant Data Isolation using `tenant_id`

**Implementation Strategy**: Every query appends `{tenant_id: current_tenant}` via middleware, enforced at the application layer. MongoDB indexes on `tenant_id` ensure efficient filtering; audits catch missed filters.[web:5][web:2]

**Key Protections**:
- **Middleware Enforcement**: `app.use(tenantMiddleware)` automatically adds `tenant_id` filtering to all database operations
- **Compound Indexing**: `{tenant_id: 1, createdAt: -1}` delivers sub-10ms queries at scale
- **Audit Logging**: Daily scans flag any unfiltered queries
- **Prevents**: Cross-tenant data leaks common in shared schema implementations

### 2. JWT-based Authentication

**Token Structure**:
```
{
  "sub": "user_123",
  "tenant_id": "tenant_abc",
  "roles": ["admin"],
  "exp": 1734925200,
  "iat": 1734922000
}

```

**Security Features**:
- **Tenant + User Claims**: Both `tenant_id` and `user_id` verified on every request
- **Short Expiration**: 15-60 minutes with refresh token rotation
- **RS256 Signing**: Asymmetric keys prevent token tampering
- **Stateless Scaling**: No session storage required

### 3. RBAC Enforcement

**Tenant-Scoped Roles**: `admin`, `user`, `viewer` - all scoped to specific `tenant_id`.

**Middleware Implementation**:
```
const rbacMiddleware = (requiredRole) => (req, res, next) => {
if (user.tenant_id !== req.tenant_id) {
return res.status(403).json({ error: 'Tenant mismatch' });
}
if (!user.roles.includes(requiredRole)) {
return res.status(403).json({ error: 'Insufficient permissions' });
}
next();
};

```

**Protections**:
- **No Global Roles**: Prevents privilege escalation across tenants
- **Double-Check**: Both tenant_id AND role validation
- **Granular Permissions**: Resource-level access control

### 4. Password Hashing (bcrypt)

**Hashing Standards**:
- **Cost Factor**: 12+ (300ms+ computation time)
- **Auto-Salting**: Unique salt per password
- **Pre-Hash Validation**: 12+ chars, complexity rules

**Implementation**:

```
const hashedPassword = await bcrypt.hash(password, 12);

```


**Security Benefits**:
- **Rainbow Table Resistant**: Unique salts per password
- **GPU Cracking Resistant**: High computational cost
- **Future-Proof**: Cost factor adjustable as hardware improves

### 5. API Validation & Rate Limiting

**Input Validation** (Joi/Zod):
```
const schema = Joi.object({
tenant_id: Joi.string().required(),
email: Joi.string().email().required(),
password: Joi.string().min(12).required()
});
```

**Rate Limiting** (Redis-based):
- **100 requests/15min** per tenant
- **1000 requests/day** per IP
- **Tenant-scoped counters** prevent abuse isolation

**Protection Layers**:
- **Schema Validation**: Rejects malformed requests early
- **Rate Limiting**: Prevents DDoS and brute-force attacks
- **Circuit Breakers**: Auto-blocks sustained abuse
- **Redis Caching**: Sub-millisecond limit checks



