"use client"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { auth, db } from "@/config/firebase.config"
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth";
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
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get user role
      const role = await getUserRole(result.user.uid);
      
      if (!role) {
        // New Google user - redirect to signup selection
        router.push("/signup?google=true");
        return;
      }

      // Set cookies for middleware
      const token = await result.user.getIdToken();
      Cookies.set("auth-token", token, { expires: 7 });
      Cookies.set("user-role", role, { expires: 7 });

      router.push(getDashboardUrl(role));
    } catch (error: any) {
      if (error.code !== "auth/cancelled-popup-request" && error.code !== "auth/popup-closed-by-user") {
        console.error(error.message);
        setError(error.message);
      }
    } finally {
      setPopupLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (popupLoading) return;
    setPopupLoading(true);
    setError("");
    
    try {
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");

      const result = await signInWithPopup(auth, provider);
      
      // Get user role
      const role = await getUserRole(result.user.uid);
      
      if (!role) {
        router.push("/signup?apple=true");
        return;
      }

      const token = await result.user.getIdToken();
      Cookies.set("auth-token", token, { expires: 7 });
      Cookies.set("user-role", role, { expires: 7 });

      router.push(getDashboardUrl(role));
    } catch (error: any) {
      if (error.code !== "auth/cancelled-popup-request" && error.code !== "auth/popup-closed-by-user") {
        console.error(error.message);
        setError(error.message);
      }
    } finally {
      setPopupLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div
        className="relative overflow-hidden rounded-2xl p-7 flex flex-col gap-6"
        style={{
          background: 'rgba(255,255,255,0.045)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        {/* glass sheen */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none rounded-2xl" />
      <form onSubmit={handleLogin} className="relative z-10">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 border border-white/15 mb-1">
              <span className="text-white font-bold text-base">U</span>
            </div>
            <h1 className="text-xl font-bold text-white">Welcome to UniLife</h1>
            <p className="text-sm text-white/45">
              Don't have an account?{" "}
              <Link href="/signup" className="text-indigo-300 hover:text-indigo-200 transition-colors">Sign up</Link>
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && <FieldError className="text-center">{error}</FieldError>}
          <Field>
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-2">
            <Button variant="outline" type="button" onClick={handleAppleLogin} disabled={popupLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </Button>
            <Button variant="outline" type="button" onClick={handleGoogleLogin} disabled={popupLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form >
      <p className="px-4 text-center text-xs text-white/35 relative z-10">
        Create your account to access verified hostels and essential services near your university.
      </p>
      </div>
    </div>
  )
}
