"use client";

import { Suspense, useEffect, useState, useCallback, type ElementType } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getAllBusinesses, getApprovedBusinesses, getNearbyBusinesses } from "@/lib/services/business-service";
import { getFavoritesByUser, toggleFavorite } from "@/lib/services/favorites-service";
import { trackStudentSearch } from "@/lib/services/analytics-service";
import { DEFAULT_CATEGORIES } from "@/lib/services/category-service";
import { Business, BusinessCategory, GeoLocation } from "@/types";
import { BusinessCard } from "@/components/shared/BusinessCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  BookOpen,
  Coffee,
  Dumbbell,
  Filter, 
  Grid3X3, 
  Loader2, 
  MoreHorizontal,
  SlidersHorizontal,
  Navigation,
  Pill,
  Shirt,
  ShoppingCart,
  Star,
  UtensilsCrossed,
  X 
} from "lucide-react";

const categoryIconMap: Record<string, ElementType> = {
  Building2,
  UtensilsCrossed,
  ShoppingCart,
  Pill,
  Shirt,
  BookOpen,
  Dumbbell,
  Coffee,
  MoreHorizontal,
};

const HOSTEL_PRICE_FILTER_OPTIONS: Array<{ value: 1 | 2 | 3 | 4; label: string }> = [
  { value: 1, label: "Less than 10,000" },
  { value: 2, label: "10,000 - 15,000" },
  { value: 3, label: "15,000 - 20,000" },
  { value: 4, label: "Above 20,000" },
];

function StudentBrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [locationError, setLocationError] = useState<string>("");

  useEffect(() => {
    if (selectedCategory !== "hostel" && priceRange !== null) {
      setPriceRange(null);
    }
  }, [selectedCategory, priceRange]);

  useEffect(() => {
    const categoryParam = searchParams.get("category") as BusinessCategory | null;
    const queryParam = searchParams.get("q");

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [searchParams]);

  const applyClientFilters = useCallback((input: Business[]) => {
    let result = [...input];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((business) =>
        `${business.name} ${business.description} ${business.address} ${business.city}`
          .toLowerCase()
          .includes(query)
      );
    }

    if (selectedCategory) {
      result = result.filter((business) => business.category === selectedCategory);
    }

    if (minRating) {
      result = result.filter((business) => business.averageRating >= minRating);
    }

    if (priceRange) {
      result = result.filter((business) => business.priceRange === priceRange);
    }

    return result;
  }, [searchQuery, selectedCategory, minRating, priceRange]);

  // Load businesses
  const loadBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      let baseResults: Business[];

      if (nearbyOnly && userLocation) {
        baseResults = await getNearbyBusinesses(
          userLocation,
          radiusKm,
          selectedCategory || undefined
        );
      } else {
        try {
          const result = await getApprovedBusinesses({}, undefined, 60);
          baseResults = result.businesses;
        } catch {
          const allBusinesses = await getAllBusinesses();
          baseResults = allBusinesses.filter((business) => business.status === "approved" && !business.isBlocked);
        }
      }

      let results = applyClientFilters(baseResults);

      // Apply sorting
      if (sortBy === "rating") {
        results = results.sort((a, b) => b.averageRating - a.averageRating);
      } else if (sortBy === "price") {
        results = results.sort((a, b) => a.priceRange - b.priceRange);
      } else {
        results = results.sort((a, b) => {
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
  }, [nearbyOnly, userLocation, radiusKm, selectedCategory, applyClientFilters, sortBy]);

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

    const queryString = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    router.push(`/student/browse${queryString}`);

    if (user?.uid && query.trim()) {
      trackStudentSearch(user.uid, query, selectedCategory || undefined).catch((error) => {
        console.error("Error tracking search:", error);
      });
    }
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
    setNearbyOnly(false);
    setRadiusKm(5);
    setLocationError("");
    router.push("/student/browse");
  };

  const hasActiveFilters = selectedCategory || priceRange || minRating || searchQuery || nearbyOnly;

  const getCategoryInfo = (categorySlug: string) => {
    return DEFAULT_CATEGORIES.find(c => c.slug === categorySlug);
  };

  const handleUseCurrentLocation = () => {
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setLocationError("Current location needs HTTPS or localhost.");
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setNearbyOnly(true);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please allow location access and try again.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Your location is currently unavailable. Try again in a few seconds.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("Unable to access your location. Please allow location access.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass glass-sheen rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Browse Services</h1>
          <p className="text-muted-foreground mt-1">
            Discover services near your university
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={nearbyOnly ? "default" : "outline"}
            onClick={handleUseCurrentLocation}
          >
            <Navigation className="h-4 w-4 mr-2" />
            {nearbyOnly ? "Nearby On" : "Near Me"}
          </Button>
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
        defaultValue={searchQuery}
        className="max-w-2xl glass rounded-xl p-2"
      />

      {nearbyOnly && (
        <Card className="glass glass-sheen border-white/15">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="text-sm">
              Showing businesses near your location.
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="radiusKm" className="text-sm text-muted-foreground">Radius</label>
              <select
                id="radiusKm"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="border rounded-lg px-2 py-1 text-sm bg-white/[0.06]"
              >
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
                <option value={20}>20 km</option>
              </select>
              <Button type="button" variant="ghost" size="sm" onClick={() => setNearbyOnly(false)}>
                Disable
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {locationError && <p className="text-sm text-destructive">{locationError}</p>}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className={`lg:w-64 shrink-0 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
          {/* Categories */}
          <Card className="glass glass-sheen border-white/15">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Categories
              </h3>
              <div className="space-y-2">
                {DEFAULT_CATEGORIES.map((category) => {
                  const CategoryIcon = categoryIconMap[category.icon] || MoreHorizontal;

                  return (
                    <button
                      key={category.slug}
                      onClick={() => setSelectedCategory(
                        selectedCategory === category.slug ? null : category.slug as BusinessCategory
                      )}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        selectedCategory === category.slug
                          ? "bg-amber-500/20 border border-amber-400/30 text-amber-200"
                          : "hover:bg-white/[0.06]"
                       }`}
                    >
                      <CategoryIcon className="h-4 w-4" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          {selectedCategory === "hostel" && (
            <Card className="glass glass-sheen border-white/15">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Hostel Price Range
                </h3>
                <div className="space-y-2">
                  {HOSTEL_PRICE_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPriceRange(priceRange === option.value ? null : option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        priceRange === option.value
                          ? "bg-amber-500/20 border border-amber-400/30 text-amber-200"
                          : "hover:bg-white/[0.06]"
                       }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rating Filter */}
          <Card className="glass glass-sheen border-white/15">
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
                        ? "bg-amber-500/20 border border-amber-400/30 text-amber-200"
                        : "hover:bg-white/[0.06]"
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
               className="border rounded-lg px-3 py-1.5 text-sm bg-white/[0.06]"
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
                  {getCategoryInfo(selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory(null)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {priceRange && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/15 border border-amber-400/20 text-amber-300 rounded-full text-sm">
                  {HOSTEL_PRICE_FILTER_OPTIONS.find((option) => option.value === priceRange)?.label || "Price"}
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
            <Card className="glass glass-sheen border-white/15">
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
                  href={`/student/businesses/${business.id}`}
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

export default function StudentBrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <StudentBrowseContent />
    </Suspense>
  );
}
