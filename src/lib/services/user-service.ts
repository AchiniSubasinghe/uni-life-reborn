import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { User, Student, Provider, Admin, DashboardStats, UserRole } from "@/types";

const USERS_COLLECTION = "users";

// ============================================
// READ OPERATIONS
// ============================================
export async function getUserById(uid: string): Promise<User | null> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { uid: docSnap.id, ...docSnap.data() } as User;
  }

  // Fallback to legacy collections
  const studentDoc = await getDoc(doc(db, "students", uid));
  if (studentDoc.exists()) {
    return { uid, role: "student", ...studentDoc.data() } as User;
  }

  const providerDoc = await getDoc(doc(db, "providers", uid));
  if (providerDoc.exists()) {
    return { uid, role: "provider", ...providerDoc.data() } as User;
  }

  return null;
}

export async function getAllUsers(): Promise<User[]> {
  const users: User[] = [];

  // Get from unified users collection
  const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
  usersSnapshot.docs.forEach((doc) => {
    users.push({ uid: doc.id, ...doc.data() } as User);
  });

  // Get from legacy students collection
  const studentsSnapshot = await getDocs(collection(db, "students"));
  studentsSnapshot.docs.forEach((doc) => {
    if (!users.find((u) => u.uid === doc.id)) {
      users.push({ uid: doc.id, role: "student", ...doc.data() } as User);
    }
  });

  // Get from legacy providers collection
  const providersSnapshot = await getDocs(collection(db, "providers"));
  providersSnapshot.docs.forEach((doc) => {
    if (!users.find((u) => u.uid === doc.id)) {
      users.push({ uid: doc.id, role: "provider", ...doc.data() } as User);
    }
  });

  return users;
}

export async function getUsersByRole(role: UserRole): Promise<User[]> {
  const q = query(
    collection(db, USERS_COLLECTION),
    where("role", "==", role),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() } as User));

  // Also check legacy collections if role is student or provider
  if (role === "student") {
    const legacySnapshot = await getDocs(collection(db, "students"));
    legacySnapshot.docs.forEach((doc) => {
      if (!users.find((u) => u.uid === doc.id)) {
        users.push({ uid: doc.id, role: "student", ...doc.data() } as User);
      }
    });
  } else if (role === "provider") {
    const legacySnapshot = await getDocs(collection(db, "providers"));
    legacySnapshot.docs.forEach((doc) => {
      if (!users.find((u) => u.uid === doc.id)) {
        users.push({ uid: doc.id, role: "provider", ...doc.data() } as User);
      }
    });
  }

  return users;
}

// ============================================
// UPDATE OPERATIONS
// ============================================
export async function updateUser(
  uid: string,
  data: Partial<User>
): Promise<void> {
  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Try unified collection first
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (userDoc.exists()) {
    await updateDoc(doc(db, USERS_COLLECTION, uid), updateData);
    return;
  }

  // Fallback to legacy collections
  const studentDoc = await getDoc(doc(db, "students", uid));
  if (studentDoc.exists()) {
    await updateDoc(doc(db, "students", uid), updateData);
    return;
  }

  const providerDoc = await getDoc(doc(db, "providers", uid));
  if (providerDoc.exists()) {
    await updateDoc(doc(db, "providers", uid), updateData);
    return;
  }

  throw new Error("User not found");
}

export async function toggleUserActive(
  uid: string,
  isActive: boolean
): Promise<void> {
  await updateUser(uid, { isActive });
}

export async function verifyProvider(uid: string): Promise<void> {
  await updateUser(uid, { isVerified: true } as Partial<Provider>);
}

// ============================================
// STATS OPERATIONS
// ============================================
export async function getDashboardStats(): Promise<DashboardStats> {
  const users = await getAllUsers();
  
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalProviders = users.filter((u) => u.role === "provider").length;

  // Get business stats
  const businessesSnapshot = await getDocs(collection(db, "businesses"));
  const businesses = businessesSnapshot.docs.map((doc) => doc.data());
  const totalBusinesses = businesses.length;
  const pendingApprovals = businesses.filter((b) => b.status === "pending").length;

  // Get review stats
  const reviewsSnapshot = await getDocs(collection(db, "reviews"));
  const reviews = reviewsSnapshot.docs.map((doc) => doc.data());
  const totalReviews = reviews.length;
  const reportedReviews = reviews.filter((r) => r.isReported).length;

  return {
    totalUsers: users.length,
    totalStudents,
    totalProviders,
    totalBusinesses,
    pendingApprovals,
    totalReviews,
    reportedReviews,
  };
}

// ============================================
// MIGRATION HELPERS
// ============================================
export async function migrateUserToUnifiedCollection(uid: string): Promise<void> {
  const user = await getUserById(uid);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if already in unified collection
  const existingDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (existingDoc.exists()) {
    return; // Already migrated
  }

  // Create in unified collection
  await setDoc(doc(db, USERS_COLLECTION, uid), {
    ...user,
    updatedAt: serverTimestamp(),
  });
}
