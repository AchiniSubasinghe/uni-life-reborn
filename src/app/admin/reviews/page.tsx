"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageSquare, Search, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllBusinesses } from "@/lib/services/business-service";
import { Business } from "@/types";

export default function AdminReviewsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllBusinesses();
        setBusinesses(data);
      } catch (error) {
        console.error("Error loading businesses:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    return businesses.filter((business) => {
      const text = `${business.name} ${business.providerName} ${business.category}`.toLowerCase();
      return !query.trim() || text.includes(query.toLowerCase());
    });
  }, [businesses, query]);

  if (loading) {
    return <div className="p-6">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">Select a business to view, delete, or update reviews.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Business Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search business by name, provider, or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.map((business) => (
          <Card key={business.id}>
            <CardContent className="py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold truncate">{business.name}</p>
                <p className="text-sm text-muted-foreground truncate">by {business.providerName}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {business.totalReviews}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {business.averageRating.toFixed(1)}
                </span>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/reviews/${business.id}`}>Manage</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No businesses found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
