"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllBusinesses } from "@/lib/services/business-service";
import {
  getBusinessRegistrationsByMonth,
  getMostSearchedCategories,
} from "@/lib/services/analytics-service";
import { Business } from "@/types";

export default function AdminAnalyticsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchCategories, setSearchCategories] = useState<Array<{ category: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [businessesData, searchData] = await Promise.all([
          getAllBusinesses(),
          getMostSearchedCategories(60),
        ]);

        setBusinesses(businessesData);
        setSearchCategories(searchData);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const registrations = useMemo(
    () => getBusinessRegistrationsByMonth(businesses, 6),
    [businesses]
  );

  const maxRegistrations = Math.max(...registrations.map((item) => item.count), 1);
  const maxSearchCount = Math.max(...searchCategories.map((item) => item.count), 1);

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track new business registrations and most searched student categories.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            New Business Registrations (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {registrations.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="h-2 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(item.count / maxRegistrations) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Most Searched Categories (Students)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {searchCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No search analytics yet. Student searches will appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {searchCategories.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm capitalize">
                    <span>{item.category}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 rounded bg-muted overflow-hidden">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${(item.count / maxSearchCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
