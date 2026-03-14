"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Filter, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchBar } from "@/components/shared/SearchBar";
import { BusinessCard } from "@/components/shared/BusinessCard";
import { CategoryItem } from "@/components/shared/CategoryCard";
import { StarRating } from "@/components/shared/StarRating";
import { useAuth } from "@/context/auth-context";
import { getApprovedBusinesses, searchBusinesses, getNearbyBusinesses } from "@/lib/services/business-service";
import { getAllCategories } from "@/lib/services/category-service";
import { toggleFavorite } from "@/lib/services/favorites-service";
import { Business, Category, SearchFilters, BusinessCategory } from "@/types";
import { cn } from "@/lib/utils";

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<SearchFilters>({
    category: (searchParams.get("category") as BusinessCategory) || undefined,
    query: searchParams.get("q") || "",
    minRating: undefined,
    priceRange: [],
    sortBy: "newest",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [filters]);

  async function loadCategories() {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async function loadBusinesses() {
    setLoading(true);
    try {
      let data: Business[];
      
      if (filters.query) {
        data = await searchBusinesses(filters.query, {
          category: filters.category,
          minRating: filters.minRating,
          priceRange: filters.priceRange,
        });
      } else {
        const result = await getApprovedBusinesses(filters, undefined, 24);
        data = result.businesses;
      }

      // Apply client-side filters
      if (filters.category) {
        data = data.filter((b) => b.category === filters.category);
      }
      if (filters.minRating) {
        data = data.filter((b) => b.averageRating >= filters.minRating!);
      }
      if (filters.priceRange && filters.priceRange.length > 0) {
        data = data.filter((b) => filters.priceRange!.includes(b.priceRange));
      }

      setBusinesses(data);
    } catch (error) {
      console.error("Error loading businesses:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, query }));
    router.push(`/browse${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  }, [router]);

  const handleCategorySelect = (category: BusinessCategory | undefined) => {
    setFilters((prev) => ({ ...prev, category }));
    if (category) {
      router.push(`/browse?category=${category}`);
    } else {
      router.push("/browse");
    }
  };

  const handlePriceToggle = (price: number) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: prev.priceRange?.includes(price)
        ? prev.priceRange.filter((p) => p !== price)
        : [...(prev.priceRange || []), price],
    }));
  };

  const handleFavoriteToggle = async (businessId: string) => {
    if (!user?.uid) return;
    
    await toggleFavorite(user.uid, businessId);
    setFavoriteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(businessId)) {
        newSet.delete(businessId);
      } else {
        newSet.add(businessId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      category: undefined,
      minRating: undefined,
      priceRange: [],
      sortBy: "newest",
    });
    router.push("/browse");
  };

  const hasActiveFilters = 
    filters.category || 
    filters.minRating || 
    (filters.priceRange && filters.priceRange.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchBar
              placeholder="Search hostels, restaurants, pharmacies..."
              onSearch={handleSearch}
              defaultValue={filters.query}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {(filters.category ? 1 : 0) +
                    (filters.minRating ? 1 : 0) +
                    (filters.priceRange?.length || 0)}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 pt-0">
                  <CategoryItem
                    category={{ id: "all", name: "All Categories", slug: "other", description: "", icon: "MoreHorizontal", imageUrl: "", businessCount: 0, isActive: true, sortOrder: 0 }}
                    isSelected={!filters.category}
                    onClick={() => handleCategorySelect(undefined)}
                  />
                  {categories.map((cat) => (
                    <CategoryItem
                      key={cat.id}
                      category={cat}
                      isSelected={filters.category === cat.slug}
                      onClick={() => handleCategorySelect(cat.slug)}
                      count={cat.businessCount}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Price Range */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Price Range</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((price) => (
                      <Button
                        key={price}
                        variant={filters.priceRange?.includes(price) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePriceToggle(price)}
                      >
                        {"$".repeat(price)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rating Filter */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Minimum Rating</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFilters((prev) => ({
                        ...prev,
                        minRating: prev.minRating === rating ? undefined : rating,
                      }))}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors",
                        filters.minRating === rating
                          ? "bg-amber-500/15 border border-amber-400/20 text-amber-300"
                          : "hover:bg-white/[0.06] text-white/70 hover:text-white"
                      )}
                    >
                      <StarRating rating={rating} readonly size="sm" />
                      <span className="text-sm">& up</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </aside>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="font-semibold">Filters</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Same filter content as desktop */}
                  {/* Categories */}
                  <div>
                    <h3 className="font-medium mb-3">Categories</h3>
                    <div className="space-y-1">
                      {categories.map((cat) => (
                        <CategoryItem
                          key={cat.id}
                          category={cat}
                          isSelected={filters.category === cat.slug}
                          onClick={() => {
                            handleCategorySelect(cat.slug);
                            setShowFilters(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    Clear
                  </Button>
                  <Button className="flex-1" onClick={() => setShowFilters(false)}>
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold">
                  {filters.query
                    ? `Search results for "${filters.query}"`
                    : filters.category
                    ? `${categories.find((c) => c.slug === filters.category)?.name || "Services"}`
                    : "All Services"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {businesses.length} {businesses.length === 1 ? "result" : "results"} found
                </p>
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as SearchFilters["sortBy"],
                }))}
                className="h-9 px-3 rounded-md border bg-background text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="price">Lowest Price</option>
              </select>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="h-72 animate-pulse bg-muted" />
                ))}
              </div>
            ) : businesses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {businesses.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    onFavoriteToggle={user ? handleFavoriteToggle : undefined}
                    isFavorited={favoriteIds.has(business.id)}
                    showFavoriteButton={!!user}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-lg font-medium">No results found</p>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or filters
                  </p>
                  <Button onClick={clearFilters} className="mt-4">
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function BrowseLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoadingFallback />}>
      <BrowsePageContent />
    </Suspense>
  );
}
