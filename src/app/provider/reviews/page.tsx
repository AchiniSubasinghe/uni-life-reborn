"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, ArrowRight, Building2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { getBusinessesByProvider } from "@/lib/services/business-service";
import { Business } from "@/types";

export default function ProviderReviewsPage() {
  const { user } = useAuth();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusinesses() {
      if (!user?.uid) return;

      try {
        const data = await getBusinessesByProvider(user.uid);
        setBusinesses(data);
      } catch (error) {
        console.error("Error loading provider businesses:", error);
      } finally {
        setLoading(false);
      }
    }

    loadBusinesses();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Reviews</h1>
        <p className="text-muted-foreground">
          Select a business to view all student reviews and moderate feedback.
        </p>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-medium">No businesses yet</p>
            <p className="text-muted-foreground text-sm">
              Add a business first to start receiving reviews.
            </p>
            <Button asChild variant="outline">
              <Link href="/provider/businesses">Go to My Businesses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => (
            <Card key={business.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between gap-3">
                  <span className="truncate">{business.name}</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    {business.totalReviews} reviews
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="capitalize">{business.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{business.averageRating.toFixed(1)}</span>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link href={`/provider/reviews/${business.id}`}>
                    View Reviews
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
