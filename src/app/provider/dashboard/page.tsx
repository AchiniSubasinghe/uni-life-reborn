"use client";

import { useEffect, useState } from "react";
import { Building2, Clock, CheckCircle, XCircle, Star, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { BusinessCard } from "@/components/shared/BusinessCard";
import { getBusinessesByProvider } from "@/lib/services/business-service";
import { Business } from "@/types";

export default function ProviderDashboard() {
  const { userData } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusinesses() {
      if (!userData?.uid) return;
      
      try {
        const data = await getBusinessesByProvider(userData.uid);
        setBusinesses(data);
      } catch (error) {
        console.error("Error loading businesses:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBusinesses();
  }, [userData?.uid]);

  const providerData = userData as any;
  const displayName = providerData?.firstName 
    ? providerData.firstName
    : providerData?.fullName?.split(" ")[0] || "Provider";

  const pendingCount = businesses.filter(b => b.status === "pending").length;
  const approvedCount = businesses.filter(b => b.status === "approved").length;
  const rejectedCount = businesses.filter(b => b.status === "rejected").length;
  const totalReviews = businesses.reduce((sum, b) => sum + b.totalReviews, 0);
  const avgRating = businesses.length > 0 
    ? businesses.reduce((sum, b) => sum + b.averageRating, 0) / businesses.filter(b => b.averageRating > 0).length || 0
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {displayName}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Manage your business listings and reviews
          </p>
        </div>
        <Link href="/provider/businesses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Business
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/15 border border-blue-400/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{businesses.length}</p>
                <p className="text-sm text-muted-foreground">Total Listings</p>
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
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/15 border border-orange-400/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Alert */}
      {pendingCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">
                  {pendingCount} {pendingCount === 1 ? "business" : "businesses"} pending approval
                </p>
                <p className="text-sm text-yellow-700">
                  Your listing will be visible after admin review
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected Alert */}
      {rejectedCount > 0 && (
        <Card className="border-red-400/20" style={{ background: 'rgba(239,68,68,0.08)' }}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="flex-1">
                <p className="font-medium text-red-300">
                  {rejectedCount} {rejectedCount === 1 ? "listing was" : "listings were"} rejected
                </p>
                <p className="text-sm text-red-300/70">
                  Check the rejection reason and update your listing
                </p>
              </div>
              <Link href="/provider/businesses?status=rejected">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Businesses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Businesses</h2>
          <Link href="/provider/businesses" className="text-sm text-blue-300 hover:text-blue-200 flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-72 animate-pulse bg-white/[0.04]" />
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.slice(0, 6).map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                showFavoriteButton={false}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No businesses yet</p>
              <p className="text-muted-foreground mt-1 mb-4">
                Start by adding your first business listing
              </p>
              <Link href="/provider/businesses/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Business
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
