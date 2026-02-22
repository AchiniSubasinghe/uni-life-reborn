import { StudentSignUpForm } from "@/components/student-signup-form"

export default function StudentSignUpPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <StudentSignUpForm />
      </div>
    </div>
  )
}
