"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  Plus,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/provider/dashboard", label: "Dashboard", icon: Home },
  { href: "/provider/businesses", label: "My Businesses", icon: Building2 },
  { href: "/provider/businesses/new", label: "Add Business", icon: Plus },
  { href: "/provider/reviews", label: "Reviews", icon: Star },
  { href: "/provider/settings", label: "Settings", icon: Settings },
];

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { userData, signOut } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      Cookies.remove("auth-token");
      Cookies.remove("user-role");
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const providerData = (userData || {}) as {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    photoURL?: string;
    isVerified?: boolean;
  };
  const displayName = providerData?.firstName 
    ? `${providerData.firstName} ${providerData.lastName || ""}`.trim()
    : providerData?.fullName || "Provider";
  const photoURL = providerData?.photoURL;

  return (
    <div className="min-h-screen site-bg">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4"
        style={{ background: 'rgba(14,10,4,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="text-white/60 hover:text-white">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex justify-center">
          <Link href="/provider/dashboard" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-white text-xs font-bold">U</span>
            </div>
            <span className="font-semibold text-white text-sm">Provider</span>
          </Link>
        </div>
      </header>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(14,10,4,0.72)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: 'rgba(12,8,3,0.92)', backdropFilter: 'blur(32px)', borderRight: '1px solid rgba(255,255,255,0.07)' }}
      >
          {/* Logo */}
          <div className="h-14 flex items-center justify-between px-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <Link href="/provider/dashboard" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white text-xs font-bold">U</span>
              </div>
              <span className="font-semibold text-white text-sm">Provider</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-teal-500/20 border border-teal-400/20 flex items-center justify-center flex-shrink-0">
                {photoURL ? (
                  <Image
                    src={photoURL}
                    alt="Provider profile"
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-teal-300">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-white text-sm">{displayName}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/40">Provider</span>
                  {providerData?.isVerified && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-400/20 px-1.5 py-0.5 text-[10px] text-emerald-300">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/provider/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
