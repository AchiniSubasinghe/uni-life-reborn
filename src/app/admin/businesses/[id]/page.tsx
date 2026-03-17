"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getBusinessById, updateBusinessStatus } from "@/lib/services/business-service";
import { getUserById } from "@/lib/services/user-service";
import { getCategoryName } from "@/lib/services/category-service";
import { Business, Provider, User } from "@/types";

export default function AdminBusinessDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [provider, setProvider] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const businessData = await getBusinessById(businessId);
        setBusiness(businessData);

        if (businessData?.providerId) {
          const providerData = await getUserById(businessData.providerId);
          setProvider(providerData);
        }
      } catch (error) {
        console.error("Error loading business details:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [businessId]);

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    if (!business || !user?.uid) return;

    setUpdating(true);
    try {
      await updateBusinessStatus(business.id, status, user.uid, status === "rejected" ? "Rejected by admin" : undefined);
      setBusiness({ ...business, status });
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading details...</div>;
  }

  if (!business) {
    return (
      <Card>
        <CardContent className="py-10 text-center">Business not found.</CardContent>
      </Card>
    );
  }

  const providerData = provider as Provider | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/businesses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{business.name}</h1>
          <p className="text-muted-foreground capitalize">{business.status} • {getCategoryName(business.category)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>{business.description}</p>
            <p className="text-sm text-muted-foreground">{business.address}, {business.city}</p>
            <p className="text-sm text-muted-foreground">Phone: {business.phone}</p>
            {business.email && <p className="text-sm text-muted-foreground">Email: {business.email}</p>}
            {business.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-3">
                {business.images.slice(0, 6).map((image, index) => (
                  <img key={index} src={image} alt={`${business.name} ${index + 1}`} className="rounded-md object-cover aspect-video" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provider Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">{business.providerName}</p>
            {providerData?.email && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {providerData.email}
              </p>
            )}
            {providerData?.phone && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {providerData.phone}
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 pt-4">
              <Button
                onClick={() => handleStatusUpdate("approved")}
                disabled={updating || business.status === "approved"}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate("rejected")}
                disabled={updating || business.status === "rejected"}
              >
                Reject
              </Button>
              <Button asChild variant="outline">
                <Link href={`/business/${business.id}`}>Open Public Detail Page</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
