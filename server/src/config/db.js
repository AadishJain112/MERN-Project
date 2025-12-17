const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;

const getMongoUri = async () => {
  if (process.env.MONGO_URI && process.env.MONGO_URI.trim()) {
    return { uri: process.env.MONGO_URI, inMemory: false };
  }

  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri("cdstar");
  console.warn(
    "⚠️  MONGO_URI not provided. Falling back to an in-memory MongoDB instance for development."
  );
  return { uri, inMemory: true };
};

const seedDemoAccounts = async () => {
  try {
    const User = require("../models/User");

    // Demo accounts data
    const demoAccounts = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "Welcome@123",
        role: "admin",
        department: "IT",
        batch: "2024",
      },
      {
        name: "Teacher User",
        email: "teacher@example.com",
        password: "Welcome@123",
        role: "teacher",
        department: "IT",
        batch: "2024",
      },
      {
        name: "Student User",
        email: "student@example.com",
        password: "Welcome@123",
        role: "student",
        department: "IT",
        batch: "2024",
      },
    ];

    // Check if demo accounts already exist
    const existingCount = await User.countDocuments();

    if (existingCount === 0) {
      console.log("\n📝 Creating demo accounts...");
      for (const account of demoAccounts) {
        const exists = await User.findOne({ email: account.email });
        if (!exists) {
          const hashedPassword = await bcrypt.hash(account.password, 10);
          await User.create({
            ...account,
            password: hashedPassword,
          });
          console.log(`✅ Created ${account.role} account: ${account.email}`);
        }
      }
      console.log("\n🎯 DEMO LOGIN CREDENTIALS:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("ADMIN:");
      console.log("  Email: admin@example.com");
      console.log("  Password: Welcome@123");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("TEACHER:");
      console.log("  Email: teacher@example.com");
      console.log("  Password: Welcome@123");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("STUDENT:");
      console.log("  Email: student@example.com");
      console.log("  Password: Welcome@123");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } else {
      console.log(
        `\n✓ Demo accounts already exist (${existingCount} users in database)\n`
      );
    }
  } catch (error) {
    console.error("Error seeding demo accounts:", error.message);
  }
};

const connectDB = async () => {
  try {
    const { uri, inMemory } = await getMongoUri();
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    const hostLabel = inMemory ? "in-memory instance" : conn.connection.host;
    console.log(`MongoDB connected: ${hostLabel}`);

    // Seed demo accounts after successful connection
    await seedDemoAccounts();
  } catch (error) {
    console.error("Mongo connection error:", error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = { connectDB, disconnectDB };
