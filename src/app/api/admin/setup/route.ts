import { NextResponse } from "next/server";
import { setupAdminUser, DEFAULT_ADMIN_CONFIG } from "@/lib/admin-setup";

// This endpoint should be called once to set up the admin user
// In production, add additional security measures or use Firebase Admin SDK

export async function POST(request: Request) {
  try {
    // Optional: Add a secret key check for security
    const { searchParams } = new URL(request.url);
    const setupKey = searchParams.get("key");
    
    // Simple security check (use a stronger method in production)
    const expectedKey = process.env.ADMIN_SETUP_KEY || "setup-uni-life-admin-2024";
    
    if (setupKey !== expectedKey) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid setup key" },
        { status: 401 }
      );
    }

    const result = await setupAdminUser(DEFAULT_ADMIN_CONFIG);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        uid: result.uid,
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
