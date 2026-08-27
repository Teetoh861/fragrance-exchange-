"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SwapOfferActions({ swapId }: { swapId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "accept" | "decline") {
    setLoading(action);
    setError(null);
    const res = await fetch(`/api/swaps/${swapId}/${action}`, { method: "POST" });
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
          {loading === "accept" ? "…" : "Accept Swap"}
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

export function PayTopupButton({ swapId }: { swapId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/swaps/${swapId}/pay-topup`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to start payment.");
      return;
    }
    if (data.authorizationUrl) {
      window.location.href = data.authorizationUrl;
    } else {
      router.refresh();
    }
  }

  return (
    <div>
      <Button onClick={onClick} disabled={loading} className="w-full">
        {loading ? "Starting payment…" : "Pay Cash Top-up"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
