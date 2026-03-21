import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/config/firebase.config";
import {
  AdminNotificationSettings,
  ProviderNotificationSettings,
  StudentNotificationSettings,
} from "@/types";

const DEFAULT_STUDENT_NOTIFICATIONS: StudentNotificationSettings = {
  emailNotifications: true,
  newBusinesses: true,
  reviewResponses: true,
  weeklyDigest: false,
};

const DEFAULT_PROVIDER_NOTIFICATIONS: ProviderNotificationSettings = {
  emailNotifications: true,
  newReviews: true,
  approvalUpdates: true,
  weeklyReport: true,
};

const DEFAULT_ADMIN_NOTIFICATIONS: AdminNotificationSettings = {
  emailNotifications: true,
  newBusinessSubmissions: true,
  reportedReviews: true,
  newUserSignups: true,
  dailyDigest: true,
};

interface StudentSettingsPayload {
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string;
  phone: string;
  university: string;
  studentId: string;
  notifications: StudentNotificationSettings;
}

interface ProviderSettingsPayload {
  firstName: string;
  lastName: string;
  nic: string;
  email: string;
  photoURL: string;
  phone: string;
  notifications: ProviderNotificationSettings;
}

interface LegacyProviderProfileFields {
  businessName?: string;
  ownerName?: string;
  email?: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  description?: string;
  website?: string;
}

interface AdminSettingsPayload {
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string;
  notifications: AdminNotificationSettings;
}

interface PlatformSettingsPayload {
  requireApproval: boolean;
  allowGuestBrowsing: boolean;
  maxImagesPerBusiness: number;
  reviewModeration: boolean;
}

async function resolveProfileCollection(
  userId: string,
  preferredCollection: "users" | "students" | "providers"
): Promise<"users" | "students" | "providers"> {
  const preferredRef = doc(db, preferredCollection, userId);
  const preferredSnap = await getDoc(preferredRef);
  if (preferredSnap.exists()) {
    return preferredCollection;
  }

  const fallbackCollections: Array<"users" | "students" | "providers"> = [
    "users",
    "students",
    "providers",
  ].filter((name) => name !== preferredCollection) as Array<
    "users" | "students" | "providers"
  >;

  for (const collectionName of fallbackCollections) {
    const ref = doc(db, collectionName, userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return collectionName;
    }
  }

  return preferredCollection;
}

export async function getStudentSettings(
  userId: string,
  email: string
): Promise<StudentSettingsPayload> {
  const collectionName = await resolveProfileCollection(userId, "students");
  const snap = await getDoc(doc(db, collectionName, userId));
  const data = snap.data() || {};

  return {
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    email: data.email || email || "",
    photoURL: data.photoURL || "",
    phone: data.phone || "",
    university: data.university || "",
    studentId: data.studentId || "",
    notifications: {
      ...DEFAULT_STUDENT_NOTIFICATIONS,
      ...(data.notifications || {}),
    },
  };
}

export async function saveStudentProfile(
  userId: string,
  payload: Omit<StudentSettingsPayload, "notifications">
): Promise<void> {
  const collectionName = await resolveProfileCollection(userId, "students");
  const fullName = `${payload.firstName} ${payload.lastName}`.trim();

  await setDoc(
    doc(db, collectionName, userId),
    {
      ...payload,
      fullName,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveStudentNotifications(
  userId: string,
  notifications: StudentNotificationSettings
): Promise<void> {
  const collectionName = await resolveProfileCollection(userId, "students");
  await setDoc(
    doc(db, collectionName, userId),
    {
      notifications,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getProviderSettings(
  userId: string,
  email: string
): Promise<ProviderSettingsPayload> {
  const collectionName = await resolveProfileCollection(userId, "providers");
  const snap = await getDoc(doc(db, collectionName, userId));
  const data = (snap.data() || {}) as Record<string, unknown>;
  const legacyOwnerName =
    typeof data.ownerName === "string" ? data.ownerName.trim() : "";
  const ownerNameParts = legacyOwnerName.split(/\s+/).filter(Boolean);
  const derivedFirstName = ownerNameParts[0] || "";
  const derivedLastName = ownerNameParts.slice(1).join(" ");

  return {
    firstName:
      (typeof data.firstName === "string" ? data.firstName : derivedFirstName) ||
      "",
    lastName:
      (typeof data.lastName === "string" ? data.lastName : derivedLastName) || "",
    nic: (typeof data.nic === "string" ? data.nic : "") || "",
    email: (typeof data.email === "string" ? data.email : "") || email || "",
    photoURL: (typeof data.photoURL === "string" ? data.photoURL : "") || "",
    phone: (typeof data.phone === "string" ? data.phone : "") || "",
    notifications: {
      ...DEFAULT_PROVIDER_NOTIFICATIONS,
      ...(data.notifications || {}),
    },
  };
}

export async function saveProviderProfile(
  userId: string,
  payload: Omit<ProviderSettingsPayload, "notifications"> & LegacyProviderProfileFields
): Promise<void> {
  const collectionName = await resolveProfileCollection(userId, "providers");
  await setDoc(
    doc(db, collectionName, userId),
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveProviderNotifications(
  userId: string,
  notifications: ProviderNotificationSettings
): Promise<void> {
  const collectionName = await resolveProfileCollection(userId, "providers");
  await setDoc(
    doc(db, collectionName, userId),
    {
      notifications,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getAdminSettings(
  userId: string,
  email: string
): Promise<AdminSettingsPayload> {
  const collectionName = await resolveProfileCollection(userId, "users");
  const snap = await getDoc(doc(db, collectionName, userId));
  const data = snap.data() || {};

  return {
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    email: data.email || email || "",
    photoURL: data.photoURL || "",
    notifications: {
      ...DEFAULT_ADMIN_NOTIFICATIONS,
      ...(data.notifications || {}),
    },
  };
}

export async function saveAdminProfile(
  userId: string,
  payload: Omit<AdminSettingsPayload, "notifications">
): Promise<void> {
  const collectionName = await resolveProfileCollection(userId, "users");
  const fullName = `${payload.firstName} ${payload.lastName}`.trim();

  await setDoc(
    doc(db, collectionName, userId),
    {
      ...payload,
      fullName,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveAdminNotifications(
  userId: string,
  notifications: AdminNotificationSettings
): Promise<void> {
  const collectionName = await resolveProfileCollection(userId, "users");
  await setDoc(
    doc(db, collectionName, userId),
    {
      notifications,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getPlatformSettings(): Promise<PlatformSettingsPayload> {
  const settingsRef = doc(db, "settings", "platform");
  const settingsSnap = await getDoc(settingsRef);

  if (!settingsSnap.exists()) {
    return {
      requireApproval: true,
      allowGuestBrowsing: true,
      maxImagesPerBusiness: 10,
      reviewModeration: false,
    };
  }

  const data = settingsSnap.data();
  return {
    requireApproval: data.requireApproval ?? true,
    allowGuestBrowsing: data.allowGuestBrowsing ?? true,
    maxImagesPerBusiness: data.maxImagesPerBusiness ?? 10,
    reviewModeration: data.reviewModeration ?? false,
  };
}

export async function savePlatformSettings(
  platformSettings: PlatformSettingsPayload,
  updatedBy: string
): Promise<void> {
  const settingsRef = doc(db, "settings", "platform");

  await setDoc(
    settingsRef,
    {
      ...platformSettings,
      updatedBy,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function uploadProfileImage(userId: string, file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `profile-images/${userId}/${Date.now()}-${safeName}`;
  const imageRef = ref(storage, filePath);

  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}
