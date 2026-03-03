"use client";

import Link from "next/link";
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
  GalleryVerticalEnd,
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

  const providerData = userData as any;
  const displayName = providerData?.firstName 
    ? `${providerData.firstName} ${providerData.lastName || ""}`.trim()
    : providerData?.fullName || "Provider";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b h-14 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex justify-center">
          <Link href="/provider/dashboard" className="flex items-center gap-2">
            <GalleryVerticalEnd className="h-5 w-5" />
            <span className="font-semibold">UniLife Provider</span>
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-14 flex items-center justify-between px-4 border-b">
            <Link href="/provider/dashboard" className="flex items-center gap-2">
              <GalleryVerticalEnd className="h-5 w-5" />
              <span className="font-semibold">UniLife Provider</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{displayName}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Provider</span>
                  {providerData?.isVerified && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/provider/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
