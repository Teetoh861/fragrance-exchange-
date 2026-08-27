"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PriceOfferActions({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "accept" | "decline") {
    setLoading(action);
    setError(null);
    const res = await fetch(`/api/offers/${offerId}/${action}`, { method: "POST" });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button onClick={() => act("accept")} disabled={loading !== null} className="flex-1">
          {loading === "accept" ? "…" : "Accept Offer"}
        </Button>
        <Button
          variant="outline"
          onClick={() => act("decline")}
          disabled={loading !== null}
          className="flex-1"
        >
          {loading === "decline" ? "…" : "Decline"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
