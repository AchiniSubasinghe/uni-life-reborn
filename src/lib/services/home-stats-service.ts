import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/firebase.config";

export interface HomeStats {
  verifiedBusinesses: number;
  activeStudents: number;
}

let homeStatsPromise: Promise<HomeStats> | null = null;

function isActiveUser(data: Record<string, unknown>): boolean {
  return data.isActive !== false;
}

export async function getHomeStats(forceRefresh: boolean = false): Promise<HomeStats> {
  if (!forceRefresh && homeStatsPromise) {
    return homeStatsPromise;
  }

  homeStatsPromise = (async () => {
    const approvedBusinessesQuery = query(
      collection(db, "businesses"),
      where("status", "==", "approved")
    );

    const studentsQuery = query(
      collection(db, "users"),
      where("role", "==", "student")
    );

    const [approvedBusinessesSnapshot, usersStudentsSnapshot, legacyStudentsSnapshot] = await Promise.all([
      getDocs(approvedBusinessesQuery),
      getDocs(studentsQuery),
      getDocs(collection(db, "students")),
    ]);

    const verifiedBusinesses = approvedBusinessesSnapshot.docs.filter(
      (docSnap) => docSnap.data().isBlocked !== true
    ).length;

    const unifiedActiveStudentIds = new Set<string>();
    usersStudentsSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      if (isActiveUser(data)) {
        unifiedActiveStudentIds.add(docSnap.id);
      }
    });

    let legacyOnlyActiveStudents = 0;
    legacyStudentsSnapshot.docs.forEach((docSnap) => {
      if (unifiedActiveStudentIds.has(docSnap.id)) {
        return;
      }

      const data = docSnap.data() as Record<string, unknown>;
      if (isActiveUser(data)) {
        legacyOnlyActiveStudents += 1;
      }
    });

    return {
      verifiedBusinesses,
      activeStudents: unifiedActiveStudentIds.size + legacyOnlyActiveStudents,
    };
  })();

  try {
    return await homeStatsPromise;
  } catch (error) {
    homeStatsPromise = null;
    throw error;
  }
}
