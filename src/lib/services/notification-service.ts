import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

type Role = "student" | "provider" | "admin";

type StudentPreferenceKey = "newBusinesses" | "reviewResponses";
type ProviderPreferenceKey = "newReviews" | "approvalUpdates" | "weeklyReport";
type AdminPreferenceKey = "newBusinessSubmissions" | "reportedReviews" | "newUserSignups" | "dailyDigest";

interface NotificationRecipient {
  uid: string;
  email?: string;
  role: Role;
  notifications?: Record<string, boolean>;
}

interface NotificationPayload {
  title: string;
  message: string;
  eventType: string;
  metadata?: Record<string, unknown>;
}

const PERIODIC_MARKERS_COLLECTION = "notificationMeta";

async function getRecipientsByRole(role: Role): Promise<NotificationRecipient[]> {
  const recipients = new Map<string, NotificationRecipient>();

  const usersQuery = query(collection(db, "users"), where("role", "==", role));
  const usersSnapshot = await getDocs(usersQuery);
  usersSnapshot.forEach((snapshotDoc) => {
    recipients.set(snapshotDoc.id, {
      uid: snapshotDoc.id,
      email: snapshotDoc.data().email,
      role,
      notifications: snapshotDoc.data().notifications || {},
    });
  });

  if (role === "student" || role === "provider") {
    const legacyCollection = role === "student" ? "students" : "providers";
    const legacySnapshot = await getDocs(collection(db, legacyCollection));
    legacySnapshot.forEach((snapshotDoc) => {
      if (!recipients.has(snapshotDoc.id)) {
        recipients.set(snapshotDoc.id, {
          uid: snapshotDoc.id,
          email: snapshotDoc.data().email,
          role,
          notifications: snapshotDoc.data().notifications || {},
        });
      }
    });
  }

  return [...recipients.values()];
}

async function getUserRecipient(uid: string): Promise<NotificationRecipient | null> {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    const role = userDoc.data().role as Role;
    return {
      uid: userDoc.id,
      email: userDoc.data().email,
      role,
      notifications: userDoc.data().notifications || {},
    };
  }

  const studentDoc = await getDoc(doc(db, "students", uid));
  if (studentDoc.exists()) {
    return {
      uid: studentDoc.id,
      email: studentDoc.data().email,
      role: "student",
      notifications: studentDoc.data().notifications || {},
    };
  }

  const providerDoc = await getDoc(doc(db, "providers", uid));
  if (providerDoc.exists()) {
    return {
      uid: providerDoc.id,
      email: providerDoc.data().email,
      role: "provider",
      notifications: providerDoc.data().notifications || {},
    };
  }

  return null;
}

function isEnabled(recipient: NotificationRecipient, key: string): boolean {
  const settings = recipient.notifications || {};
  return settings[key] !== false;
}

async function createNotification(recipient: NotificationRecipient, payload: NotificationPayload): Promise<void> {
  await addDoc(collection(db, "notifications"), {
    userId: recipient.uid,
    role: recipient.role,
    title: payload.title,
    message: payload.message,
    eventType: payload.eventType,
    metadata: payload.metadata || {},
    read: false,
    createdAt: serverTimestamp(),
  });

  if (isEnabled(recipient, "emailNotifications") && recipient.email) {
    await addDoc(collection(db, "emailQueue"), {
      to: recipient.email,
      userId: recipient.uid,
      subject: payload.title,
      body: payload.message,
      eventType: payload.eventType,
      metadata: payload.metadata || {},
      status: "pending",
      createdAt: serverTimestamp(),
    });
  }
}

export async function notifyStudents(
  preference: StudentPreferenceKey,
  payload: NotificationPayload
): Promise<void> {
  const recipients = await getRecipientsByRole("student");
  await Promise.allSettled(
    recipients
      .filter((recipient) => isEnabled(recipient, preference))
      .map((recipient) => createNotification(recipient, payload))
  );
}

