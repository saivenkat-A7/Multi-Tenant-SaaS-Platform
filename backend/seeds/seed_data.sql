-- SUPER ADMIN (NO TENANT)
INSERT INTO users (
    email, password_hash, full_name, role
) VALUES (
    'superadmin@system.com',
    '$2b$10$Yk6fE5E9NwKJ2QzHk0YHLeY0jF2W8k2zq8C9Fzq7uN5XkZ1m',
    'System Super Admin',
    'super_admin'
);

-- DEMO TENANT
INSERT INTO tenants (
    name, subdomain, status, subscription_plan, max_users, max_projects
) VALUES (
    'Demo Company',
    'demo',
    'active',
    'pro',
    20,
    10
);

-- TENANT ADMIN
INSERT INTO users (
    tenant_id, email, password_hash, full_name, role
)
SELECT id,
       'admin@demo.com',
       '$2b$10$DemoAdminHashedPass123',
       'Demo Admin',
       'tenant_admin'
FROM tenants WHERE subdomain = 'demo';

-- REGULAR USERS
INSERT INTO users (
    tenant_id, email, password_hash, full_name, role
)
SELECT id,
       'user1@demo.com',
       '$2b$10$user1hashedpassword',
       'Demo User One',
       'user'
FROM tenants WHERE subdomain = 'demo';

INSERT INTO users (
    tenant_id, email, password_hash, full_name, role
)
SELECT id,
       'user2@demo.com',
       '$2b$10$user2hashedpassword',
       'Demo User Two',
       'user'
FROM tenants WHERE subdomain = 'demo';

-- PROJECTS
INSERT INTO projects (
    tenant_id, name, description, created_by
)
SELECT t.id, 'Project Alpha', 'First demo project', u.id
FROM tenants t
JOIN users u ON u.role='tenant_admin'
WHERE t.subdomain='demo';

INSERT INTO projects (
    tenant_id, name, description, created_by
)
SELECT t.id, 'Project Beta', 'Second demo project', u.id
FROM tenants t
JOIN users u ON u.role='tenant_admin'
WHERE t.subdomain='demo';

-- TASKS
INSERT INTO tasks (
    tenant_id, project_id, title, priority, status
)
SELECT p.tenant_id, p.id, 'Setup database', 'high', 'completed'
FROM projects p LIMIT 1;

INSERT INTO tasks (
    tenant_id, project_id, title, priority
)
SELECT p.tenant_id, p.id, 'Build API', 'medium'
FROM projects p LIMIT 1;

INSERT INTO tasks (
    tenant_id, project_id, title
)
SELECT p.tenant_id, p.id, 'Write docs'
FROM projects p OFFSET 1 LIMIT 1;

INSERT INTO tasks (
    tenant_id, project_id, title
)
SELECT p.tenant_id, p.id, 'Testing'
FROM projects p OFFSET 1 LIMIT 1;

INSERT INTO tasks (
    tenant_id, project_id, title
)
SELECT p.tenant_id, p.id, 'Deployment'
FROM projects p OFFSET 1 LIMIT 1;
