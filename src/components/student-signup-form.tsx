"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import Cookies from "js-cookie"

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

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
}

type FormErrors = Partial<Record<keyof typeof INITIAL_FORM | "terms" | "submit", string>>

export function StudentSignUpForm({
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

  const handleChange = (field: keyof typeof INITIAL_FORM, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): FormErrors => {
    const e: FormErrors = {}
    if (!formData.fullName.trim()) e.fullName = "Full name is required."
    if (!formData.email.trim()) e.email = "Email is required."
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

      await setDoc(doc(db, "students", userCredential.user.uid), {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: "student",
        favoriteBusinessIds: [],
        isActive: true,
        createdAt: serverTimestamp(),
      })

      // Set auth cookies for middleware
      const token = await userCredential.user.getIdToken()
      Cookies.set("auth-token", token, { expires: 7 })
      Cookies.set("user-role", "student", { expires: 7 })

      router.push("/student/dashboard")
    } catch (error: any) {
      console.error(error)
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
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
            <h1 className="text-2xl font-bold text-white">Create student account</h1>
            <p className="text-sm text-white/45">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-300 hover:text-amber-200 transition-colors font-medium">Sign in</Link>
            </p>
          </div>

          {/* Fields */}
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="full-name">Full Name</FieldLabel>
              <Input
                id="full-name"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                aria-invalid={!!errors.fullName}
                required
              />
              {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@university.lk"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                aria-invalid={!!errors.email}
                required
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
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
            {loading ? "Creating account…" : "Create account"}
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
              className="relative flex items-center justify-center gap-3 w-full h-11 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all duration-200 hover:bg-white/[0.07]"
              style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <svg className="size-[18px] shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              className="relative flex items-center justify-center gap-3 w-full h-11 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all duration-200 hover:bg-white/[0.07]"
              style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <svg className="size-[18px] shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor" />
              </svg>
              Continue with Apple
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
