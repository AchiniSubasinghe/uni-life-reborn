"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";

import { auth } from "@/config/firebase.config";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function getResetErrorMessage(error: any): string {
  switch (error?.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
      return "No account found for this email address.";
    case "auth/too-many-requests":
      return "Too many requests. Please wait a bit and try again.";
    default:
      return error?.message || "Failed to send reset email. Please try again.";
  }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail);

      if (signInMethods.length === 0) {
        setError("This email is not registered.");
        return;
      }

      if (!signInMethods.includes("password")) {
        setError("This account uses social sign-in. Please sign in with Google or Apple.");
        return;
      }

      await sendPasswordResetEmail(auth, normalizedEmail);
      setSuccess("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      setError(getResetErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-bg min-h-svh flex items-center justify-center p-6 relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-amber-600 top-[-10%] left-[-10%]" style={{ opacity: 0.12 }} />
      <div className="orb w-[420px] h-[420px] bg-teal-700 bottom-[-10%] right-[-10%]" style={{ opacity: 0.1 }} />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-7"
        style={{
          background: "rgba(255,255,255,0.045)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
        <p className="text-sm text-white/50 mb-6">
          Enter your account email and we&apos;ll send a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </FieldGroup>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-400/20 px-3 py-2.5">
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-500/10 border border-green-400/20 px-3 py-2.5">
              <span className="text-green-300 text-sm">{success}</span>
            </div>
          )}

          <Button type="submit" disabled={loading} className="h-11 text-sm font-semibold mt-1">
            {loading ? "Sending..." : "Send reset link"}
          </Button>

          <p className="text-sm text-white/45 text-center mt-1">
            Remember your password?{" "}
            <Link href="/login" className="text-amber-300 hover:text-amber-200 transition-colors">
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
