"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Building2,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  GalleryVerticalEnd,
  Shield,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/admin/approvals", label: "Approvals", icon: Shield },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
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
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-300" />
            <span className="font-semibold text-white text-sm">Admin</span>
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
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-300" />
              <span className="font-semibold text-white text-sm">Admin Panel</span>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-amber-500/20 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-white text-sm">
                  {(userData as any)?.fullName || "Administrator"}
                </p>
                <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-400/20 px-2 py-0.5 text-xs text-amber-300">
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
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
