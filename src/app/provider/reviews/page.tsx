"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { useAuth } from "@/context/auth-context";
import { deleteReviewByActor, getReviewsForProvider, reportReview } from "@/lib/services/review-service";
import { Review } from "@/types";

export default function ProviderReviewsPage() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviews() {
      if (!user?.uid) return;

      try {
        const data = await getReviewsForProvider(user.uid);
        setReviews(data);
      } catch (error) {
        console.error("Error loading provider reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [user?.uid]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Reviews</h1>
        <p className="text-muted-foreground">
          View feedback on your businesses and remove inappropriate reviews.
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="font-medium">No reviews yet</p>
            <p className="text-muted-foreground text-sm">
              Reviews from students will appear here.
            </p>
            <Button asChild variant="outline">
              <Link href="/provider/businesses">Go to My Businesses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{review.businessName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
