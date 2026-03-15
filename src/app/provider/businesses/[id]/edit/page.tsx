"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/context/auth-context";
import { DEFAULT_CATEGORIES } from "@/lib/services/category-service";
import { getBusinessById, updateBusiness } from "@/lib/services/business-service";
import { GoogleMapPicker } from "@/components/shared/GoogleMapPicker";
import { Business, BusinessCategory } from "@/types";

export default function EditBusinessPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other" as BusinessCategory,
    address: "",
    city: "",
    phone: "",
    email: "",
    website: "",
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    async function loadBusiness() {
      try {
        const data = await getBusinessById(businessId);
        if (!data) {
          setError("Business not found");
          return;
        }

        if (!user?.uid || data.providerId !== user.uid) {
          setError("Only the business owner can edit this listing");
          return;
        }

        setBusiness(data);
        setFormData({
          name: data.name,
          description: data.description,
          category: data.category,
          address: data.address,
          city: data.city,
          phone: data.phone,
          email: data.email || "",
          website: data.website || "",
          latitude: data.location?.latitude || 0,
          longitude: data.location?.longitude || 0,
        });
      } catch (loadError) {
        console.error(loadError);
        setError("Failed to load business details");
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [businessId, user?.uid]);

  const canSubmit = useMemo(() => {
    return (
      !!formData.name.trim() &&
      !!formData.description.trim() &&
      !!formData.address.trim() &&
      !!formData.latitude &&
      !!formData.longitude
    );
  }, [formData]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!business || !user?.uid || business.providerId !== user.uid) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateBusiness(businessId, {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        email: formData.email || undefined,
        website: formData.website || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      router.push("/provider/businesses?updated=true");
    } catch (saveError: any) {
      console.error(saveError);
      setError(saveError?.message || "Failed to update business");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !business) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button asChild variant="outline">
            <Link href="/provider/businesses">Back to My Businesses</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/provider/businesses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Business</h1>
          <p className="text-muted-foreground">Update your business details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name">Business Name</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as BusinessCategory }))}
                className="w-full h-9 px-3 rounded-md border bg-background"
              >
                {DEFAULT_CATEGORIES.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full h-28 p-3 border rounded-md resize-none"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="address">Address</FieldLabel>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="website">Website</FieldLabel>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>Pick Location on Google Maps *</FieldLabel>
              <GoogleMapPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                address={`${formData.address} ${formData.city}`.trim()}
                onLocationChange={({ latitude, longitude, formattedAddress }) => {
                  setFormData((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                    address:
                      formattedAddress && !prev.address.trim()
                        ? formattedAddress
                        : prev.address,
                  }));
                }}
              />
            </Field>

            {error && <FieldError>{error}</FieldError>}

            <div className="flex justify-end gap-3">
              <Button asChild type="button" variant="outline">
                <Link href="/provider/businesses">Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving || !canSubmit}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
