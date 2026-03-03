"use client";

import { Star, MessageSquare, Flag, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Review } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/lib/date-utils";

interface ReviewCardProps {
  review: Review;
  showProviderResponse?: boolean;
  showReportButton?: boolean;
  showBusinessName?: boolean;
  onReport?: (reviewId: string, reason: string) => Promise<void>;
  onRespond?: (reviewId: string) => void;
  isProvider?: boolean;
  className?: string;
}

export function ReviewCard({
  review,
  showProviderResponse = true,
  showReportButton = true,
  showBusinessName = false,
  onReport,
  onRespond,
  isProvider = false,
  className,
}: ReviewCardProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const handleReport = async () => {
    if (!onReport || !reportReason.trim()) return;
    
    setIsReporting(true);
    try {
      await onReport(review.id, reportReason);
      setShowReportModal(false);
      setReportReason("");
    } catch (error) {
      console.error("Error reporting review:", error);
    } finally {
      setIsReporting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted text-muted"
        )}
      />
    ));
  };

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {review.userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium">{review.userName}</p>
              {showBusinessName && (
                <p className="text-sm text-muted-foreground">
                  Review for {review.businessName}
                </p>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex">{renderStars(review.rating)}</div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(review.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isProvider && onRespond && !review.providerResponse && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRespond(review.id)}
                title="Respond to review"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
            {showReportButton && onReport && !review.isReported && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowReportModal(true)}
                title="Report review"
              >
                <Flag className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Review Content */}
        <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {review.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Review image ${index + 1}`}
                className="h-20 w-20 rounded-md object-cover flex-shrink-0"
              />
            ))}
          </div>
        )}

        {/* Provider Response */}
        {showProviderResponse && review.providerResponse && (
          <div className="mt-4 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Owner Response</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(review.providerResponse.respondedAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {review.providerResponse.comment}
            </p>
          </div>
        )}

        {/* Reported Badge */}
        {review.isReported && (
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
            <Flag className="h-3 w-3" />
            Reported for review
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Report Review</h3>
              <textarea
                className="w-full h-24 p-3 border rounded-md resize-none text-sm"
                placeholder="Please describe why you're reporting this review..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={!reportReason.trim() || isReporting}
                >
                  {isReporting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
