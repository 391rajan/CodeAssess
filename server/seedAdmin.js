/**
 * Seed Admin script — creates the first admin account.
 * Run with: node seedAdmin.js
 *
 * Credentials: admin@codeassess.com / Admin@123
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const ADMIN = {
  name: "Admin",
  email: "admin@codeassess.com",
  password: "Admin@123",
  role: "admin",
  status: "approved",
};

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) {
      console.log("Admin account already exists. Skipping.");
      await mongoose.disconnect();
      return;
    }

    // Hash password and create admin
    const passwordHash = await bcrypt.hash(ADMIN.password, 10);

    await User.create({
      name: ADMIN.name,
      email: ADMIN.email,
      passwordHash,
      role: ADMIN.role,
      status: ADMIN.status,
    });

    console.log("✓ Admin created successfully");
    console.log(`  Email:    ${ADMIN.email}`);
    console.log(`  Password: ${ADMIN.password}`);

    await mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error("Seed admin error:", err);
    process.exit(1);
  }
}

seedAdmin();
