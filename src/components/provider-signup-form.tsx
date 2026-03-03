"use client"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
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
  firstName: "",
  lastName: "",
  email: "",
  nic: "",
  phone: "",
  password: "",
  confirmPassword: "",
}

type FormErrors = Partial<Record<keyof typeof INITIAL_FORM | "terms" | "submit", string>>

export function ProviderSignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
        fullName: formData.firstName.trim(),
        email: formData.email.trim(),
        nic: formData.nic.trim(),
        role: "provider",
        createdAt: serverTimestamp(),
      })

      setFormData(INITIAL_FORM)
      setAgreedToTerms(false)
      alert("Provider account created successfully!")
    } catch (error: any) {
      console.error(error)
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className={cn("flex flex-col gap-4 sm:gap-6 w-full max-w-md mx-auto px-4 sm:px-6", className)} {...props}>
      <div
        className="relative overflow-hidden rounded-2xl p-7 flex flex-col gap-6"
        style={{
          background: 'rgba(255,255,255,0.045)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none rounded-2xl" />
      <form onSubmit={handleSignUp} noValidate className="relative z-10">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 border border-white/15 mb-1">
              <span className="text-white font-bold text-base">U</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Create a Provider Account</h1>
            <p className="text-sm text-white/45">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-300 hover:text-indigo-200 transition-colors">Sign In</Link>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Field className="flex-1">
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
            </Field>

            <Field className="flex-1">
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
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              aria-invalid={!!errors.email}
              required
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </Field>

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
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
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
                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.confirmPassword && <FieldError>{errors.confirmPassword}</FieldError>}
          </Field>

          <Field>
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked)
                  setErrors((prev) => ({ ...prev, terms: undefined }))
                }}
                className="mt-0.5 accent-primary"
              />
              <span className="text-white/45">
                I agree to the{" "}
                <Link href="/terms" className="underline underline-offset-4 hover:text-indigo-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-indigo-300">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.terms && <FieldError>{errors.terms}</FieldError>}
          </Field>


          {errors.submit && (
            <FieldError className="text-center">{errors.submit}</FieldError>
          )}

          <Field>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Sign Up"}
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Continue with Apple
            </Button>
            <Button variant="outline" type="button">
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
      </form>
      <p className="px-4 text-center text-xs text-white/35 relative z-10">
        Register as a provider to add verified hostels and essential services.
      </p>
      </div>
    </div>
  )
}
