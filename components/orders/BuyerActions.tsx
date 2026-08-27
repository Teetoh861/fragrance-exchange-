"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { uploadPhoto } from "@/lib/client-upload";
import { DISPUTE_CATEGORY_LABELS, UNBOXING_VIDEO_THRESHOLD } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";

export function BuyerActions({ orderId, pricePaid }: { orderId: string; pricePaid: number }) {
  const router = useRouter();
  const [showDispute, setShowDispute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onConfirm() {
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}/confirm`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to confirm receipt.");
      return;
    }
    router.refresh();
  }

  async function onDisputeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const evidenceFile = formData.get("evidence") as File | null;
      const evidenceUrl = evidenceFile && evidenceFile.size > 0 ? await uploadPhoto(evidenceFile) : undefined;

      const res = await fetch(`/api/orders/${orderId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.get("category"),
          description: formData.get("description"),
          evidenceUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to file dispute.");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to file dispute.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      {pricePaid >= UNBOXING_VIDEO_THRESHOLD && (
        <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
          This order is above {formatNaira(UNBOXING_VIDEO_THRESHOLD)} — we strongly recommend
          recording an unboxing video before opening the package.
        </p>
      )}

      <div className="flex gap-2">
        <Button onClick={onConfirm} disabled={loading} className="flex-1">
          Confirm Receipt
        </Button>
        <Button variant="outline" onClick={() => setShowDispute((v) => !v)} className="flex-1">
          Report a Problem
        </Button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {showDispute && (
        <form onSubmit={onDisputeSubmit} className="space-y-3 border-t border-border pt-3">
          <p className="text-xs text-muted">
            Not a valid reason: &quot;I don&apos;t like the smell.&quot; Disputes are for real
            problems with the item you received.
          </p>
          <div>
            <Label htmlFor="category">Reason</Label>
            <Select id="category" name="category" required defaultValue="">
              <option value="" disabled>
                Select a reason
              </option>
              {Object.entries(DISPUTE_CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="description">What happened?</Label>
            <Textarea id="description" name="description" rows={3} minLength={10} maxLength={1000} required />
          </div>
          <div>
            <Label htmlFor="evidence">Photo/video evidence (optional)</Label>
            <input
              id="evidence"
              name="evidence"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="block w-full text-xs"
            />
          </div>
          <Button type="submit" variant="danger" disabled={loading} className="w-full">
            {loading ? "Submitting…" : "Submit Dispute"}
          </Button>
        </form>
      )}
    </div>
  );
}
