"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";

export function ReviewForm({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/listings/${listingId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, body: form.get("body") }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to post review.");
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return <p className="text-sm text-emerald-700">Thanks for your review!</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-border p-3">
      <div>
        <Label>Your rating</Label>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              className={`text-2xl leading-none ${n <= rating ? "text-amber-500" : "text-stone-300"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="body">Your review</Label>
        <Textarea id="body" name="body" rows={3} maxLength={500} required placeholder="How does it wear, longevity, projection…" />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Posting…" : "Post review"}
      </Button>
    </form>
  );
}
