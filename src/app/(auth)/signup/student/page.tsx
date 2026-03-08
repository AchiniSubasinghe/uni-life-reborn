import { StudentSignUpForm } from "@/components/student-signup-form"
import { BookOpen, Users, Zap, Heart } from "lucide-react"

export default function StudentSignUpPage() {
  return (
    <div className="site-bg min-h-svh flex relative overflow-hidden">
      <div className="orb w-[600px] h-[600px] bg-amber-600 top-[-15%] left-[-10%]" style={{ opacity: 0.10 }} />
      <div className="orb w-[500px] h-[500px] bg-teal-700 bottom-[-10%] right-[-5%]" style={{ opacity: 0.08 }} />

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] min-h-svh p-12 relative z-10"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/30">
            <span className="text-amber-300 font-bold text-lg">U</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">UniLife</span>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-400/20 px-4 py-1.5 text-xs text-amber-300 font-medium">
              Student account
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Start your{" "}
              <span className="gradient-text">campus journey</span>
            </h2>
            <p className="text-white/50 leading-relaxed">
              Join thousands of students who use UniLife to find housing, food, and services near their university.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: BookOpen, text: "Access verified hostels & boarding houses" },
              { icon: Users, text: "Read & write honest peer reviews" },
              { icon: Zap, text: "AI-powered UniBot to answer questions instantly" },
              { icon: Heart, text: "Save your favourite spots for later" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-400/20 shrink-0">
                  <Icon className="size-4 text-amber-300" />
                </div>
                <span className="text-white/65 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/25 text-xs">&copy; {new Date().getFullYear()} UniLife. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center py-10 px-6 md:px-10 relative z-10">
        <div className="w-full max-w-md">
          <StudentSignUpForm />
        </div>
      </div>
    </div>
  )
}
