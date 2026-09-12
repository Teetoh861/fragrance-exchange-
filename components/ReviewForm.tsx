"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function ReviewForm() {
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
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand: form.get("brand"),
        fragranceName: form.get("fragranceName"),
        rating,
        body: form.get("body"),
      }),
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
    return <p className="text-sm text-emerald-700">Thanks — your review is now live for others to see.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-border p-4">
      <h3 className="font-semibold text-stone-900">Share a review or layering tip</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input id="brand" name="brand" required placeholder="e.g. Chanel" />
        </div>
        <div>
          <Label htmlFor="fragranceName">Fragrance name</Label>
          <Input id="fragranceName" name="fragranceName" required placeholder="e.g. Mademoiselle" />
        </div>
      </div>
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
        <Label htmlFor="body">Your review or tip</Label>
        <Textarea
          id="body"
          name="body"
          rows={3}
          maxLength={500}
          required
          placeholder="How does it wear? Any layering combos you'd recommend, so others avoid a blind buy?"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Posting…" : "Post review"}
      </Button>
    </form>
  );
}
