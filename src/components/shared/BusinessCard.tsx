"use client";

import { Star, MapPin, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Business } from "@/types";
import { cn } from "@/lib/utils";
import { getCategoryName } from "@/lib/services/category-service";

interface BusinessCardProps {
  business: Business;
  onFavoriteToggle?: (businessId: string) => Promise<void>;
  isFavorited?: boolean;
  showFavoriteButton?: boolean;
  className?: string;
  href?: string;
}

const PRICE_SYMBOLS: Record<number, string> = {
  1: "$",
  2: "$$",
  3: "$$$",
  4: "$$$$",
};

export function BusinessCard({
  business,
  onFavoriteToggle,
  isFavorited = false,
  showFavoriteButton = true,
  className,
  href,
}: BusinessCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onFavoriteToggle || loading) return;
    
    setLoading(true);
    try {
      await onFavoriteToggle(business.id);
      setFavorited(!favorited);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link href={href || `/business/${business.id}`}>
      <Card
        className={cn(
          "group overflow-hidden transition-all hover:shadow-lg cursor-pointer",
          className
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={business.coverImage || business.images[0] || "/images/placeholder.jpg"}
            alt={business.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          
          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center rounded-full bg-black/50 border border-white/10 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm text-white/80">
              {getCategoryName(business.category)}
            </span>
          </div>

          {/* Favorite Button */}
          {showFavoriteButton && (
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "absolute top-2 right-2 bg-black/50 border border-white/10 backdrop-blur-sm hover:bg-black/70",
                favorited && "text-red-500"
              )}
              onClick={handleFavoriteClick}
              disabled={loading}
            >
              <Heart
                className={cn("h-4 w-4", favorited && "fill-current")}
              />
            </Button>
          )}

          {/* Status Badge for Providers */}
          {business.status === "pending" && (
            <div className="absolute bottom-2 left-2">
              <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-400/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                Pending Approval
              </span>
            </div>
          )}
          {business.status === "rejected" && (
            <div className="absolute bottom-2 left-2">
              <span className="inline-flex items-center rounded-full bg-red-500/15 border border-red-400/20 px-2.5 py-0.5 text-xs font-medium text-red-300">
                Rejected
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-amber-300 transition-colors">
                {business.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{business.address}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-medium text-muted-foreground">
                {PRICE_SYMBOLS[business.priceRange] || "$"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.07]">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">
                {business.averageRating > 0 ? business.averageRating.toFixed(1) : "New"}
              </span>
              <span className="text-sm text-muted-foreground">
                ({business.totalReviews} {business.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
