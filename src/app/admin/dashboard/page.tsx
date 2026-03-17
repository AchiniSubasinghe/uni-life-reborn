"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getDashboardStats } from "@/lib/services/user-service";
import { getPendingBusinesses, updateBusinessStatus } from "@/lib/services/business-service";
import { getReportedReviews } from "@/lib/services/review-service";
import { DashboardStats, Business, Review } from "@/types";

export default function AdminDashboard() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
  const [reportedReviews, setReportedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, pendingData, reportedData] = await Promise.all([
          getDashboardStats(),
          getPendingBusinesses(),
          getReportedReviews(),
        ]);
        
        setStats(statsData);
        setPendingBusinesses(pendingData);
        setReportedReviews(reportedData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleApproval = async (businessId: string, action: "approve" | "reject") => {
    if (!userData?.uid) return;
    
    try {
      await updateBusinessStatus(
        businessId,
        action === "approve" ? "approved" : "rejected",
        userData.uid,
        action === "reject" ? "Does not meet our guidelines" : undefined
      );
      
      // Remove from pending list
      setPendingBusinesses(prev => prev.filter(b => b.id !== businessId));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          pendingApprovals: stats.pendingApprovals - 1,
          totalBusinesses: action === "approve" ? stats.totalBusinesses : stats.totalBusinesses,
        });
      }
    } catch (error) {
      console.error("Error updating business status:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-white/[0.04] animate-pulse rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-24 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of platform activity and pending actions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/15 border border-amber-400/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalBusinesses || 0}</p>
                <p className="text-sm text-muted-foreground">Businesses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/15 border border-amber-400/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.pendingApprovals || 0}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-teal-500/15 border border-teal-400/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalReviews || 0}</p>
                <p className="text-sm text-muted-foreground">Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Students</p>
              <p className="text-xl font-bold">{stats?.totalStudents || 0}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Providers</p>
              <p className="text-xl font-bold">{stats?.totalProviders || 0}</p>
            </div>
            <Building2 className="h-8 w-8 text-muted-foreground/50" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reported Reviews</p>
              <p className="text-xl font-bold text-red-600">{stats?.reportedReviews || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-200" />
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Business Approvals
          </h2>
          <Link href="/admin/approvals" className="text-sm text-amber-300 hover:text-amber-200 flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {pendingBusinesses.length > 0 ? (
          <div className="space-y-3">
            {pendingBusinesses.slice(0, 5).map((business) => (
              <Card key={business.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{business.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {business.category} • by {business.providerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleApproval(business.id, "reject")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600/80 hover:bg-emerald-600 text-white"
                        onClick={() => handleApproval(business.id, "approve")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-muted-foreground">No pending approvals at the moment.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Reported Reviews */}
      {reportedReviews.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Reported Reviews
            </h2>
            <Link href="/admin/reviews?filter=reported" className="text-sm text-amber-300 hover:text-amber-200 flex items-center">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {reportedReviews.slice(0, 3).map((review) => (
              <Card key={review.id} className="border-red-400/20" style={{ background: 'rgba(239,68,68,0.06)' }}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{review.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        Review on {review.businessName}
                      </p>
                      <p className="text-sm mt-2 line-clamp-2">{review.comment}</p>
                      {review.reportReason && (
                        <p className="text-xs text-red-600 mt-2">
                          <strong>Reason:</strong> {review.reportReason}
                        </p>
                      )}
                    </div>
                    <Link href={`/admin/reviews/${review.businessId}`}>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
