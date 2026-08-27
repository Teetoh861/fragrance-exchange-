"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { uploadPhoto } from "@/lib/client-upload";

export function ShipForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const proofFile = formData.get("proofPhoto") as File;
      const proofPhotoUrl = await uploadPhoto(proofFile);

      const res = await fetch(`/api/orders/${orderId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofPhotoUrl,
          trackingNumber: formData.get("trackingNumber"),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to mark as shipped.");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as shipped.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium text-stone-800">Mark as Shipped</p>
      <p className="text-xs text-muted">
        Photograph the item and package immediately before shipping — this upload is required.
      </p>
      <div>
        <Label htmlFor="proofPhoto">Shipment proof photo</Label>
        <input
          id="proofPhoto"
          name="proofPhoto"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          className="block w-full text-xs"
        />
      </div>
      <div>
        <Label htmlFor="trackingNumber">Tracking / waybill number</Label>
        <Input id="trackingNumber" name="trackingNumber" required maxLength={100} />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving…" : "Mark as Shipped"}
      </Button>
    </form>
  );
}
