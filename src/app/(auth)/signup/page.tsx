import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center px-6">
      <div className="grid md:grid-cols-2 gap-10 max-w-6xl w-full">

        {/* Student Card */}
        <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl border-none bg-white/80 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              🎓 For Students
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Discover nearby hostels, restaurants, salons, supermarkets and more
              around your university. Compare services and find what suits you best.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex justify-center pb-8">
            <Link href="/signup/student">
              <Button size="lg" className="rounded-xl px-8">
                Join as a Student
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Provider Card */}
        <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl border-none bg-white/80 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              🏪 For Providers
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Register as a business owner to list and manage one or more services.
              Connect with university students and grow your customer base.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex justify-center pb-8">
            <Link href="/signup/provider">
              <Button size="lg" variant="secondary" className="rounded-xl px-8">
                Join as a Provider
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
