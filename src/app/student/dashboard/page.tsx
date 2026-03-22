"use client";

import { useEffect, useState } from "react";
import { Search, Heart, Star, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { BusinessCard } from "@/components/shared/BusinessCard";
import { CategoryCard } from "@/components/shared/CategoryCard";
import { getAllBusinesses, getBusinessById } from "@/lib/services/business-service";
import { getAllCategories } from "@/lib/services/category-service";
import { getFavoritesByUser, toggleFavorite } from "@/lib/services/favorites-service";
import { Business, Category } from "@/types";

export default function StudentDashboard() {
  const { userData } = useAuth();
  const [recentBusinesses, setRecentBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalServices, setTotalServices] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteBusinesses, setFavoriteBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData(showInitialLoader: boolean = false) {
      if (showInitialLoader) {
        setLoading(true);
      }

      try {
        const [categoriesData, favoritesData] = await Promise.all([
          getAllCategories(),
          userData?.uid ? getFavoritesByUser(userData.uid) : Promise.resolve([]),
        ]);

        const allBusinesses = await getAllBusinesses();
        const approvedBusinesses = allBusinesses
          .filter((business) => business.status === "approved" && !business.isBlocked)
          .sort((a, b) => {
            const dateA = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
            const dateB = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
            return dateB - dateA;
          });

        if (!mounted) return;

        setRecentBusinesses(approvedBusinesses.slice(0, 6));
        setCategories(categoriesData.slice(0, 8));
        setTotalServices(approvedBusinesses.length);
        setTotalCategories(categoriesData.length);
        setFavoriteCount(favoritesData.length);
        setFavoriteIds(new Set(favoritesData.map((fav) => fav.businessId)));

        if (favoritesData.length > 0) {
          const favoriteBusinessDocs = await Promise.all(
            favoritesData.slice(0, 3).map((fav) => getBusinessById(fav.businessId))
          );

          if (!mounted) return;

          setFavoriteBusinesses(
            favoriteBusinessDocs.filter((business): business is Business => !!business)
          );
        } else {
          setFavoriteBusinesses([]);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData(true);
    const interval = setInterval(() => loadDashboardData(false), 20000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [userData?.uid]);

  const handleFavoriteToggle = async (businessId: string) => {
    if (!userData?.uid) return;

    try {
      const result = await toggleFavorite(userData.uid, businessId);

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (result.isFavorited) {
          next.add(businessId);
        } else {
          next.delete(businessId);
        }
        return next;
      });

      setFavoriteCount((prev) =>
        result.isFavorited ? prev + 1 : Math.max(0, prev - 1)
      );

      const refreshedFavorites = await getFavoritesByUser(userData.uid);
      setFavoriteBusinesses((
        await Promise.all(
          refreshedFavorites.slice(0, 3).map((fav) => getBusinessById(fav.businessId))
        )
      ).filter((business): business is Business => !!business));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/15 border border-amber-400/20 flex items-center justify-center">
                <Heart className="h-5 w-5 text-amber-400" />
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
                <p className="text-2xl font-bold">{totalServices}</p>
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
                <p className="text-2xl font-bold">{totalCategories}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Categories Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Browse by Category</h2>
          <Link href="/student/browse" className="text-sm text-amber-300 hover:text-amber-200 flex items-center">
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
          <Link href="/student/browse" className="text-sm text-amber-300 hover:text-amber-200 flex items-center">
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
                href={`/student/businesses/${business.id}`}
                showFavoriteButton={true}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorited={favoriteIds.has(business.id)}
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

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Favorites</h2>
          <Link href="/student/favorites" className="text-sm text-amber-300 hover:text-amber-200 flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {favoriteBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                href={`/student/businesses/${business.id}`}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorited={favoriteIds.has(business.id)}
                showFavoriteButton={true}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">No favorites yet.</p>
              <Link href="/student/browse" className="text-sm text-amber-300 hover:text-amber-200 mt-2 inline-flex">
                Browse and save businesses
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
