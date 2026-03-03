"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { getBusinessById } from "@/lib/services/business-service";
import { Review, Business } from "@/types";
import { StarRating } from "@/components/shared/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Loader2, 
  Star, 
  Trash2, 
  ExternalLink,
  Calendar,
  AlertCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ReviewWithBusiness extends Review {
  business?: Business;
}

export default function StudentReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyReviews = async () => {
      if (!user) return;
      
      try {
        const reviewsRef = collection(db, "reviews");
        const q = query(
          reviewsRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        
        const snapshot = await getDocs(q);
        const reviewsData: ReviewWithBusiness[] = [];
        
        for (const docSnap of snapshot.docs) {
          const review = { id: docSnap.id, ...docSnap.data() } as Review;
          const business = await getBusinessById(review.businessId);
          reviewsData.push({ ...review, business: business || undefined });
        }
        
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyReviews();
  }, [user]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    setDeletingId(reviewId);
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate stats
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  const totalReviews = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => 
    reviews.filter(r => r.rating === rating).length
  );

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
        <p className="text-muted-foreground">
          Manage your reviews and see your rating history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalReviews}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Rating Given
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-bold">{averageRating}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((rating, idx) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ 
                        width: `${totalReviews > 0 ? (ratingDistribution[idx] / totalReviews) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground w-6 text-right">
                    {ratingDistribution[idx]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring services and share your experiences!
            </p>
            <Button asChild>
              <Link href="/browse">Browse Services</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Business Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {review.business ? (
                          <Link 
                            href={`/business/${review.businessId}`}
                            className="font-semibold text-lg hover:text-primary transition-colors flex items-center gap-2"
                          >
                            {review.business.name}
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        ) : (
                          <span className="font-semibold text-lg text-muted-foreground">
                            Business no longer available
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          {review.createdAt?.toDate && (
                            <span>
                              {formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>

                    <p className="text-muted-foreground mb-4">{review.comment}</p>

                    {/* Provider Response */}
                    {review.providerResponse && (
                      <div className="bg-muted/50 rounded-lg p-3 mt-2">
                        <p className="text-sm font-medium mb-1">Provider Response:</p>
                        <p className="text-sm text-muted-foreground">
                          {review.providerResponse.comment}
                        </p>
                      </div>
                    )}

                    {/* Review Status Indicators */}
                    <div className="flex gap-2 mt-3">
                      {review.isReported && (
                        <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          <AlertCircle className="h-3 w-3" />
                          Under Review
                        </span>
                      )}
                      {!review.isVisible && (
                        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={deletingId === review.id}
                    >
                      {deletingId === review.id ? (
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
