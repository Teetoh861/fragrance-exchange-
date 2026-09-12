"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SeedReviewsButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function seed() {
    setLoading(true);
    setStatus(null);
    const res = await fetch("/api/admin/reviews/seed", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    setStatus(res.ok ? `Added sample reviews to ${data.seeded} listing(s).` : data.error ?? "Failed.");
  }

  return (
    <div className="flex items-center gap-3">
      <Button size="sm" variant="outline" onClick={seed} disabled={loading}>
        {loading ? "Seeding…" : "Seed sample reviews"}
      </Button>
      {status && <p className="text-xs text-muted">{status}</p>}
    </div>
  );
}
