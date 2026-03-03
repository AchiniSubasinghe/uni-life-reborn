#!/usr/bin/env bun
/**
 * Admin Account Setup Script
 * Run: bun run scripts/create-admin.ts
 */

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../src/config/firebase.config";

const ADMIN_CONFIG = {
  email: "admin@gmail.com",
  password: "admiN123A",
  fullName: "System Administrator",
  permissions: [
    "manage_users",
    "approve_businesses",
    "remove_reviews",
    "manage_categories",
    "view_analytics",
  ],
};

async function createAdminUser() {
  console.log("🚀 Starting admin user creation...");
  console.log(`📧 Email: ${ADMIN_CONFIG.email}`);

  try {
    // Create Firebase Auth user
    console.log("⏳ Creating Firebase Auth user...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_CONFIG.email,
      ADMIN_CONFIG.password
    );

    const uid = userCredential.user.uid;
    console.log(`✅ Auth user created with UID: ${uid}`);

    // Create admin document in users collection
    console.log("⏳ Creating admin document in Firestore...");
    await setDoc(doc(db, "users", uid), {
      email: ADMIN_CONFIG.email,
      fullName: ADMIN_CONFIG.fullName,
      role: "admin",
      permissions: ADMIN_CONFIG.permissions,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Admin document created in Firestore");
    console.log("\n🎉 Admin user created successfully!");
    console.log("\n📝 Login credentials:");
    console.log(`   Email: ${ADMIN_CONFIG.email}`);
    console.log(`   Password: ${ADMIN_CONFIG.password}`);
    console.log("\n✨ You can now log in at /login\n");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error creating admin user:");
    
    if (error.code === "auth/email-already-in-use") {
      console.error("   The email is already registered.");
      console.error("   If you forgot the password, use Firebase Console to reset it.");
    } else {
      console.error(`   ${error.message}`);
    }
    
    process.exit(1);
  }
}

// Run the script
createAdminUser();
