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
  startAfter,
  serverTimestamp,
  DocumentSnapshot,
  GeoPoint,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/config/firebase.config";
import { Business, BusinessFormData, BusinessStatus, BusinessCategory, SearchFilters, GeoLocation } from "@/types";

const BUSINESSES_COLLECTION = "businesses";

// ============================================
// CREATE OPERATIONS
// ============================================
export async function createBusiness(
  data: BusinessFormData,
  providerId: string,
  providerName: string,
  images: File[]
): Promise<string> {
  // Upload images first
  const imageUrls = await uploadBusinessImages(images, providerId);
  
  // Generate search keywords
  const searchKeywords = generateSearchKeywords(data.name, data.description, data.category);
  
  const businessData = {
    ...data,
    providerId,
    providerName,
    location: new GeoPoint(data.latitude, data.longitude),
    images: imageUrls,
    coverImage: imageUrls[0] || "",
    status: "pending" as BusinessStatus,
    averageRating: 0,
    totalReviews: 0,
    searchKeywords,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, BUSINESSES_COLLECTION), businessData);
  return docRef.id;
}

// ============================================
// READ OPERATIONS
// ============================================
export async function getBusinessById(id: string): Promise<Business | null> {
  const docRef = doc(db, BUSINESSES_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Business;
  }
  return null;
}

export async function getApprovedBusinesses(
  filters?: SearchFilters,
  lastDoc?: DocumentSnapshot,
  pageSize: number = 12
): Promise<{ businesses: Business[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, BUSINESSES_COLLECTION),
    where("status", "==", "approved")
  );

  // Apply filters
  if (filters?.category) {
    q = query(q, where("category", "==", filters.category));
  }
  
  if (filters?.minRating) {
    q = query(q, where("averageRating", ">=", filters.minRating));
  }
  
  if (filters?.priceRange && filters.priceRange.length > 0) {
    q = query(q, where("priceRange", "in", filters.priceRange));
  }

  // Apply sorting
  switch (filters?.sortBy) {
    case "rating":
      q = query(q, orderBy("averageRating", filters.sortOrder || "desc"));
      break;
    case "price":
      q = query(q, orderBy("priceRange", filters.sortOrder || "asc"));
      break;
    case "newest":
      q = query(q, orderBy("createdAt", "desc"));
      break;
    default:
      q = query(q, orderBy("createdAt", "desc"));
  }

  // Apply pagination
  q = query(q, limit(pageSize));
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const businesses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { businesses, lastDoc: newLastDoc };
}

