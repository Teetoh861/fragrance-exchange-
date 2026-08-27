"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BuyNowButton({ listingId, loggedIn }: { listingId: string; loggedIn: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!loggedIn) {
      router.push(`/login?callbackUrl=/listings/${listingId}`);
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not start checkout.");
      return;
    }

    if (data.authorizationUrl) {
      window.location.href = data.authorizationUrl;
    } else if (data.orderId) {
      router.push(`/orders/${data.orderId}`);
    }
  }

  return (
    <div>
      <Button size="lg" className="w-full" onClick={onClick} disabled={loading}>
        {loading ? "Starting checkout…" : "Buy Now"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
