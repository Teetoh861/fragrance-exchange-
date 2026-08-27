"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { formatNaira } from "@/lib/utils";

type MyListing = {
  id: string;
  brand: string;
  fragranceName: string;
  price: number;
};

export function ProposeSwapForm({
  listingId,
  myListings,
}: {
  listingId: string;
  myListings: MyListing[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/swaps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        offeredListingId: form.get("offeredListingId"),
        cashTopupAmount: form.get("cashTopupAmount") || 0,
      }),
    });

    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to send swap proposal.");
      return;
    }
    router.push(`/swaps/${data.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="offeredListingId">Your listing to offer</Label>
        <Select id="offeredListingId" name="offeredListingId" required defaultValue="">
          <option value="" disabled>
            Select one of your listings
          </option>
          {myListings.map((l) => (
            <option key={l.id} value={l.id}>
              {l.brand} — {l.fragranceName} ({formatNaira(l.price)})
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="cashTopupAmount">Cash top-up you&apos;ll add (₦, optional)</Label>
        <Input id="cashTopupAmount" name="cashTopupAmount" type="number" min={0} defaultValue={0} />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Sending…" : "Send Swap Proposal"}
      </Button>
    </form>
  );
}
