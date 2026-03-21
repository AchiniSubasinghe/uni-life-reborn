"use client"
import { useCallback, useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  FacebookAuthProvider,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  User,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import Cookies from "js-cookie"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { auth, db } from "@/config/firebase.config"
import { createUnifiedUserNotification } from "@/lib/services/user-service"

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  nic: "",
  phone: "",
  password: "",
  confirmPassword: "",
}

type FormErrors = Partial<Record<keyof typeof INITIAL_FORM | "terms" | "submit", string>>
type FirebaseAuthError = { code?: string; message?: string }

function getAuthErrorMessage(error: unknown): string {
  const authError = error as FirebaseAuthError

  switch (authError.code) {
    case "auth/popup-blocked":
      return "Popup was blocked by your browser. Please allow popups and try again."
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method."
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase Authentication settings."
    default:
      return authError.message || "Authentication failed. Please try again."
  }
}

export function ProviderSignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [popupLoading, setPopupLoading] = useState(false)
  const [info, setInfo] = useState("")

  const completeSocialSignUp = useCallback(async (firebaseUser: User) => {
    const [userDoc, studentDoc, providerDoc] = await Promise.all([
      getDoc(doc(db, "users", firebaseUser.uid)),
      getDoc(doc(db, "students", firebaseUser.uid)),
      getDoc(doc(db, "providers", firebaseUser.uid)),
    ])

    let role: "student" | "provider" | "admin" = "provider"

    if (userDoc.exists()) {
      role = userDoc.data().role
    } else if (studentDoc.exists()) {
      role = "student"
    } else if (providerDoc.exists()) {
      role = "provider"
    } else {
      const fullName = firebaseUser.displayName?.trim() || ""
      const [firstName, ...rest] = fullName.split(" ")

      await setDoc(doc(db, "providers", firebaseUser.uid), {
        firstName: firstName || "Provider",
        lastName: rest.join(" ") || "User",
        email: firebaseUser.email?.trim() || "",
        nic: "",
        phone: firebaseUser.phoneNumber?.trim() || "",
        role: "provider",
        businessIds: [],
        isVerified: false,
        isActive: true,
        createdAt: serverTimestamp(),
      })

      await createUnifiedUserNotification({
        uid: firebaseUser.uid,
        email: firebaseUser.email?.trim() || "",
        role: "provider",
      })
    }

    const token = await firebaseUser.getIdToken()
    Cookies.set("auth-token", token, { expires: 7 })
    Cookies.set("user-role", role, { expires: 7 })

    if (role === "student") {
      router.push("/student/dashboard")
      return
    }

    if (role === "admin") {
      router.push("/admin/dashboard")
      return
    }

    router.push("/provider/dashboard")
  }, [router])

  useEffect(() => {
    const resolveRedirectSignIn = async () => {
      try {
        const redirectResult = await getRedirectResult(auth)
        if (!redirectResult?.user) return
        await completeSocialSignUp(redirectResult.user)
      } catch (error: unknown) {
        setErrors({ submit: getAuthErrorMessage(error) })
      }
    }

    resolveRedirectSignIn()
  }, [completeSocialSignUp])


  const handleChange = (field: keyof typeof INITIAL_FORM, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!formData.firstName.trim()) e.firstName = "First name is required."
    if (!formData.lastName.trim()) e.lastName = "Last name is required."
    if (!formData.email.trim()) e.email = "Email is required."
    if (!formData.nic.trim()) e.nic = "NIC is required."
    if (!formData.phone.trim()) e.phone = "Phone number is required."
    if (formData.password.length < 8) e.password = "Password must be at least 8 characters."
    if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match."
    if (!agreedToTerms) e.terms = "You must agree to the terms and conditions."
    return e
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setLoading(true)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      await setDoc(doc(db, "providers", userCredential.user.uid), {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        nic: formData.nic.trim(),
        phone: formData.phone.trim(),
        role: "provider",
        businessIds: [],
        isVerified: false,
        isActive: true,
        createdAt: serverTimestamp(),
      })

      await createUnifiedUserNotification({
        uid: userCredential.user.uid,
        email: formData.email.trim(),
        role: "provider",
      })

      // Set auth cookies for middleware
      const token = await userCredential.user.getIdToken()
      Cookies.set("auth-token", token, { expires: 7 })
      Cookies.set("user-role", "provider", { expires: 7 })

      router.push("/provider/onboarding")
    } catch (error: unknown) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create account."
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (popupLoading || loading) return
    setPopupLoading(true)
    setErrors({})
    setInfo("")

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })

      const result = await signInWithPopup(auth, provider)
      await completeSocialSignUp(result.user)
    } catch (error: unknown) {
      const authError = error as FirebaseAuthError

      if (authError.code === "auth/popup-blocked" || authError.code === "auth/web-storage-unsupported") {
        try {
          const provider = new GoogleAuthProvider()
          provider.setCustomParameters({ prompt: "select_account" })
          setInfo("Using redirect sign-in because popup was blocked...")
          await signInWithRedirect(auth, provider)
          return
        } catch (redirectError: unknown) {
          setErrors({ submit: getAuthErrorMessage(redirectError) })
          return
        }
      }

      if (authError.code !== "auth/cancelled-popup-request" && authError.code !== "auth/popup-closed-by-user") {
        setErrors({ submit: getAuthErrorMessage(authError) })
      }
    } finally {
      setPopupLoading(false)
    }
  }

  const handleFacebookSignUp = async () => {
    if (popupLoading || loading) return
    setPopupLoading(true)
    setErrors({})
    setInfo("")

    try {
      const provider = new FacebookAuthProvider()
      provider.addScope("email")

      const result = await signInWithPopup(auth, provider)
      await completeSocialSignUp(result.user)
    } catch (error: unknown) {
      const authError = error as FirebaseAuthError

      if (authError.code === "auth/popup-blocked" || authError.code === "auth/web-storage-unsupported") {
        try {
          const provider = new FacebookAuthProvider()
          provider.addScope("email")
          setInfo("Using redirect sign-in because popup was blocked...")
          await signInWithRedirect(auth, provider)
          return
        } catch (redirectError: unknown) {
          setErrors({ submit: getAuthErrorMessage(redirectError) })
          return
        }
      }

      if (authError.code !== "auth/cancelled-popup-request" && authError.code !== "auth/popup-closed-by-user") {
        setErrors({ submit: getAuthErrorMessage(authError) })
      }
    } finally {
      setPopupLoading(false)
    }
  }


  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div
        className="relative overflow-hidden rounded-2xl px-7 py-8 flex flex-col gap-5"
        style={{
          background: 'rgba(255,255,255,0.045)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none rounded-2xl" />
        <form onSubmit={handleSignUp} noValidate className="relative z-10 flex flex-col gap-5">

          {/* Header */}
          <div className="space-y-1 mb-1">
            <h1 className="text-2xl font-bold text-white">Create provider account</h1>
            <p className="text-sm text-white/45">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-300 hover:text-amber-200 transition-colors font-medium">Sign in</Link>
            </p>
          </div>

          {/* Fields */}
          <FieldGroup className="gap-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                <Input
                  id="first-name"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  aria-invalid={!!errors.firstName}
                  required
                />
                {errors.firstName && <FieldError>{errors.firstName}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                <Input
                  id="last-name"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  aria-invalid={!!errors.lastName}
                  required
                />
                {errors.lastName && <FieldError>{errors.lastName}</FieldError>}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@business.lk"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                aria-invalid={!!errors.email}
                required
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>

            {/* NIC + Phone row */}
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="nic">NIC</FieldLabel>
                <Input
                  id="nic"
                  type="text"
                  placeholder="123456789V"
                  value={formData.nic}
                  onChange={(e) => handleChange("nic", e.target.value)}
                  aria-invalid={!!errors.nic}
                  required
                />
                {errors.nic && <FieldError>{errors.nic}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+94 77 123 4567"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  aria-invalid={!!errors.phone}
                  required
                />
                {errors.phone && <FieldError>{errors.phone}</FieldError>}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  aria-invalid={!!errors.password}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-white/35 hover:text-white/70 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <FieldError>{errors.password}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  aria-invalid={!!errors.confirmPassword}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-white/35 hover:text-white/70 transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
            </Field>

            <Field>
              <label className="flex items-start gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked)
                    setErrors((prev) => ({ ...prev, terms: undefined }))
                  }}
                  className="mt-0.5 accent-amber-400"
                />
                <span className="text-white/45">
                  I agree to the{" "}
                  <Link href="/terms" className="underline underline-offset-4 hover:text-amber-300">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline underline-offset-4 hover:text-amber-300">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && <FieldError>{errors.terms}</FieldError>}
            </Field>
          </FieldGroup>

          {errors.submit && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-400/20 px-3 py-2.5">
              <span className="text-red-300 text-sm">{errors.submit}</span>
            </div>
          )}

          <Button type="submit" disabled={loading} className="h-11 text-sm font-semibold">
            {loading ? "Creating account…" : "Create provider account"}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30">or sign up with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={popupLoading || loading}
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
              onClick={handleFacebookSignUp}
              disabled={popupLoading || loading}
              className="relative flex items-center justify-center gap-3 w-full h-11 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all duration-200 hover:bg-white/[0.07] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <svg className="size-[18px] shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.019 4.388 11.009 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.017 1.792-4.685 4.533-4.685 1.313 0 2.686.236 2.686.236v2.963h-1.514c-1.492 0-1.956.931-1.956 1.887v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.082 24 18.092 24 12.073z" fill="currentColor" />
              </svg>
              Continue with Facebook
            </button>
          </div>

          {info && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-400/20 px-3 py-2.5">
              <span className="text-amber-200 text-sm">{info}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
