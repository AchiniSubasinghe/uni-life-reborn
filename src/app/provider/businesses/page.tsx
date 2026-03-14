"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { getBusinessesByProvider, deleteBusiness } from "@/lib/services/business-service";
import { Business, BusinessStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Plus, 
  Loader2, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin
} from "lucide-react";
import Link from "next/link";

const statusConfig: Record<BusinessStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { 
    label: "Pending Review", 
    color: "bg-amber-500/15 border border-amber-400/20 text-amber-300",
    icon: Clock
  },
  approved: { 
    label: "Approved", 
    color: "bg-emerald-500/15 border border-emerald-400/20 text-emerald-300",
    icon: CheckCircle
  },
  rejected: { 
    label: "Rejected", 
    color: "bg-red-500/15 border border-red-400/20 text-red-300",
    icon: XCircle
  },
};

export default function ProviderBusinessesPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<BusinessStatus | "all">("all");

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!user) return;
      
      try {
        const data = await getBusinessesByProvider(user.uid);
        setBusinesses(data);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [user]);

  const handleDelete = async (businessId: string, businessName: string) => {
    if (!confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingId(businessId);
    try {
      await deleteBusiness(businessId);
      setBusinesses(prev => prev.filter(b => b.id !== businessId));
    } catch (error) {
      console.error("Error deleting business:", error);
      alert("Failed to delete business. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBusinesses = filter === "all" 
    ? businesses 
    : businesses.filter(b => b.status === filter);

  // Stats
  const stats = {
    total: businesses.length,
    pending: businesses.filter(b => b.status === "pending").length,
    approved: businesses.filter(b => b.status === "approved").length,
    rejected: businesses.filter(b => b.status === "rejected").length,
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Businesses</h1>
          <p className="text-muted-foreground">
            Manage your business listings
          </p>
        </div>
        <Button asChild>
          <Link href="/provider/businesses/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilter("all")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilter("pending")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilter("approved")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.approved}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilter("rejected")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{stats.rejected}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status === "all" ? "All Businesses" : status}
            <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded">
              {status === "all" ? stats.total : stats[status]}
            </span>
          </Button>
        ))}
      </div>

      {/* Businesses List */}
      {filteredBusinesses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {businesses.length === 0 
                ? "No businesses yet" 
                : `No ${filter} businesses`
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {businesses.length === 0 
                ? "Create your first business listing to get started"
                : "Try changing the filter to see other businesses"
              }
            </p>
            {businesses.length === 0 && (
              <Button asChild>
                <Link href="/provider/businesses/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Business
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBusinesses.map((business) => {
            const StatusIcon = statusConfig[business.status].icon;
            
            return (
              <Card key={business.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full md:w-48 h-48 md:h-auto bg-muted flex-shrink-0">
                      {business.images && business.images[0] ? (
                        <img
                          src={business.images[0]}
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{business.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {business.address}
                          </div>
                        </div>
                        <Badge className={statusConfig[business.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[business.status].label}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {business.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span>{business.averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({business.totalReviews} reviews)
                          </span>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {business.category}
                        </Badge>
                        <span className="text-muted-foreground">
                          {business.priceRange}
                        </span>
                      </div>

                      {/* Rejection Reason */}
                      {business.status === "rejected" && business.rejectionReason && (
                        <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-3 mb-4">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-300">Rejection Reason:</p>
                              <p className="text-sm text-red-300/70">{business.rejectionReason}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/business/${business.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/provider/businesses/${business.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/provider/businesses/${business.id}/posts`}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Posts
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(business.id, business.name)}
                          disabled={deletingId === business.id}
                        >
                          {deletingId === business.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
