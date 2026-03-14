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
  Ban,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import {
  blockBusiness,
  deleteBusiness,
  getBusinessesForApprovals,
  updateBusinessStatus,
} from "@/lib/services/business-service";
import { toggleUserActive } from "@/lib/services/user-service";
import { Business } from "@/types";
import { getCategoryName } from "@/lib/services/category-service";
import { formatDate } from "@/lib/date-utils";

export default function AdminApprovalsPage() {
  const { userData } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const data = await getBusinessesForApprovals();
      setBusinesses(data);
    } catch (error) {
      console.error("Error loading businesses:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (business: Business) => {
    if (!userData?.uid) return;
    setActionLoading(true);

    try {
      await updateBusinessStatus(business.id, "approved", userData.uid);
      await loadBusinesses();
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
      await loadBusinesses();
      setSelectedBusiness(null);
      setShowRejectModal(false);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting business:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBusiness = async (business: Business) => {
    if (!confirm(`Delete business "${business.name}"? This cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteBusiness(business.id);
      await loadBusinesses();
      if (selectedBusiness?.id === business.id) {
        setSelectedBusiness(null);
      }
    } catch (error) {
      console.error("Error deleting business:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockBusiness = async (business: Business) => {
    if (!userData?.uid) return;
    if (!confirm(`Block business "${business.name}"?`)) return;

    setActionLoading(true);
    try {
      await blockBusiness(business.id, userData.uid, "Blocked by admin");
      await loadBusinesses();
      if (selectedBusiness?.id === business.id) {
        setSelectedBusiness({ ...business, status: "rejected", isBlocked: true });
      }
    } catch (error) {
      console.error("Error blocking business:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockProvider = async (business: Business) => {
    if (!confirm(`Block provider account for "${business.providerName}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await toggleUserActive(business.providerId, false);
      await blockBusiness(business.id, userData!.uid, "Provider blocked by admin");
      await loadBusinesses();
    } catch (error) {
      console.error("Error blocking provider:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const viewDetails = async (business: Business) => {
    setSelectedBusiness(business);
  };

  const filteredBusinesses = businesses.filter((business) => {
    if (statusFilter === "all") return true;
    return business.status === statusFilter;
  });

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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Businesses ({filteredBusinesses.length})</h2>
            <div className="flex gap-2">
              {(["all", "pending", "approved"] as const).map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  variant={statusFilter === filter ? "default" : "outline"}
                  onClick={() => setStatusFilter(filter)}
                  className="capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {filteredBusinesses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-muted-foreground">
                  No businesses found for this filter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredBusinesses.map((business) => (
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
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          Status: {business.isBlocked ? "blocked" : business.status}
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
                    {selectedBusiness.isBlocked ? (
                      <span className="inline-flex items-center rounded-full bg-red-500/15 border border-red-400/20 px-2.5 py-0.5 text-xs font-medium text-red-300">
                        Blocked
                      </span>
                    ) : selectedBusiness.status === "approved" ? (
                      <span className="inline-flex items-center rounded-full bg-green-500/15 border border-green-400/20 px-2.5 py-0.5 text-xs font-medium text-green-300">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-400/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                        Pending Review
                      </span>
                    )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t">
                  {selectedBusiness.status === "pending" && !selectedBusiness.isBlocked && (
                    <>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(selectedBusiness)}
                        disabled={actionLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {actionLoading ? "Processing..." : "Approve"}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => handleBlockBusiness(selectedBusiness)}
                    disabled={actionLoading || selectedBusiness.isBlocked}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    {selectedBusiness.isBlocked ? "Business Blocked" : "Block Business"}
                  </Button>

                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteBusiness(selectedBusiness)}
                    disabled={actionLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Business
                  </Button>

                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleBlockProvider(selectedBusiness)}
                    disabled={actionLoading}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Block Provider
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
