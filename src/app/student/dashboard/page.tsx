"use client";

import { useEffect, useState } from "react";
import { Search, Heart, Star, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { BusinessCard } from "@/components/shared/BusinessCard";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { getApprovedBusinesses } from "@/lib/services/business-service";
import { getAllCategories } from "@/lib/services/category-service";
import { getFavoritesByUser } from "@/lib/services/favorites-service";
import { Business, Category } from "@/types";

export default function StudentDashboard() {
  const { userData } = useAuth();
  const [recentBusinesses, setRecentBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [businessesResult, categoriesData] = await Promise.all([
          getApprovedBusinesses({}, undefined, 6),
          getAllCategories(),
        ]);
        
        setRecentBusinesses(businessesResult.businesses);
        setCategories(categoriesData.slice(0, 8));

        if (userData?.uid) {
          const favorites = await getFavoritesByUser(userData.uid);
          setFavoriteCount(favorites.length);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [userData?.uid]);

  const firstName = (userData && 'fullName' in userData ? userData.fullName?.split(" ")[0] : null) || "Student";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {firstName}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Discover essential services near your university
          </p>
        </div>
        <Link href="/student/browse">
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Browse Services
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/15 border border-blue-400/20 flex items-center justify-center">
                <Heart className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{favoriteCount}</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recentBusinesses.length}+</p>
                <p className="text-sm text-muted-foreground">Services</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/15 border border-amber-400/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/15 border border-blue-400/20 flex items-center justify-center">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <Link href="/student/browse" className="text-2xl font-bold hover:text-primary">
                  Search
                </Link>
                <p className="text-sm text-muted-foreground">Explore Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Browse by Category</h2>
          <Link href="/student/browse" className="text-sm text-blue-300 hover:text-blue-200 flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              href={`/student/browse?category=${category.slug}`}
            />
          ))}
        </div>
      </section>

      {/* Recent Services */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recently Added Services</h2>
          <Link href="/student/browse" className="text-sm text-blue-300 hover:text-blue-200 flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-72 animate-pulse bg-white/[0.04]" />
            ))}
          </div>
        ) : recentBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                showFavoriteButton={true}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No services available yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back later for new listings!
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
