"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  Heart,
  Share2,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { StarRating } from "@/components/shared/StarRating";
import { useAuth } from "@/context/auth-context";
import { getBusinessById } from "@/lib/services/business-service";
import { getReviewsForBusiness, createReview, reportReview } from "@/lib/services/review-service";
import { toggleFavorite, isFavorited } from "@/lib/services/favorites-service";
import { getCategoryName } from "@/lib/services/category-service";
import { Business, Review, ReviewFormData } from "@/types";
import { formatTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

const PRICE_LABELS: Record<number, string> = {
  1: "Budget-friendly",
  2: "Moderate",
  3: "Upscale",
  4: "Premium",
};

export default function BusinessDetailsPage() {
  const params = useParams();
  const { user, userData, role } = useAuth();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewFormData>({
    rating: 5,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadBusinessDetails();
  }, [businessId]);

  useEffect(() => {
    if (user?.uid && businessId) {
      checkFavoriteStatus();
    }
  }, [user?.uid, businessId]);

  async function loadBusinessDetails() {
    try {
      const [businessData, reviewsData] = await Promise.all([
        getBusinessById(businessId),
        getReviewsForBusiness(businessId),
      ]);
      setBusiness(businessData);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error loading business details:", error);
    } finally {
      setLoading(false);
    }
  }

  async function checkFavoriteStatus() {
    if (!user?.uid) return;
    try {
      const favorited = await isFavorited(user.uid, businessId);
      setIsFavorite(favorited);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  }

  const handleFavoriteToggle = async () => {
    if (!user?.uid) return;
    try {
      const result = await toggleFavorite(user.uid, businessId);
      setIsFavorite(result.isFavorited);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !userData || !business) return;

    setSubmittingReview(true);
    try {
      await createReview(
        businessId,
        business.name,
        user.uid,
        (userData as any).fullName || "Anonymous",
        reviewData
      );
      
      // Reload reviews
      const updatedReviews = await getReviewsForBusiness(businessId);
      setReviews(updatedReviews);
      
      // Reload business for updated rating
      const updatedBusiness = await getBusinessById(businessId);
      setBusiness(updatedBusiness);
      
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: "" });
    } catch (error: any) {
      console.error("Error submitting review:", error);
      alert(error.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReportReview = async (reviewId: string, reason: string) => {
    await reportReview(reviewId, reason);
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, isReported: true } : r))
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Business not found</h1>
        <p className="text-muted-foreground mt-2">
          The business you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/browse">
          <Button className="mt-4">Browse Services</Button>
        </Link>
      </div>
    );
  }

  const userHasReviewed = reviews.some((r) => r.userId === user?.uid);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/browse" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Browse
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleFavoriteToggle}>
              <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {business.images.length > 0 && (
              <div className="space-y-4">
                <div className="aspect-video rounded-xl overflow-hidden">
                  <img
                    src={business.images[currentImageIndex]}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {business.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {business.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={cn(
                          "h-16 w-24 rounded-md overflow-hidden flex-shrink-0 border-2",
                          currentImageIndex === i
                            ? "border-primary"
                            : "border-transparent"
                        )}
                      >
                        <img
                          src={img}
                          alt={`${business.name} ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Business Info */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center rounded-full bg-blue-500/15 border border-blue-400/20 px-2.5 py-0.5 text-xs font-medium text-blue-300 mb-2">
                    {getCategoryName(business.category)}
                  </span>
                  <h1 className="text-3xl font-bold">{business.name}</h1>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold">
                      {business.averageRating > 0
                        ? business.averageRating.toFixed(1)
                        : "New"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {business.totalReviews} reviews
                  </p>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {business.description}
              </p>
            </div>

            {/* Amenities */}
            {business.amenities && business.amenities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {business.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Reviews ({reviews.length})
                </h2>
                {role === "student" && !userHasReviewed && (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    disabled={!user}
                  >
                    Write a Review
                  </Button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Write Your Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Your Rating
                        </label>
                        <StarRating
                          rating={reviewData.rating}
                          onRatingChange={(rating) =>
                            setReviewData((prev) => ({
                              ...prev,
                              rating: rating as 1 | 2 | 3 | 4 | 5,
                            }))
                          }
                          size="lg"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Your Review
                        </label>
                        <textarea
                          className="w-full h-32 p-3 border rounded-md resize-none"
                          placeholder="Share your experience..."
                          value={reviewData.comment}
                          onChange={(e) =>
                            setReviewData((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submittingReview}>
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      onReport={handleReportReview}
                      showReportButton={user?.uid !== review.userId}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">No reviews yet</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to review this business!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{business.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {business.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${business.phone}`} className="hover:text-primary">
                    {business.phone}
                  </a>
                </div>

                {business.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={`mailto:${business.email}`}
                      className="hover:text-primary"
                    >
                      {business.email}
                    </a>
                  </div>
                )}

                {business.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span>{PRICE_LABELS[business.priceRange] || "Contact for pricing"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            {business.hours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(business.hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="capitalize font-medium">{day}</span>
                        <span className="text-muted-foreground">
                          {hours.isClosed
                            ? "Closed"
                            : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
