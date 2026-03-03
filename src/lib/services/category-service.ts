import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Category, BusinessCategory } from "@/types";

const CATEGORIES_COLLECTION = "categories";

// Default categories for initial setup
export const DEFAULT_CATEGORIES: Omit<Category, "id" | "businessCount">[] = [
  {
    name: "Hostels",
    slug: "hostel",
    description: "Student accommodation and boarding facilities",
    icon: "Building2",
    imageUrl: "/images/categories/hostel.jpg",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Restaurants",
    slug: "restaurant",
    description: "Dining places and food outlets",
    icon: "UtensilsCrossed",
    imageUrl: "/images/categories/restaurant.jpg",
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Supermarkets",
    slug: "supermarket",
    description: "Grocery stores and shopping centers",
    icon: "ShoppingCart",
    imageUrl: "/images/categories/supermarket.jpg",
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Pharmacies",
    slug: "pharmacy",
    description: "Medical stores and healthcare products",
    icon: "Pill",
    imageUrl: "/images/categories/pharmacy.jpg",
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Laundry Services",
    slug: "laundry",
    description: "Washing and dry cleaning services",
    icon: "Shirt",
    imageUrl: "/images/categories/laundry.jpg",
    isActive: true,
    sortOrder: 5,
  },
  {
    name: "Stationary Shops",
    slug: "stationary",
    description: "Books, stationery, and study materials",
    icon: "BookOpen",
    imageUrl: "/images/categories/stationary.jpg",
    isActive: true,
    sortOrder: 6,
  },
  {
    name: "Gyms & Fitness",
    slug: "gym",
    description: "Fitness centers and sports facilities",
    icon: "Dumbbell",
    imageUrl: "/images/categories/gym.jpg",
    isActive: true,
    sortOrder: 7,
  },
  {
    name: "Cafes",
    slug: "cafe",
    description: "Coffee shops and casual hangout spots",
    icon: "Coffee",
    imageUrl: "/images/categories/cafe.jpg",
    isActive: true,
    sortOrder: 8,
  },
  {
    name: "Other Services",
    slug: "other",
    description: "Other useful services for students",
    icon: "MoreHorizontal",
    imageUrl: "/images/categories/other.jpg",
    isActive: true,
    sortOrder: 99,
  },
];

// ============================================
// READ OPERATIONS
// ============================================
export async function getAllCategories(): Promise<Category[]> {
  const q = query(
    collection(db, CATEGORIES_COLLECTION),
    where("isActive", "==", true),
    orderBy("sortOrder", "asc")
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    // Return default categories if none exist in DB
    return DEFAULT_CATEGORIES.map((cat, index) => ({
      ...cat,
      id: cat.slug,
      businessCount: 0,
    }));
  }

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Category));
}

export async function getCategoryBySlug(slug: BusinessCategory): Promise<Category | null> {
  const docRef = doc(db, CATEGORIES_COLLECTION, slug);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Category;
  }

  // Return default if not in DB
  const defaultCat = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
  if (defaultCat) {
    return { ...defaultCat, id: slug, businessCount: 0 };
  }

  return null;
}

// ============================================
// WRITE OPERATIONS
// ============================================
export async function initializeCategories(): Promise<void> {
  for (const category of DEFAULT_CATEGORIES) {
    const docRef = doc(db, CATEGORIES_COLLECTION, category.slug);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        ...category,
        businessCount: 0,
      });
    }
  }
}

export async function updateCategoryBusinessCount(
  slug: BusinessCategory,
  count: number
): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, slug);
  await updateDoc(docRef, { businessCount: count });
}

export async function updateCategory(
  slug: BusinessCategory,
  data: Partial<Category>
): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, slug);
  await updateDoc(docRef, data);
}

export async function toggleCategoryActive(
  slug: BusinessCategory,
  isActive: boolean
): Promise<void> {
  const docRef = doc(db, CATEGORIES_COLLECTION, slug);
  await updateDoc(docRef, { isActive });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
export function getCategoryIcon(slug: BusinessCategory): string {
  const category = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
  return category?.icon || "MoreHorizontal";
}

export function getCategoryName(slug: BusinessCategory): string {
  const category = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
  return category?.name || slug;
}
