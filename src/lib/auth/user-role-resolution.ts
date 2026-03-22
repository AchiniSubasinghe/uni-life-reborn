import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore"
import { db } from "@/config/firebase.config"
import type { UserRole } from "@/types"

function isUserRole(value: unknown): value is UserRole {
  return value === "student" || value === "provider" || value === "admin"
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

async function getRoleByUid(uid: string): Promise<UserRole | null> {
  const userDoc = await getDoc(doc(db, "users", uid))
  if (userDoc.exists()) {
    const role = userDoc.data().role
    if (isUserRole(role)) {
      return role
    }
  }

  const studentDoc = await getDoc(doc(db, "students", uid))
  if (studentDoc.exists()) {
    return "student"
  }

  const providerDoc = await getDoc(doc(db, "providers", uid))
  if (providerDoc.exists()) {
    return "provider"
  }

  return null
}

async function getRoleByEmail(email: string): Promise<UserRole | null> {
  const rawEmail = email.trim()
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    return null
  }

  const emailsToCheck = Array.from(new Set([rawEmail, normalizedEmail]))

  const [usersSnapshot, studentsSnapshot, providersSnapshot, usersNormalizedSnapshot, studentsNormalizedSnapshot, providersNormalizedSnapshot] = await Promise.all([
    getDocs(
      query(
        collection(db, "users"),
        where("email", "in", emailsToCheck),
        limit(1)
      )
    ),
    getDocs(
      query(
        collection(db, "students"),
        where("email", "in", emailsToCheck),
        limit(1)
      )
    ),
    getDocs(
      query(
        collection(db, "providers"),
        where("email", "in", emailsToCheck),
        limit(1)
      )
    ),
    getDocs(
      query(
        collection(db, "users"),
        where("normalizedEmail", "==", normalizedEmail),
        limit(1)
      )
    ),
    getDocs(
      query(
        collection(db, "students"),
        where("normalizedEmail", "==", normalizedEmail),
        limit(1)
      )
    ),
    getDocs(
      query(
        collection(db, "providers"),
        where("normalizedEmail", "==", normalizedEmail),
        limit(1)
      )
    ),
  ])

  const userRole = usersSnapshot.docs[0]?.data().role ?? usersNormalizedSnapshot.docs[0]?.data().role
  if (isUserRole(userRole)) {
    return userRole
  }

  if (!studentsSnapshot.empty || !studentsNormalizedSnapshot.empty) {
    return "student"
  }

  if (!providersSnapshot.empty || !providersNormalizedSnapshot.empty) {
    return "provider"
  }

  return null
}

export async function resolveUserRole(options: {
  uid: string
  email?: string | null
}): Promise<UserRole | null> {
  const roleByUid = await getRoleByUid(options.uid)
  if (roleByUid) {
    return roleByUid
  }

  if (options.email) {
    return getRoleByEmail(options.email)
  }

  return null
}

export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case "student":
      return "/student/dashboard"
    case "provider":
      return "/provider/dashboard"
    case "admin":
      return "/admin/dashboard"
    default:
      return "/"
  }
}
