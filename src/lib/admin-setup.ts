/**
 * Admin User Setup Script
 * 
 * This script creates an admin user with email/password authentication
 * following the same pattern as Student and Provider signup.
 * 
 * Run: npx ts-node scripts/setup-admin.ts
 * Or via API route for one-time setup
 */

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase.config";
import { AdminPermission } from "@/types";

interface AdminSetupConfig {
  email: string;
  password: string;
  fullName: string;
  permissions: AdminPermission[];
}

export async function setupAdminUser(config: AdminSetupConfig): Promise<{ success: boolean; message: string; uid?: string }> {
  const { email, password, fullName, permissions } = config;

  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = userCredential.user.uid;

    // Create admin document in users collection
    await setDoc(doc(db, "users", uid), {
      email: email.trim(),
      fullName: fullName.trim(),
      role: "admin",
      permissions,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: `Admin user created successfully with UID: ${uid}`,
      uid,
    };
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return {
      success: false,
      message: error.message || "Failed to create admin user",
    };
  }
}

export async function checkAdminExists(email: string): Promise<boolean> {
  // This would require admin SDK for production
  // For client-side, we can only check after login
  return false;
}

// Default admin configuration
export const DEFAULT_ADMIN_CONFIG: AdminSetupConfig = {
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
