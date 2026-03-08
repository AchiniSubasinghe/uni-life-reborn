"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Building2,
  GraduationCap,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllUsers, toggleUserActive } from "@/lib/services/user-service";
import { User, UserRole } from "@/types";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const ROLE_COLORS: Record<UserRole, string> = {
  student: "bg-blue-500/15 border border-blue-400/20 text-blue-300",
  provider: "bg-cyan-500/15 border border-cyan-400/20 text-cyan-300",
  admin: "bg-red-500/15 border border-red-400/20 text-red-300",
};

const ROLE_ICONS: Record<UserRole, any> = {
  student: GraduationCap,
  provider: Building2,
  admin: Shield,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  async function loadUsers() {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }

  function filterUsers() {
    let filtered = [...users];

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(query) ||
          (u as any).fullName?.toLowerCase().includes(query) ||
          (u as any).firstName?.toLowerCase().includes(query) ||
          (u as any).lastName?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  }

  const handleToggleActive = async (user: User) => {
    setActionLoading(user.uid);
    try {
      await toggleUserActive(user.uid, !user.isActive);
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid ? { ...u, isActive: !u.isActive } : u
        )
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getUserDisplayName = (user: User): string => {
    if ((user as any).fullName) return (user as any).fullName;
    if ((user as any).firstName) {
      return `${(user as any).firstName} ${(user as any).lastName || ""}`.trim();
    }
    return user.email.split("@")[0];
  };

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    providers: users.filter((u) => u.role === "provider").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-20 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all platform users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/15 border border-blue-400/20 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.students}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.providers}</p>
                <p className="text-sm text-muted-foreground">Providers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/15 border border-red-400/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.admins}</p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "student", "provider", "admin"] as const).map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(role)}
            >
              {role === "all" ? "All" : role.charAt(0).toUpperCase() + role.slice(1) + "s"}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Contact</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Joined</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const RoleIcon = ROLE_ICONS[user.role];
                  return (
                    <tr key={user.uid} className="border-b last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-500/15 border border-blue-400/20 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-300">
                              {getUserDisplayName(user).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{getUserDisplayName(user)}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                            ROLE_COLORS[user.role]
                          )}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {(user as any).phone && (
                            <>
                              <Phone className="h-3 w-3" />
                              {(user as any).phone}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                            user.isActive !== false
                              ? "bg-emerald-500/15 border border-emerald-400/20 text-emerald-300"
                              : "bg-red-500/15 border border-red-400/20 text-red-300"
                          )}
                        >
                          {user.isActive !== false ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(user)}
                          disabled={actionLoading === user.uid || user.role === "admin"}
                          className={cn(
                            user.isActive !== false
                              ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                              : "text-green-600 hover:text-green-700 hover:bg-green-50"
                          )}
                        >
                          {actionLoading === user.uid ? (
                            "..."
                          ) : user.isActive !== false ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Disable
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Enable
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
