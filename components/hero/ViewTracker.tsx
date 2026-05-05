"use client";

import { useEffect } from "react";

export default function ViewTracker({ heroId }: { heroId: number }) {
  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroId }),
    });
  }, [heroId]);

  return null;
}
