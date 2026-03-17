"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { useAuth } from "@/context/auth-context";
import { getBusinessById } from "@/lib/services/business-service";
import { deleteReviewByActor, getReviewsForBusiness, reportReview } from "@/lib/services/review-service";
import { Business, Review } from "@/types";

export default function ProviderBusinessReviewsPage() {
  const params = useParams();
  const { user } = useAuth();
  const businessId = params.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user?.uid) return;

      try {
        const businessData = await getBusinessById(businessId);

        if (!businessData || businessData.providerId !== user.uid) {
          setBusiness(null);
          setReviews([]);
          return;
        }

        const reviewsData = await getReviewsForBusiness(businessId, true);
        setBusiness(businessData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error loading business reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [businessId, user?.uid]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!user?.uid) return;
    if (!confirm("Delete this review?")) return;

    setDeletingId(reviewId);
    try {
      await deleteReviewByActor(reviewId, user.uid, "provider");
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Unable to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const handleReportReview = async (reviewId: string, reason: string) => {
    await reportReview(reviewId, reason);
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, isReported: true } : review
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-3">
          <p className="font-medium">Business not found or access denied.</p>
          <Button asChild variant="outline">
            <Link href="/provider/reviews">Back to Reviews</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/provider/reviews">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{business.name} Reviews</h1>
          <p className="text-muted-foreground">Total reviews: {reviews.length}</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="font-medium">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Student reviews will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6 space-y-3">
                <ReviewCard
                  review={review}
                  showBusinessName={false}
                  onReport={handleReportReview}
                  showReportButton={!review.isReported}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deletingId === review.id}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deletingId === review.id ? "Deleting..." : "Delete Review"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
