"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { useAuth } from "@/context/auth-context";
import { createBusiness } from "@/lib/services/business-service";
import { BusinessFormData, BusinessCategory, BusinessHours } from "@/types";
import { DEFAULT_CATEGORIES } from "@/lib/services/category-service";
import { GoogleMapPicker } from "@/components/shared/GoogleMapPicker";

const DEFAULT_HOURS: BusinessHours = {
  monday: { open: "09:00", close: "18:00", isClosed: false },
  tuesday: { open: "09:00", close: "18:00", isClosed: false },
  wednesday: { open: "09:00", close: "18:00", isClosed: false },
  thursday: { open: "09:00", close: "18:00", isClosed: false },
  friday: { open: "09:00", close: "18:00", isClosed: false },
  saturday: { open: "09:00", close: "18:00", isClosed: false },
  sunday: { open: "09:00", close: "18:00", isClosed: true },
};

const AMENITY_OPTIONS = [
  "WiFi",
  "Parking",
  "Air Conditioning",
  "Wheelchair Accessible",
  "Delivery",
  "Takeaway",
  "Outdoor Seating",
  "Pet Friendly",
  "24/7 Service",
  "Card Payment",
  "Cash Only",
  "Reservation Required",
];

export default function NewBusinessPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    description: "",
    category: "other",
    address: "",
    city: "",
    latitude: 0,
    longitude: 0,
    phone: "",
    email: "",
    website: "",
    priceRange: 2,
    amenities: [],
    hours: DEFAULT_HOURS,
  });

  const providerData = userData as any;
  const providerName = providerData?.firstName 
    ? `${providerData.firstName} ${providerData.lastName || ""}`.trim()
    : providerData?.fullName || "Provider";

  const handleChange = (field: keyof BusinessFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleHoursChange = (
    day: keyof BusinessHours,
    field: "open" | "close" | "isClosed",
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size < 5 * 1024 * 1024
    );

    if (validFiles.length + images.length > 5) {
      setErrors((prev) => ({
        ...prev,
        images: "Maximum 5 images allowed",
      }));
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    
    // Generate previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Business name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = "Please select your business location on the map";
    }
    if (images.length === 0) newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate() || !user?.uid) return;

    setLoading(true);
    try {
      await createBusiness(formData, user.uid, providerName, images);
      router.push("/provider/businesses?success=true");
    } catch (error: any) {
      console.error("Error creating business:", error);
      setErrors({ submit: error.message || "Failed to create business" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/provider/businesses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Business</h1>
          <p className="text-muted-foreground">
            Fill in the details to list your business
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name">Business Name *</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter business name"
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Category *</FieldLabel>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value as BusinessCategory)}
                className="w-full h-9 px-3 rounded-md border bg-background"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description *</FieldLabel>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe your business..."
                className="w-full h-32 p-3 border rounded-md resize-none"
              />
              {errors.description && <FieldError>{errors.description}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Price Range *</FieldLabel>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((price) => (
                  <Button
                    key={price}
                    type="button"
                    variant={formData.priceRange === price ? "default" : "outline"}
                    onClick={() => handleChange("priceRange", price)}
                  >
                    {"$".repeat(price)}
                  </Button>
                ))}
              </div>
              <FieldDescription>
                {formData.priceRange === 1 && "Budget-friendly"}
                {formData.priceRange === 2 && "Moderate pricing"}
                {formData.priceRange === 3 && "Upscale pricing"}
                {formData.priceRange === 4 && "Premium pricing"}
              </FieldDescription>
            </Field>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {errors.images && <FieldError>{errors.images}</FieldError>}
              <FieldDescription>
                Upload up to 5 images. First image will be the cover.
              </FieldDescription>
            </div>
          </CardContent>
        </Card>

        {/* Location & Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel htmlFor="address">Address *</FieldLabel>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Street address"
              />
              {errors.address && <FieldError>{errors.address}</FieldError>}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="city">City *</FieldLabel>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="City"
                />
                {errors.city && <FieldError>{errors.city}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Phone *</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+94 77 123 4567"
                />
                {errors.phone && <FieldError>{errors.phone}</FieldError>}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="email">Email (Optional)</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="business@example.com"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="website">Website (Optional)</FieldLabel>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude || ""}
                  onChange={(e) => handleChange("latitude", parseFloat(e.target.value) || 0)}
                  placeholder="6.9271"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude || ""}
                  onChange={(e) => handleChange("longitude", parseFloat(e.target.value) || 0)}
                  placeholder="79.8612"
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
                  handleChange("latitude", latitude);
                  handleChange("longitude", longitude);

                  if (formattedAddress && !formData.address.trim()) {
                    handleChange("address", formattedAddress);
                  }
                }}
              />
              {errors.location && <FieldError>{errors.location}</FieldError>}
            </Field>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((amenity) => (
                <Button
                  key={amenity}
                  type="button"
                  variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleAmenityToggle(amenity)}
                >
                  {amenity}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Business Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(Object.keys(formData.hours) as Array<keyof BusinessHours>).map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <span className="w-24 capitalize font-medium">{day}</span>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!formData.hours[day].isClosed}
                      onChange={(e) => handleHoursChange(day, "isClosed", !e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Open</span>
                  </label>
                  {!formData.hours[day].isClosed && (
                    <>
                      <Input
                        type="time"
                        value={formData.hours[day].open}
                        onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                        className="w-28"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={formData.hours[day].close}
                        onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                        className="w-28"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        {errors.submit && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/provider/businesses">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Business"}
          </Button>
        </div>
      </form>
    </div>
  );
}
