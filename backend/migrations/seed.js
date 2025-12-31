const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const Tenant = require("../models/Tenant");
const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await Tenant.deleteMany();
  await User.deleteMany();
  await Project.deleteMany();
  await Task.deleteMany();

  // 1️⃣ Super Admin
  const superAdmin = await User.create({
    email: "superadmin@system.com",
    password_hash: await bcrypt.hash("Admin@123", 10),
    full_name: "System Admin",
    role: "super_admin",
    tenant_id: null,
  });

  // 2️⃣ Demo Tenant
  const tenant = await Tenant.create({
    name: "Demo Company",
    subdomain: "demo",
    status: "active",
    subscription_plan: "pro",
  });

  // 3️⃣ Tenant Admin
  const admin = await User.create({
    tenant_id: tenant._id,
    email: "admin@demo.com",
    password_hash: await bcrypt.hash("Demo@123", 10),
    full_name: "Demo Admin",
    role: "tenant_admin",
  });

  // 4️⃣ Regular Users
  const user1 = await User.create({
    tenant_id: tenant._id,
    email: "user1@demo.com",
    password_hash: await bcrypt.hash("User@123", 10),
    full_name: "User One",
    role: "user",
  });

  const user2 = await User.create({
    tenant_id: tenant._id,
    email: "user2@demo.com",
    password_hash: await bcrypt.hash("User@123", 10),
    full_name: "User Two",
    role: "user",
  });

  // 5️⃣ Projects
  const project1 = await Project.create({
    tenant_id: tenant._id,
    name: "Website Redesign",
    created_by: admin._id,
  });

  const project2 = await Project.create({
    tenant_id: tenant._id,
    name: "Mobile App",
    created_by: admin._id,
  });

  // 6️⃣ Tasks
  await Task.insertMany([
    {
      tenant_id: tenant._id,
      project_id: project1._id,
      title: "Design UI",
      assigned_to: user1._id,
    },
    {
      tenant_id: tenant._id,
      project_id: project1._id,
      title: "Setup Backend",
      assigned_to: user2._id,
    },
    {
      tenant_id: tenant._id,
      project_id: project2._id,
      title: "Create API",
      assigned_to: user1._id,
    },
    {
      tenant_id: tenant._id,
      project_id: project2._id,
      title: "Testing",
      assigned_to: user2._id,
    },
    {
      tenant_id: tenant._id,
      project_id: project2._id,
      title: "Deployment",
    },
  ]);

  console.log("✅ Database seeded successfully");
  process.exit();
}

seed();
