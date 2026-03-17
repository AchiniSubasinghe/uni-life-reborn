import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { Business, BusinessCategory } from "@/types";

const SEARCH_ANALYTICS_COLLECTION = "searchAnalytics";

export async function trackStudentSearch(
  userId: string,
  queryText: string,
  category?: BusinessCategory
): Promise<void> {
  const normalizedQuery = queryText.trim().toLowerCase();

  if (!normalizedQuery) {
    return;
  }

  await addDoc(collection(db, SEARCH_ANALYTICS_COLLECTION), {
    userId,
    queryText: normalizedQuery,
    category: category || null,
    createdAt: serverTimestamp(),
  });
}

export async function getMostSearchedCategories(
  days: number = 30
): Promise<Array<{ category: string; count: number }>> {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const q = query(
    collection(db, SEARCH_ANALYTICS_COLLECTION),
    where("createdAt", ">=", fromDate),
    orderBy("createdAt", "desc"),
    limit(1000)
  );

  const snapshot = await getDocs(q);
  const categoryCounts = new Map<string, number>();

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data() as { category?: string | null; queryText?: string };

    let key = (data.category || "").trim().toLowerCase();

    if (!key && data.queryText) {
      key = data.queryText.split(" ")[0] || "other";
    }

    if (!key) {
      key = "other";
    }

    categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
  });

  return Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function getBusinessRegistrationsByMonth(
  businesses: Business[],
  months: number = 6
): Array<{ label: string; count: number }> {
  const result: Array<{ label: string; count: number }> = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = date.toLocaleString("en-US", { month: "short" });

    const count = businesses.filter((business) => {
      const businessDate = business.createdAt?.toDate?.();
      if (!businessDate) {
        return false;
      }

      return (
        businessDate.getFullYear() === date.getFullYear() &&
        businessDate.getMonth() === date.getMonth()
      );
    }).length;

    result.push({ label, count });
  }

  return result;
}
