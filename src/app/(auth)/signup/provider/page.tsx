import { ProviderSignUpForm } from "@/components/provider-signup-form"
import { Building2, BadgeCheck, TrendingUp, Globe } from "lucide-react"

export default function ProviderSignUpPage() {
  return (
    <div className="site-bg min-h-svh flex relative overflow-hidden">
      <div className="orb w-[600px] h-[600px] bg-teal-700 top-[-15%] right-[-10%]" style={{ opacity: 0.10 }} />
      <div className="orb w-[500px] h-[500px] bg-amber-600 bottom-[-10%] left-[-5%]" style={{ opacity: 0.10 }} />

      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[40%] min-h-svh p-12 relative z-10"
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
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-400/20 px-4 py-1.5 text-xs text-teal-300 font-medium">
              Provider account
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Reach{" "}<span className="gradient-text">thousands</span>{" "}of students
            </h2>
            <p className="text-white/50 leading-relaxed">
              List your hostel, food outlet, or service on UniLife and get discovered by students at Sri Lankan universities.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Building2, text: "List unlimited businesses and services" },
              { icon: BadgeCheck, text: "Verified badge builds trust instantly" },
              { icon: TrendingUp, text: "Track views, saves, and inquiries" },
              { icon: Globe, text: "Free listing — no subscription required" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-teal-500/15 border border-teal-400/20 shrink-0">
                  <Icon className="size-4 text-teal-300" />
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
        <div className="w-full max-w-lg">
          <ProviderSignUpForm />
        </div>
      </div>
    </div>
  )
}
