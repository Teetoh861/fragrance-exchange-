"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function MakeOfferForm({ listingId, listedPrice }: { listingId: string; listedPrice: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        offerPrice: form.get("offerPrice"),
      }),
    });

    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to send offer.");
      return;
    }
    router.push(`/offers/${data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="offerPrice">Your offer (₦)</Label>
        <Input
          id="offerPrice"
          name="offerPrice"
          type="number"
          min={500}
          max={listedPrice}
          required
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Sending…" : "Send Offer"}
      </Button>
    </form>
  );
}
