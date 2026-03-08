import { ProviderSignUpForm } from "@/components/provider-signup-form"

export default function ProviderSignUpPage() {
  return (
    <div className="site-bg min-h-svh flex flex-col items-center justify-center gap-6 p-6 md:p-10 relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-teal-700 top-[-10%] right-[-10%]" style={{ opacity: 0.18 }} />
      <div className="orb w-[400px] h-[400px] bg-amber-600 bottom-[-5%] left-[-5%]" />
      <div className="w-full max-w-lg relative z-10">
        <ProviderSignUpForm />
      </div>
    </div>
  )
}
