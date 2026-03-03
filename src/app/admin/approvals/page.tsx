"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { getPendingBusinesses, updateBusinessStatus, getBusinessById } from "@/lib/services/business-service";
import { Business } from "@/types";
import { getCategoryName } from "@/lib/services/category-service";
import { formatDate } from "@/lib/date-utils";

export default function AdminApprovalsPage() {
  const { userData } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPendingBusinesses();
  }, []);

  async function loadPendingBusinesses() {
    try {
      const data = await getPendingBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error("Error loading pending businesses:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (business: Business) => {
    if (!userData?.uid) return;
    setActionLoading(true);

    try {
      await updateBusinessStatus(business.id, "approved", userData.uid);
      setBusinesses((prev) => prev.filter((b) => b.id !== business.id));
      setSelectedBusiness(null);
    } catch (error) {
      console.error("Error approving business:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!userData?.uid || !selectedBusiness) return;
    setActionLoading(true);

    try {
      await updateBusinessStatus(
        selectedBusiness.id,
        "rejected",
        userData.uid,
        rejectionReason || "Does not meet our guidelines"
      );
      setBusinesses((prev) => prev.filter((b) => b.id !== selectedBusiness.id));
      setSelectedBusiness(null);
      setShowRejectModal(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting business:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const viewDetails = async (business: Business) => {
    setSelectedBusiness(business);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Business Approvals</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-24 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Business Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve pending business listings
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Pending ({businesses.length})
          </h2>

          {businesses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-muted-foreground">
                  No pending approvals at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {businesses.map((business) => (
                <Card
                  key={business.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedBusiness?.id === business.id ? "border-primary" : ""
                  }`}
                  onClick={() => viewDetails(business)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      {business.coverImage ? (
                        <img
                          src={business.coverImage}
                          alt={business.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{business.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getCategoryName(business.category)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {business.providerName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(business.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Detail View */}
        <div>
          {selectedBusiness ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedBusiness.name}</span>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    Pending Review
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Images */}
                {selectedBusiness.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedBusiness.images.slice(0, 4).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`${selectedBusiness.name} ${i + 1}`}
                        className="rounded-lg object-cover aspect-video"
                      />
                    ))}
                  </div>
                )}

                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Category
                    </p>
                    <p>{getCategoryName(selectedBusiness.category)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Description
                    </p>
                    <p className="text-sm">{selectedBusiness.description}</p>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{selectedBusiness.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedBusiness.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedBusiness.phone}</p>
                  </div>

                  {selectedBusiness.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedBusiness.email}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Provider
                    </p>
                    <p>{selectedBusiness.providerName}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedBusiness)}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {actionLoading ? "Processing..." : "Approve"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-20 text-center">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Select a business to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Reject Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please provide a reason for rejection. This will be sent to the
                provider.
              </p>
              <textarea
                className="w-full h-24 p-3 border rounded-md resize-none text-sm"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
