"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllBusinesses } from "@/lib/services/business-service";
import { getCategoryName } from "@/lib/services/category-service";
import { Business, BusinessStatus } from "@/types";

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BusinessStatus | "all">("all");

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
      const byStatus = status === "all" || business.status === status;
      const text = `${business.name} ${business.providerName} ${business.category}`.toLowerCase();
      const byQuery = !query.trim() || text.includes(query.toLowerCase());
      return byStatus && byQuery;
    });
  }, [businesses, query, status]);

  const stats = {
    all: businesses.length,
    approved: businesses.filter((b) => b.status === "approved").length,
    pending: businesses.filter((b) => b.status === "pending").length,
    rejected: businesses.filter((b) => b.status === "rejected").length,
  };

  if (loading) {
    return <div className="p-6">Loading businesses...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Businesses</h1>
        <p className="text-muted-foreground">View all approved and non-approved businesses.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["all", "approved", "pending", "rejected"] as const).map((item) => (
          <Card key={item} className="cursor-pointer" onClick={() => setStatus(item)}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground capitalize">{item}</p>
              <p className="text-2xl font-bold">{stats[item]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Filter Businesses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by business name, provider, or category"
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
                <p className="text-sm text-muted-foreground truncate">
                  {getCategoryName(business.category)} • by {business.providerName}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs capitalize text-muted-foreground">{business.status}</span>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/businesses/${business.id}`}>View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No businesses found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
