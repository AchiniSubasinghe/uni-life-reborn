"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { searchBusinesses, getApprovedBusinesses } from "@/lib/services/business-service";
import { getFavoritesByUser, toggleFavorite } from "@/lib/services/favorites-service";
import { DEFAULT_CATEGORIES } from "@/lib/services/category-service";
import { Business, BusinessCategory, SearchFilters } from "@/types";
import { BusinessCard } from "@/components/shared/BusinessCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Filter, 
  Grid3X3, 
  Loader2, 
  MapPin, 
  SlidersHorizontal,
  Star,
  X 
} from "lucide-react";

export default function StudentBrowsePage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "rating" | "price">("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Load businesses
  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      let results: Business[];
      
      if (searchQuery) {
        results = await searchBusinesses(searchQuery);
        
        // Apply additional client-side filters
        if (selectedCategory) {
          results = results.filter(b => b.category === selectedCategory);
        }
        if (minRating) {
          results = results.filter(b => b.averageRating >= minRating);
        }
        if (priceRange) {
          results = results.filter(b => b.priceRange === priceRange);
        }
      } else {
        const filters: SearchFilters = {};
        if (selectedCategory) filters.category = selectedCategory;
        if (minRating) filters.minRating = minRating;
        if (priceRange) filters.priceRange = [priceRange];
        
        const result = await getApprovedBusinesses(filters);
        results = result.businesses;
      }
      
      // Apply sorting
      if (sortBy === "rating") {
        results.sort((a, b) => b.averageRating - a.averageRating);
      } else if (sortBy === "price") {
        results.sort((a, b) => a.priceRange - b.priceRange);
      } else {
        results.sort((a, b) => {
          const dateA = a.createdAt && "toDate" in a.createdAt ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt && "toDate" in b.createdAt ? b.createdAt.toDate() : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      }
      
      setBusinesses(results);
    } catch (error) {
      console.error("Error loading businesses:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, minRating, priceRange, sortBy]);

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;
      try {
        const favorites = await getFavoritesByUser(user.uid);
        setFavoriteIds(new Set(favorites.map(f => f.businessId)));
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };
    loadFavorites();
  }, [user]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFavoriteToggle = async (businessId: string) => {
    if (!user) return;
    
    try {
      await toggleFavorite(user.uid, businessId);
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(businessId)) {
          newSet.delete(businessId);
        } else {
          newSet.add(businessId);
        }
        return newSet;
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange(null);
    setMinRating(null);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCategory || priceRange || minRating || searchQuery;

  const getCategoryInfo = (categorySlug: string) => {
    return DEFAULT_CATEGORIES.find(c => c.slug === categorySlug);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Browse Services</h1>
          <p className="text-muted-foreground mt-1">
            Discover services near your university
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        placeholder="Search for services, restaurants, hostels..."
        className="max-w-2xl"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className={`lg:w-64 shrink-0 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
          {/* Categories */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Categories
              </h3>
              <div className="space-y-2">
                {DEFAULT_CATEGORIES.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.slug ? null : category.slug as BusinessCategory
                    )}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      selectedCategory === category.slug
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Price Range
              </h3>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((price) => (
                  <button
                    key={price}
                    onClick={() => setPriceRange(priceRange === price ? null : price)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      priceRange === price
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {"$".repeat(price)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rating Filter */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Minimum Rating
              </h3>
              <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(minRating === rating ? null : rating)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                      minRating === rating
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {rating}+ <Star className="h-3 w-3 fill-current" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="w-full">
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `${businesses.length} services found`}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "rating" | "price")}
              className="border rounded-lg px-3 py-1.5 text-sm bg-background"
            >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="price">Lowest Price</option>
            </select>
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/15 border border-amber-400/20 text-amber-300 rounded-full text-sm">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/15 border border-amber-400/20 text-amber-300 rounded-full text-sm">
                  {getCategoryInfo(selectedCategory)?.icon} {getCategoryInfo(selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {priceRange && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/15 border border-amber-400/20 text-amber-300 rounded-full text-sm">
                  {"$".repeat(priceRange)}
                  <button onClick={() => setPriceRange(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {minRating && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/15 border border-amber-400/20 text-amber-300 rounded-full text-sm">
                  {minRating}+ ⭐
                  <button onClick={() => setMinRating(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : businesses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="bg-muted rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No services found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                  isFavorited={favoriteIds.has(business.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