export async function notifyProviders(
  preference: ProviderPreferenceKey,
  payload: NotificationPayload,
  providerId?: string
): Promise<void> {
  if (providerId) {
    const recipient = await getUserRecipient(providerId);
    if (!recipient || recipient.role !== "provider" || !isEnabled(recipient, preference)) {
      return;
    }
    await createNotification(recipient, payload);
    return;
  }

  const recipients = await getRecipientsByRole("provider");
  await Promise.allSettled(
    recipients
      .filter((recipient) => isEnabled(recipient, preference))
      .map((recipient) => createNotification(recipient, payload))
  );
}

export async function notifyAdmins(
  preference: AdminPreferenceKey,
  payload: NotificationPayload
): Promise<void> {
  const recipients = await getRecipientsByRole("admin");
  await Promise.allSettled(
    recipients
      .filter((recipient) => isEnabled(recipient, preference))
      .map((recipient) => createNotification(recipient, payload))
  );
}

export async function notifyStudentById(
  studentId: string,
  preference: StudentPreferenceKey,
  payload: NotificationPayload
): Promise<void> {
  const recipient = await getUserRecipient(studentId);
  if (!recipient || recipient.role !== "student" || !isEnabled(recipient, preference)) {
    return;
  }

  await createNotification(recipient, payload);
}

async function canSendPeriodicNotification(
  userId: string,
  marker: string,
  intervalMs: number
): Promise<boolean> {
  const markerRef = doc(db, PERIODIC_MARKERS_COLLECTION, `${userId}_${marker}`);
  const markerSnap = await getDoc(markerRef);

  if (!markerSnap.exists()) {
    return true;
  }

  const lastSentAt = markerSnap.data().lastSentAt?.toMillis?.() as number | undefined;
  if (!lastSentAt) {
    return true;
  }

  return Date.now() - lastSentAt >= intervalMs;
}

async function markPeriodicNotificationSent(userId: string, marker: string): Promise<void> {
  const markerRef = doc(db, PERIODIC_MARKERS_COLLECTION, `${userId}_${marker}`);
  await setDoc(
    markerRef,
    {
      userId,
      marker,
      lastSentAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function maybeSendProviderWeeklyReport(
  providerId: string,
  summary: {
    totalBusinesses: number;
    approvedBusinesses: number;
    pendingBusinesses: number;
    averageRating: number;
  }
): Promise<void> {
  const recipient = await getUserRecipient(providerId);
  if (!recipient || recipient.role !== "provider" || !isEnabled(recipient, "weeklyReport")) {
    return;
  }

  const marker = "provider_weekly_report";
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const shouldSend = await canSendPeriodicNotification(providerId, marker, oneWeekMs);
  if (!shouldSend) {
    return;
  }

  await createNotification(recipient, {
    title: "Weekly performance report",
    message: `Listings: ${summary.totalBusinesses}, approved: ${summary.approvedBusinesses}, pending: ${summary.pendingBusinesses}, average rating: ${summary.averageRating.toFixed(1)}.`,
    eventType: "provider.weekly_report",
    metadata: {
      ...summary,
    },
  });

  await markPeriodicNotificationSent(providerId, marker);
}

export async function maybeSendAdminDailyDigest(
  adminId: string,
  summary: {
    pendingApprovals: number;
    reportedReviews: number;
    totalUsers: number;
    totalBusinesses: number;
  }
): Promise<void> {
  const recipient = await getUserRecipient(adminId);
  if (!recipient || recipient.role !== "admin" || !isEnabled(recipient, "dailyDigest")) {
    return;
  }

  const marker = "admin_daily_digest";
  const oneDayMs = 24 * 60 * 60 * 1000;
  const shouldSend = await canSendPeriodicNotification(adminId, marker, oneDayMs);
  if (!shouldSend) {
    return;
  }

  await createNotification(recipient, {
    title: "Daily admin digest",
    message: `Pending approvals: ${summary.pendingApprovals}, reported reviews: ${summary.reportedReviews}, users: ${summary.totalUsers}, businesses: ${summary.totalBusinesses}.`,
    eventType: "admin.daily_digest",
    metadata: {
      ...summary,
    },
  });

  await markPeriodicNotificationSent(adminId, marker);
}