export async function getBusinessesByProvider(providerId: string): Promise<Business[]> {
  const q = query(
    collection(db, BUSINESSES_COLLECTION),
    where("providerId", "==", providerId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
}

export async function getBusinessesByCategory(category: BusinessCategory): Promise<Business[]> {
  const q = query(
    collection(db, BUSINESSES_COLLECTION),
    where("status", "==", "approved"),
    where("category", "==", category),
    orderBy("averageRating", "desc"),
    limit(20)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
}

export async function getPendingBusinesses(): Promise<Business[]> {
  const q = query(
    collection(db, BUSINESSES_COLLECTION),
    where("status", "==", "pending"),
    orderBy("createdAt", "asc")
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
}

export async function searchBusinesses(searchQuery: string): Promise<Business[]> {
  // Convert search query to lowercase for matching
  const searchTerms = searchQuery.toLowerCase().split(" ");
  
  const q = query(
    collection(db, BUSINESSES_COLLECTION),
    where("status", "==", "approved"),
    where("searchKeywords", "array-contains-any", searchTerms),
    limit(20)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
}

// ============================================
// GEOLOCATION OPERATIONS
// ============================================
export async function getNearbyBusinesses(
  center: GeoLocation,
  radiusKm: number,
  category?: BusinessCategory
): Promise<Business[]> {
  // Firestore doesn't have native geo queries, so we use a bounding box approach
  // For production, consider using Firebase GeoFire or a similar solution
  
  const latDelta = radiusKm / 111; // Approximate km per degree latitude
  const lonDelta = radiusKm / (111 * Math.cos(center.latitude * Math.PI / 180));
  
  const minLat = center.latitude - latDelta;
  const maxLat = center.latitude + latDelta;
  const minLon = center.longitude - lonDelta;
  const maxLon = center.longitude + lonDelta;
  
  let q = query(
    collection(db, BUSINESSES_COLLECTION),
    where("status", "==", "approved")
  );
  
  if (category) {
    q = query(q, where("category", "==", category));
  }
  
  const snapshot = await getDocs(q);
  const businesses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
  
  // Filter by actual distance
  return businesses.filter(business => {
    const lat = business.location.latitude;
    const lon = business.location.longitude;
    
    if (lat < minLat || lat > maxLat || lon < minLon || lon > maxLon) {
      return false;
    }
    
    const distance = calculateDistance(center, { latitude: lat, longitude: lon });
    return distance <= radiusKm;
  });
}

function calculateDistance(point1: GeoLocation, point2: GeoLocation): number {
  const R = 6371; // Earth's radius in km
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ============================================
// UPDATE OPERATIONS
// ============================================
export async function updateBusiness(
  businessId: string,
  data: Partial<BusinessFormData>,
  newImages?: File[]
): Promise<void> {
  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  
  if (data.latitude && data.longitude) {
    updateData.location = new GeoPoint(data.latitude, data.longitude);
    delete updateData.latitude;
    delete updateData.longitude;
  }
  
  if (data.name || data.description || data.category) {
    updateData.searchKeywords = generateSearchKeywords(
      data.name || "",
      data.description || "",
      data.category || "other"
    );
  }
  
  if (newImages && newImages.length > 0) {
    const business = await getBusinessById(businessId);
    if (business) {
      const imageUrls = await uploadBusinessImages(newImages, business.providerId);
      updateData.images = [...(business.images || []), ...imageUrls];
    }
  }
  
  await updateDoc(doc(db, BUSINESSES_COLLECTION, businessId), updateData);
}

export async function updateBusinessStatus(
  businessId: string,
  status: BusinessStatus,
  adminId: string,
  rejectionReason?: string
): Promise<void> {
  const updateData: any = {
    status,
    updatedAt: serverTimestamp(),
  };
  
  if (status === "approved") {
    updateData.approvedAt = serverTimestamp();
    updateData.approvedBy = adminId;
  } else if (status === "rejected" && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }
  
  await updateDoc(doc(db, BUSINESSES_COLLECTION, businessId), updateData);
}

export async function updateBusinessRating(
  businessId: string,
  newRating: number,
  totalReviews: number
): Promise<void> {
  await updateDoc(doc(db, BUSINESSES_COLLECTION, businessId), {
    averageRating: newRating,
    totalReviews,
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// DELETE OPERATIONS
// ============================================
export async function deleteBusiness(businessId: string): Promise<void> {
  const business = await getBusinessById(businessId);
  
  if (business) {
    // Delete images from storage
    for (const imageUrl of business.images) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
  }
  
  await deleteDoc(doc(db, BUSINESSES_COLLECTION, businessId));
}

// ============================================
// HELPER FUNCTIONS
// ============================================
async function uploadBusinessImages(images: File[], providerId: string): Promise<string[]> {
  const urls: string[] = [];
  
  for (const image of images) {
    const fileName = `${Date.now()}_${image.name}`;
    const storageRef = ref(storage, `businesses/${providerId}/${fileName}`);
    
    await uploadBytes(storageRef, image);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  
  return urls;
}

function generateSearchKeywords(name: string, description: string, category: string): string[] {
  const text = `${name} ${description} ${category}`.toLowerCase();
  const words = text.split(/\s+/).filter(word => word.length > 2);
  const uniqueWords = [...new Set(words)];
  return uniqueWords.slice(0, 20); // Limit to 20 keywords
}
