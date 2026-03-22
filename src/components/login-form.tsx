"use client"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { auth } from "@/config/firebase.config"
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  User,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getDashboardUrl, resolveUserRole } from "@/lib/auth/user-role-resolution";

type FirebaseAuthError = { code?: string; message?: string };

function getAuthErrorMessage(error: unknown): string {
  const authError = error as FirebaseAuthError;

  switch (authError.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase Authentication settings.";
    default:
      return authError.message || "Authentication failed. Please try again.";
  }
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popupLoading, setPopupLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const completeSocialLogin = useCallback(async (firebaseUser: User) => {
    const email = firebaseUser.email?.trim().toLowerCase()

    if (!email) {
      setError("Unable to read email from your Google account. Please use another account.")
      return
    }

    const role = await resolveUserRole({
      uid: firebaseUser.uid,
      email,
    });

    if (!role) {
      setInfo("No account found for this Google email. Please choose Student or Provider to continue.")
      router.push("/signup");
      return;
    }

    const token = await firebaseUser.getIdToken();
    Cookies.set("auth-token", token, { expires: 7 });
    Cookies.set("user-role", role, { expires: 7 });

    router.push(getDashboardUrl(role));
  }, [router]);

  useEffect(() => {
    const resolveRedirectSignIn = async () => {
      try {
        const redirectResult = await getRedirectResult(auth);
        if (!redirectResult?.user) return;

        const providerId = redirectResult.providerId;
        if (providerId === "google.com") {
          await completeSocialLogin(redirectResult.user);
        } 
      } catch (err: unknown) {
        setError(getAuthErrorMessage(err));
      }
    };

    resolveRedirectSignIn();
  }, [completeSocialLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Get user role and redirect accordingly
      const role = await resolveUserRole({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      });

      if (!role) {
        setError("User account not found. Please sign up first.");
        return;
      }

      // Set cookies for middleware
      const token = await userCredential.user.getIdToken();
      Cookies.set("auth-token", token, { expires: 7 });
      Cookies.set("user-role", role, { expires: 7 });

      // Redirect based on role
      const dashboardUrl = getDashboardUrl(role);
      router.push(dashboardUrl);

    } catch (error: unknown) {
      const authError = error as FirebaseAuthError;
      console.error(authError.message);
      setError(authError.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (popupLoading) return;
    setPopupLoading(true);
    setError("");
    setInfo("");

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      await completeSocialLogin(result.user);
    } catch (error: unknown) {
      const authError = error as FirebaseAuthError;

      if (authError.code === "auth/popup-blocked" || authError.code === "auth/web-storage-unsupported") {
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          setInfo("Using redirect sign-in because popup was blocked...");
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError: unknown) {
          setError(getAuthErrorMessage(redirectError));
          return;
        }
      }

      if (authError.code !== "auth/cancelled-popup-request" && authError.code !== "auth/popup-closed-by-user") {
        console.error(authError.message);
        setError(getAuthErrorMessage(authError));
      }
    } finally {
      setPopupLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div
        className="relative overflow-hidden rounded-2xl px-7 py-8 flex flex-col gap-6"
        style={{
          background: 'rgba(255,255,255,0.045)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none rounded-2xl" />

        <form onSubmit={handleLogin} className="relative z-10 flex flex-col gap-5">
          {/* Header */}
          <div className="space-y-1 mb-1">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-white/45">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-amber-300 hover:text-amber-200 transition-colors font-medium">Sign up</Link>
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={popupLoading}
              className="relative flex items-center justify-center gap-3 w-full h-11 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all duration-200 hover:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <svg className="size-[18px] shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">or continue with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email & password */}
          <FieldGroup className="gap-4">
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
            <Field>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel htmlFor="password" className="mb-0">Password</FieldLabel>
                <Link href="/forgot-password" className="text-xs text-white/40 hover:text-amber-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </FieldGroup>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-400/20 px-3 py-2.5">
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {info && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-400/20 px-3 py-2.5">
              <span className="text-amber-200 text-sm">{info}</span>
            </div>
          )}

          <Button type="submit" disabled={loading} className="h-11 text-sm font-semibold mt-1">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  )
}
