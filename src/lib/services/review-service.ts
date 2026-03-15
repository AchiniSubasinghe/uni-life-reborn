import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/config/firebase.config";
import { Review, ReviewFormData, UserRole } from "@/types";
import { updateBusinessRating, getBusinessById, getBusinessesByProvider } from "./business-service";

const REVIEWS_COLLECTION = "reviews";

// ============================================
// CREATE OPERATIONS
// ============================================
export async function createReview(
  businessId: string,
  businessName: string,
  userId: string,
  userName: string,
  data: ReviewFormData,
  userRole: UserRole = "student"
): Promise<string> {
  if (userRole !== "student") {
    throw new Error("Only students can create reviews");
  }

  // Check if user already reviewed this business
  const existingReview = await getUserReviewForBusiness(userId, businessId);
  if (existingReview) {
    throw new Error("You have already reviewed this business");
  }

  // Upload images if any
  let imageUrls: string[] = [];
  if (data.images && data.images.length > 0) {
    imageUrls = await uploadReviewImages(data.images, userId, businessId);
  }

  const reviewData = {
    businessId,
    businessName,
    userId,
    userName,
    userRole: "student" as const,
    rating: data.rating,
    comment: data.comment,
    images: imageUrls,
    isVisible: true,
    isReported: false,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewData);

  // Update business rating
  await recalculateBusinessRating(businessId);

  return docRef.id;
}

// ============================================
// READ OPERATIONS
// ============================================
export async function getReviewById(id: string): Promise<Review | null> {
  const docRef = doc(db, REVIEWS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Review;
  }
  return null;
}

export async function getReviewsForBusiness(
  businessId: string,
  includeHidden: boolean = false
): Promise<Review[]> {
  let q = query(
    collection(db, REVIEWS_COLLECTION),
    where("businessId", "==", businessId),
    orderBy("createdAt", "desc")
  );

  if (!includeHidden) {
    q = query(q, where("isVisible", "==", true));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
}

export async function getReviewsByUser(userId: string): Promise<Review[]> {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
}

export async function getReviewsForProvider(providerId: string): Promise<Review[]> {
  const businesses = await getBusinessesByProvider(providerId);
  const businessIds = businesses.map((business) => business.id);

  if (!businessIds.length) {
    return [];
  }

  const reviewsByBusiness = await Promise.all(
    businessIds.map((businessId) => getReviewsForBusiness(businessId, true))
  );

  return reviewsByBusiness.flat().sort((a, b) => {
    const dateA = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
    const dateB = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
    return dateB - dateA;
  });
}

export async function getUserReviewForBusiness(
  userId: string,
  businessId: string
): Promise<Review | null> {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where("userId", "==", userId),
    where("businessId", "==", businessId),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Review;
}

export async function getReportedReviews(): Promise<Review[]> {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where("isReported", "==", true),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
}

export async function getRecentReviews(count: number = 10): Promise<Review[]> {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where("isVisible", "==", true),
    orderBy("createdAt", "desc"),
    limit(count)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
}

// ============================================
// UPDATE OPERATIONS
// ============================================
export async function updateReview(
  reviewId: string,
  data: Partial<ReviewFormData>
): Promise<void> {
  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Remove images field if it contains File objects
  delete updateData.images;

  await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), updateData);

  // Recalculate business rating if rating changed
  if (data.rating) {
    const review = await getReviewById(reviewId);
    if (review) {
      await recalculateBusinessRating(review.businessId);
    }
  }
}

export async function addProviderResponse(
  reviewId: string,
  comment: string
): Promise<void> {
  await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
    providerResponse: {
      comment,
      respondedAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });
}

export async function reportReview(
  reviewId: string,
  reason: string
): Promise<void> {
  await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
    isReported: true,
    reportReason: reason,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleReviewVisibility(
  reviewId: string,
  isVisible: boolean
): Promise<void> {
  await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
    isVisible,
    updatedAt: serverTimestamp(),
  });

  // Recalculate business rating
  const review = await getReviewById(reviewId);
  if (review) {
    await recalculateBusinessRating(review.businessId);
  }
}

export async function clearReviewReport(reviewId: string): Promise<void> {
  await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
    isReported: false,
    reportReason: null,
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// DELETE OPERATIONS
// ============================================
export async function deleteReview(reviewId: string): Promise<void> {
  const review = await getReviewById(reviewId);

  if (review) {
    // Delete images from storage
    if (review.images) {
      for (const imageUrl of review.images) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error("Error deleting review image:", error);
        }
      }
    }

    await deleteDoc(doc(db, REVIEWS_COLLECTION, reviewId));

    // Recalculate business rating
    await recalculateBusinessRating(review.businessId);
  }
}

export async function canDeleteReview(
  reviewId: string,
  actorId: string,
  actorRole: UserRole
): Promise<boolean> {
  const review = await getReviewById(reviewId);
  if (!review) {
    return false;
  }

  if (actorRole === "admin") {
    return true;
  }

  if (actorRole === "student") {
    return review.userId === actorId;
  }

  if (actorRole === "provider") {
    const business = await getBusinessById(review.businessId);
    return business?.providerId === actorId;
  }

  return false;
}

export async function deleteReviewByActor(
  reviewId: string,
  actorId: string,
  actorRole: UserRole
): Promise<void> {
  const authorized = await canDeleteReview(reviewId, actorId, actorRole);

  if (!authorized) {
    throw new Error("You are not authorized to delete this review");
  }

  await deleteReview(reviewId);
}

// ============================================
// HELPER FUNCTIONS
// ============================================
async function uploadReviewImages(
  images: File[],
  userId: string,
  businessId: string
): Promise<string[]> {
  const urls: string[] = [];

  for (const image of images) {
    const fileName = `${Date.now()}_${image.name}`;
    const storageRef = ref(
      storage,
      `reviews/${businessId}/${userId}/${fileName}`
    );

    await uploadBytes(storageRef, image);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }

  return urls;
}

async function recalculateBusinessRating(businessId: string): Promise<void> {
  const reviews = await getReviewsForBusiness(businessId, false);
  
  if (reviews.length === 0) {
    await updateBusinessRating(businessId, 0, 0);
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await updateBusinessRating(businessId, Math.round(averageRating * 10) / 10, reviews.length);
}
