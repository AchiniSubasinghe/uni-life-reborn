"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { getFavoritesByUser, removeFavorite } from "@/lib/services/favorites-service";
import { getBusinessById } from "@/lib/services/business-service";
import { BusinessCard } from "@/components/shared/BusinessCard";
import { Business, Favorite } from "@/types";
import { Heart, Loader2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<(Favorite & { business: Business })[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<(Favorite & { business: Business })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      
      try {
        const userFavorites = await getFavoritesByUser(user.uid);
        
        // Fetch business details for each favorite
        const favoritesWithBusinesses = await Promise.all(
          userFavorites.map(async (fav) => {
            const business = await getBusinessById(fav.businessId);
            return { ...fav, business: business! };
          })
        );
        
        // Filter out any favorites where business no longer exists
        const validFavorites = favoritesWithBusinesses.filter(f => f.business);
        setFavorites(validFavorites);
        setFilteredFavorites(validFavorites);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Filter favorites based on search and category
  useEffect(() => {
    let filtered = [...favorites];
    
    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.business.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(f => f.business.category === selectedCategory);
    }
    
    setFilteredFavorites(filtered);
  }, [searchQuery, selectedCategory, favorites]);

  const handleRemoveFavorite = async (favoriteId: string, businessId: string) => {
    if (!user) return;
    try {
      await removeFavorite(user.uid, businessId);
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  // Get unique categories from favorites
  const categories = Array.from(new Set(favorites.map(f => f.business.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Favorites</h1>
        <p className="text-muted-foreground">
          Your saved businesses for quick access
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="capitalize"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          <span className="font-medium">{favorites.length} saved businesses</span>
        </div>
      </div>

      {/* Favorites Grid */}
      {filteredFavorites.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {favorites.length === 0 ? "No favorites yet" : "No matching favorites"}
          </h3>
          <p className="text-muted-foreground">
            {favorites.length === 0 
              ? "Start exploring and save businesses you love!"
              : "Try adjusting your search or filters"
            }
          </p>
          {favorites.length === 0 && (
            <Button className="mt-4" asChild>
              <a href="/browse">Browse Services</a>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map(({ id, business }) => (
            <div key={id} className="relative">
              <BusinessCard business={business} />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                onClick={() => handleRemoveFavorite(id, business.id)}
              >
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
