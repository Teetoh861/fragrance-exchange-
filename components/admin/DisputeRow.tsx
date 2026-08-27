"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DISPUTE_CATEGORY_LABELS } from "@/lib/constants";

export function DisputeRow({
  id,
  orderId,
  category,
  description,
}: {
  id: string;
  orderId: string;
  category: string;
  description: string;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function resolve() {
    if (!note.trim()) {
      setError("Add a resolution note first.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/disputes/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolutionNote: note }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="border-b border-border py-4">
      <a href={`/orders/${orderId}`} target="_blank" className="font-medium text-stone-900 hover:underline">
        Order {orderId.slice(0, 8)}
      </a>
      <p className="text-xs text-muted">{DISPUTE_CATEGORY_LABELS[category]}</p>
      <p className="mt-1 text-sm text-stone-700">{description}</p>
      <div className="mt-2 flex gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Resolution note"
          className="h-9 flex-1 rounded-lg border border-border bg-background px-2 text-xs"
        />
        <Button size="sm" onClick={resolve} disabled={loading}>
          {loading ? "…" : "Mark Resolved"}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
