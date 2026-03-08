import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="site-bg min-h-screen flex items-center justify-center px-6 overflow-hidden relative">
      {/* orbs */}
      <div className="orb w-[500px] h-[500px] bg-amber-600 top-[-10%] left-[-10%]" />
      <div className="orb w-[400px] h-[400px] bg-teal-700 bottom-[-5%] right-[-5%]" style={{ opacity: 0.18 }} />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-white/50 hover:text-white transition-colors text-sm">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back to home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Join UniLife</h1>
          <p className="text-white/50 text-base">Choose your account type to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Student Card */}
          <Link href="/signup/student" className="group block">
            <div
              className="relative overflow-hidden rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_40px_rgba(217,119,6,0.20)]"
              style={{
                background: 'rgba(255,255,255,0.045)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              {/* glass sheen */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none rounded-2xl" />
              <div className="text-4xl">🎓</div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">For Students</h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Discover nearby hostels, restaurants, salons, supermarkets and more around your university.
                </p>
              </div>
              <div className="flex items-center gap-2 text-amber-300 text-sm font-medium mt-auto pt-2">
                Join as Student <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>

          {/* Provider Card */}
          <Link href="/signup/provider" className="group block">
            <div
              className="relative overflow-hidden rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_40px_rgba(20,184,166,0.18)]"
              style={{
                background: 'rgba(255,255,255,0.045)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-transparent pointer-events-none rounded-2xl" />
              <div className="text-4xl">🏪</div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">For Providers</h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Register as a business owner to list and manage one or more services. Connect with university students.
                </p>
              </div>
              <div className="flex items-center gap-2 text-teal-300 text-sm font-medium mt-auto pt-2">
                Join as Provider <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>

        <p className="text-center text-white/35 text-sm mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-300 hover:text-amber-200 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
