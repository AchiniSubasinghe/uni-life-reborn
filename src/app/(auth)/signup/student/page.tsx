import { StudentSignUpForm } from "@/components/student-signup-form"

export default function StudentSignUpPage() {
  return (
    <div className="site-bg min-h-svh flex flex-col items-center justify-center gap-6 p-6 md:p-10 relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-amber-600 top-[-10%] left-[-10%]" />
      <div className="orb w-[400px] h-[400px] bg-teal-700 bottom-[-5%] right-[-5%]" style={{ opacity: 0.18 }} />
      <div className="w-full max-w-sm relative z-10">
        <StudentSignUpForm />
      </div>
    </div>
  )
}
