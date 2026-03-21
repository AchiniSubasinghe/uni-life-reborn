"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  confirmPasswordReset,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
} from "firebase/auth";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

import { auth, db } from "@/config/firebase.config";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const ATTEMPTS_STORAGE_KEY = "password-reset-attempts-v1";
const COOLDOWN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 3;
const WINDOW_MS = 10 * 60 * 1000;
const LOCKOUT_SECONDS = 5 * 60;

type PasswordResetAttemptState = {
  timestamps: number[];
  cooldownUntil: number;
};

function getResetErrorMessage(error: unknown): string {
  const authError = error as { code?: string; message?: string };

  switch (authError.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many requests. Please wait a bit and try again.";
    default:
      return authError.message || "Failed to send reset email. Please try again.";
  }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [oobCode, setOobCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(true);
  const [codeVerified, setCodeVerified] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const actionCode = params.get("oobCode");

    if (mode !== "resetPassword" || !actionCode) {
      setValidatingCode(false);
      return;
    }

    const verifyCode = async () => {
      try {
        await verifyPasswordResetCode(auth, actionCode);
        setOobCode(actionCode);
        setCodeVerified(true);
      } catch {
        setError("This password reset link is invalid or has expired.");
      } finally {
        setValidatingCode(false);
      }
    };

    verifyCode();
  }, []);

  const getAttemptState = (normalizedEmail: string): PasswordResetAttemptState => {
    if (typeof window === "undefined") {
      return { timestamps: [], cooldownUntil: 0 };
    }

    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (!raw) {
      return { timestamps: [], cooldownUntil: 0 };
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, PasswordResetAttemptState>;
      return parsed[normalizedEmail] || { timestamps: [], cooldownUntil: 0 };
    } catch {
      return { timestamps: [], cooldownUntil: 0 };
    }
  };

  const setAttemptState = (
    normalizedEmail: string,
    attemptState: PasswordResetAttemptState
  ) => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    let parsed: Record<string, PasswordResetAttemptState> = {};

    if (raw) {
      try {
        parsed = JSON.parse(raw) as Record<string, PasswordResetAttemptState>;
      } catch {
        parsed = {};
      }
    }

    parsed[normalizedEmail] = attemptState;
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(parsed));
  };

  const getSecondsRemaining = (cooldownUntil: number): number =>
    Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));

  const startCooldownTimer = (cooldownUntil: number) => {
    const tick = () => {
      setCooldownRemaining(getSecondsRemaining(cooldownUntil));
    };

    tick();
    const intervalId = window.setInterval(() => {
      tick();
      if (Date.now() >= cooldownUntil) {
        window.clearInterval(intervalId);
      }
    }, 1000);
  };

  const isEmailRegistered = async (normalizedEmail: string): Promise<boolean> => {
    const collections = ["users", "students", "providers"];

    for (const collectionName of collections) {
      const q = query(
        collection(db, collectionName),
        where("email", "==", normalizedEmail),
        limit(1)
      );

      const snap = await getDocs(q);
      if (!snap.empty) {
        return true;
      }
    }

    return false;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();

      const currentAttemptState = getAttemptState(normalizedEmail);
      const now = Date.now();
      const recentTimestamps = currentAttemptState.timestamps.filter(
        (timestamp) => now - timestamp <= WINDOW_MS
      );

      if (now < currentAttemptState.cooldownUntil) {
        const waitSeconds = getSecondsRemaining(currentAttemptState.cooldownUntil);
        setError(`Please wait ${waitSeconds}s before sending another reset email.`);
        startCooldownTimer(currentAttemptState.cooldownUntil);
        return;
      }

      if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        const lockoutUntil = now + LOCKOUT_SECONDS * 1000;
        setAttemptState(normalizedEmail, {
          timestamps: recentTimestamps,
          cooldownUntil: lockoutUntil,
        });
        setError("Too many reset requests. Please wait 5 minutes before trying again.");
        startCooldownTimer(lockoutUntil);
        return;
      }

      const registered = await isEmailRegistered(normalizedEmail);
      if (!registered) {
        setError("No account found with this email address.");
        return;
      }

      await sendPasswordResetEmail(auth, normalizedEmail);
      const cooldownUntil = now + COOLDOWN_SECONDS * 1000;
      setAttemptState(normalizedEmail, {
        timestamps: [...recentTimestamps, now],
        cooldownUntil,
      });
      setSuccess("Password reset link sent. Please check your email inbox.");
      startCooldownTimer(cooldownUntil);
    } catch (err: unknown) {
      setError(getResetErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oobCode || !codeVerified) {
      setError("This password reset link is invalid or has expired.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setResetLoading(true);
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess("Your password has been updated. You can now sign in.");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: unknown) {
      setError(getResetErrorMessage(err));
    } finally {
      setResetLoading(false);
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
        {validatingCode ? (
          <div className="py-6 text-center text-sm text-white/65">Validating reset link...</div>
        ) : codeVerified ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Set a new password</h1>
            <p className="text-sm text-white/50 mb-6">
              Enter your new password to complete the reset.
            </p>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                  <Input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmNewPassword">Confirm Password</FieldLabel>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
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

              <Button type="submit" disabled={resetLoading} className="h-11 text-sm font-semibold mt-1">
                {resetLoading ? "Updating..." : "Update password"}
              </Button>

              <p className="text-sm text-white/45 text-center mt-1">
                <Link href="/login" className="text-amber-300 hover:text-amber-200 transition-colors">
                  Back to sign in
                </Link>
              </p>
            </form>
          </>
        ) : (
          <>
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

              <Button type="submit" disabled={loading || cooldownRemaining > 0} className="h-11 text-sm font-semibold mt-1">
                {loading
                  ? "Sending..."
                  : cooldownRemaining > 0
                  ? `Try again in ${cooldownRemaining}s`
                  : "Send reset link"}
              </Button>

              <p className="text-sm text-white/45 text-center mt-1">
                Remember your password?{" "}
                <Link href="/login" className="text-amber-300 hover:text-amber-200 transition-colors">
                  Back to sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
