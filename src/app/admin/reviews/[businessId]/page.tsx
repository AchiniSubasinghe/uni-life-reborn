"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewCard } from "@/components/shared/ReviewCard";
import { useAuth } from "@/context/auth-context";
import { getBusinessById } from "@/lib/services/business-service";
import { deleteReviewByActor, getReviewsForBusiness, reportReview, updateReview } from "@/lib/services/review-service";
import { Business, Review } from "@/types";

export default function AdminBusinessReviewsPage() {
  const params = useParams();
  const { user } = useAuth();
  const businessId = params.businessId as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editRating, setEditRating] = useState<1 | 2 | 3 | 4 | 5>(5);

  useEffect(() => {
    async function loadData() {
      try {
        const [businessData, reviewsData] = await Promise.all([
          getBusinessById(businessId),
          getReviewsForBusiness(businessId, true),
        ]);

        setBusiness(businessData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error loading business reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [businessId]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!user?.uid) return;
    if (!confirm("Delete this review?")) return;

    setDeletingId(reviewId);
    try {
      await deleteReviewByActor(reviewId, user.uid, "admin");
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
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

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditComment(review.comment);
    setEditRating(review.rating);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      await updateReview(editingId, {
        comment: editComment,
        rating: editRating,
      });

      setReviews((prev) =>
        prev.map((review) =>
          review.id === editingId
            ? { ...review, comment: editComment, rating: editRating }
            : review
        )
      );

      setEditingId(null);
    } catch (error) {
      console.error("Error updating review:", error);
    }
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
        <CardContent className="py-10 text-center">Business not found.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/reviews">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{business.name} Reviews</h1>
          <p className="text-muted-foreground">Manage all reviews for this business.</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6 space-y-4">
              {editingId === review.id ? (
                <div className="space-y-3">
                  <select
                    className="h-9 px-3 rounded-md border bg-background"
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} stars
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="w-full min-h-28 p-3 border rounded-md"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <ReviewCard
                  review={review}
                  showBusinessName={false}
                  onReport={handleReportReview}
                  showReportButton={!review.isReported}
                />
              )}

              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEdit(review)}
                  disabled={editingId === review.id}
                >
                  Update
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteReview(review.id)}
                  disabled={deletingId === review.id}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {deletingId === review.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {reviews.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No reviews found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
