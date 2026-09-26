"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function FlagListingButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function flag() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/listings/${listingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "flag", note }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to flag listing.");
      return;
    }
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Flag as suspicious (admin)
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
      <label htmlFor="flag-note" className="font-medium text-amber-900">
        Why are you flagging this listing?
      </label>
      <input
        id="flag-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. suspected counterfeit, mismatched photos…"
        className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
      />
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="danger" onClick={flag} disabled={loading}>
          {loading ? "Flagging…" : "Confirm flag"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
