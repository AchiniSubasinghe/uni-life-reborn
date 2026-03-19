"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllBusinesses } from "@/lib/services/business-service";
import { getAllUsers } from "@/lib/services/user-service";
import {
  getBusinessRegistrationsByMonth,
  getMostSearchedCategories,
} from "@/lib/services/analytics-service";
import { Business } from "@/types";

type RegistrationPoint = {
  label: string;
  count: number;
};

const PIE_COLORS = ["#f59e0b", "#10b981", "#06b6d4", "#f97316", "#6366f1", "#ef4444", "#8b5cf6", "#14b8a6"];

export default function AdminAnalyticsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchCategories, setSearchCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [businessesData, searchData, usersData] = await Promise.all([
          getAllBusinesses(),
          getMostSearchedCategories(60),
          getAllUsers(),
        ]);

        setBusinesses(businessesData);
        setSearchCategories(searchData);
        setTotalUsers(usersData.length);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const registrations = useMemo<RegistrationPoint[]>(
    () => getBusinessRegistrationsByMonth(businesses, 6),
    [businesses]
  );

  const approvedBusinesses = useMemo(
    () => businesses.filter((business) => business.status === "approved" && !business.isBlocked),
    [businesses]
  );

  const monthlyTrendData = useMemo(
    () => registrations.map((item, index) => ({
      month: item.label,
      businesses: item.count,
      cumulative: registrations.slice(0, index + 1).reduce((sum, point) => sum + point.count, 0),
    })),
    [registrations]
  );

  const categoryMixData = useMemo(() => {
    const counts = new Map<string, number>();
    approvedBusinesses.forEach((business) => {
      counts.set(business.category, (counts.get(business.category) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [approvedBusinesses]);

  const keyMetrics = useMemo(() => {
    const totalBusinesses = businesses.length;
    const approved = businesses.filter((business) => business.status === "approved" && !business.isBlocked).length;
    const approvalRate = totalBusinesses > 0 ? Math.round((approved / totalBusinesses) * 100) : 0;
    const trendThisMonth = registrations[registrations.length - 1]?.count || 0;

    return {
      totalUsers,
      totalBusinesses,
      approvalRate,
      trendThisMonth,
    };
  }, [businesses, registrations, totalUsers]);

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Platform insights across users, business growth, and student search behavior.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-white/20 bg-white/10 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{keyMetrics.totalUsers}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-white/10 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Businesses</p>
                <p className="text-2xl font-bold">{keyMetrics.totalBusinesses}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-emerald-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-white/10 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-2xl font-bold">{keyMetrics.approvalRate}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                <Activity className="h-5 w-5 text-cyan-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-white/10 backdrop-blur-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">{keyMetrics.trendThisMonth}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-white/20 bg-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Business Registrations by Month
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(245,158,11,0.08)" }} />
                <Legend />
                <Bar dataKey="businesses" name="New Businesses" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Trend (Monthly + Cumulative)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="businesses"
                  name="Monthly"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-white/20 bg-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Approved Business Category Mix
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {categoryMixData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No approved businesses available yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    data={categoryMixData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={95}
                    paddingAngle={4}
                    label
                  >
                    {categoryMixData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Most Searched Categories (60 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {searchCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No search analytics yet. Student searches will appear here.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={searchCategories.map((item) => ({
                  category: item.category,
                  searches: item.count,
                }))} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis type="number" stroke="#9ca3af" allowDecimals={false} />
                  <YAxis type="category" dataKey="category" stroke="#9ca3af" width={96} />
                  <Tooltip />
                  <Bar dataKey="searches" fill="#f97316" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
