import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Favorite, BusinessCategory } from "@/types";
import { getBusinessById } from "./business-service";

const FAVORITES_COLLECTION = "favorites";

// ============================================
// CREATE / ADD OPERATIONS
// ============================================
export async function addFavorite(
  userId: string,
  businessId: string
): Promise<string> {
  // Check if already favorited
  const existing = await isFavorited(userId, businessId);
  if (existing) {
    throw new Error("Business is already in favorites");
  }

  // Get business details
  const business = await getBusinessById(businessId);
  if (!business) {
    throw new Error("Business not found");
  }

  const favoriteData = {
    userId,
    businessId,
    businessName: business.name,
    businessCategory: business.category,
    businessImage: business.coverImage || business.images[0] || "",
    addedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, FAVORITES_COLLECTION), favoriteData);

  // Also update user's favoriteBusinessIds array for quick access
  await updateDoc(doc(db, "users", userId), {
    favoriteBusinessIds: arrayUnion(businessId),
  }).catch(() => {
    // Fallback for students collection
    updateDoc(doc(db, "students", userId), {
      favoriteBusinessIds: arrayUnion(businessId),
    });
  });

  return docRef.id;
}

// ============================================
// READ OPERATIONS
// ============================================
export async function getFavoritesByUser(userId: string): Promise<Favorite[]> {
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where("userId", "==", userId),
    orderBy("addedAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Favorite));
}

export async function getFavoritesByCategory(
  userId: string,
  category: BusinessCategory
): Promise<Favorite[]> {
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where("userId", "==", userId),
    where("businessCategory", "==", category),
    orderBy("addedAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Favorite));
}

export async function isFavorited(
  userId: string,
  businessId: string
): Promise<boolean> {
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where("userId", "==", userId),
    where("businessId", "==", businessId)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function getFavoriteCount(businessId: string): Promise<number> {
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where("businessId", "==", businessId)
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

// ============================================
// DELETE / REMOVE OPERATIONS
// ============================================
export async function removeFavorite(
  userId: string,
  businessId: string
): Promise<void> {
  const q = query(
    collection(db, FAVORITES_COLLECTION),
    where("userId", "==", userId),
    where("businessId", "==", businessId)
  );

  const snapshot = await getDocs(q);
  
  for (const docSnapshot of snapshot.docs) {
    await deleteDoc(doc(db, FAVORITES_COLLECTION, docSnapshot.id));
  }

  // Also update user's favoriteBusinessIds array
  await updateDoc(doc(db, "users", userId), {
    favoriteBusinessIds: arrayRemove(businessId),
  }).catch(() => {
    // Fallback for students collection
    updateDoc(doc(db, "students", userId), {
      favoriteBusinessIds: arrayRemove(businessId),
    });
  });
}

export async function removeAllFavorites(userId: string): Promise<void> {
  const favorites = await getFavoritesByUser(userId);
  
  for (const favorite of favorites) {
    await deleteDoc(doc(db, FAVORITES_COLLECTION, favorite.id));
  }

  // Clear user's favoriteBusinessIds array
  await updateDoc(doc(db, "users", userId), {
    favoriteBusinessIds: [],
  }).catch(() => {
    updateDoc(doc(db, "students", userId), {
      favoriteBusinessIds: [],
    });
  });
}

// ============================================
// TOGGLE OPERATION (Convenience)
// ============================================
export async function toggleFavorite(
  userId: string,
  businessId: string
): Promise<{ isFavorited: boolean }> {
  const favorited = await isFavorited(userId, businessId);
  
  if (favorited) {
    await removeFavorite(userId, businessId);
    return { isFavorited: false };
  } else {
    await addFavorite(userId, businessId);
    return { isFavorited: true };
  }
}
