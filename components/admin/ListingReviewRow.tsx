"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type Props = {
  id: string;
  brand: string;
  fragranceName: string;
  sellerName: string;
  photoUrl?: string;
};

export function ListingReviewRow({ id, brand, fragranceName, sellerName, photoUrl }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setLoading(action);
    setError(null);
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    setLoading(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
        {photoUrl && <Image src={photoUrl} alt="" fill className="object-cover" />}
      </div>
      <div className="flex-1">
        <a href={`/listings/${id}`} target="_blank" className="font-medium text-stone-900 hover:underline">
          {brand} — {fragranceName}
        </a>
        <p className="text-xs text-muted">Seller: {sellerName}</p>
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="h-9 w-48 rounded-lg border border-border bg-background px-2 text-xs"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => act("approve")} disabled={loading !== null}>
          {loading === "approve" ? "…" : "Approve"}
        </Button>
        <Button size="sm" variant="danger" onClick={() => act("reject")} disabled={loading !== null}>
          {loading === "reject" ? "…" : "Reject"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
