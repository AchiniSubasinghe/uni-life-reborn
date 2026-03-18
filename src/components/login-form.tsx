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
import { auth, db } from "@/config/firebase.config"
import {
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";

type UserRole = "student" | "provider" | "admin";

async function getUserRole(uid: string): Promise<UserRole | null> {
  // Check unified users collection first
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return userDoc.data().role as UserRole;
  }

  // Check legacy students collection
  const studentDoc = await getDoc(doc(db, "students", uid));
  if (studentDoc.exists()) {
    return "student";
  }

  // Check legacy providers collection
  const providerDoc = await getDoc(doc(db, "providers", uid));
  if (providerDoc.exists()) {
    return "provider";
  }

  return null;
}

function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case "student":
      return "/student/dashboard";
    case "provider":
      return "/provider/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

function getAuthErrorMessage(error: any): string {
  switch (error?.code) {
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
      return error?.message || "Authentication failed. Please try again.";
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

  const completeSocialLogin = async (firebaseUser: User, signupProvider: "google" | "apple") => {
    const role = await getUserRole(firebaseUser.uid);

    if (!role) {
      router.push(`/signup?${signupProvider}=true`);
      return;
    }

    const token = await firebaseUser.getIdToken();
    Cookies.set("auth-token", token, { expires: 7 });
    Cookies.set("user-role", role, { expires: 7 });

    router.push(getDashboardUrl(role));
  };

  useEffect(() => {
    const resolveRedirectSignIn = async () => {
      try {
        const redirectResult = await getRedirectResult(auth);
        if (!redirectResult?.user) return;

        const providerId = redirectResult.providerId;
        if (providerId === "google.com") {
          await completeSocialLogin(redirectResult.user, "google");
        } else if (providerId === "apple.com") {
          await completeSocialLogin(redirectResult.user, "apple");
        }
      } catch (err: any) {
        setError(getAuthErrorMessage(err));
      }
    };

    resolveRedirectSignIn();
  }, []);

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
      const role = await getUserRole(userCredential.user.uid);

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

    } catch (error: any) {
      console.error(error.message);
      setError(error.message || "Login failed. Please try again.");
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
      await completeSocialLogin(result.user, "google");
    } catch (error: any) {
      if (error.code === "auth/popup-blocked" || error.code === "auth/web-storage-unsupported") {
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          setInfo("Using redirect sign-in because popup was blocked...");
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError: any) {
          setError(getAuthErrorMessage(redirectError));
          return;
        }
      }

      if (error.code !== "auth/cancelled-popup-request" && error.code !== "auth/popup-closed-by-user") {
        console.error(error.message);
        setError(getAuthErrorMessage(error));
      }
    } finally {
      setPopupLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (popupLoading) return;
    setPopupLoading(true);
    setError("");
    setInfo("");

    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");

      const result = await signInWithPopup(auth, provider);
      await completeSocialLogin(result.user, "apple");
    } catch (error: any) {
      if (error.code !== "auth/cancelled-popup-request" && error.code !== "auth/popup-closed-by-user") {
        console.error(error.message);
        setError(getAuthErrorMessage(error));
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

          {/* Social buttons */}
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
            <button
              type="button"
              onClick={handleAppleLogin}
              disabled={popupLoading}
              className="relative flex items-center justify-center gap-3 w-full h-11 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all duration-200 hover:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <svg className="size-[18px] shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor" />
              </svg>
              Continue with Apple
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
