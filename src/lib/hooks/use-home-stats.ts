"use client";

import { useEffect, useState } from "react";
import { getHomeStats, HomeStats } from "@/lib/services/home-stats-service";

const EMPTY_STATS: HomeStats = {
  verifiedBusinesses: 0,
  activeStudents: 0,
};

export function useHomeStats() {
  const [stats, setStats] = useState<HomeStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const data = await getHomeStats();
        if (isMounted) {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to load home stats:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return { stats, isLoading };
}
