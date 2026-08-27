"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { uploadPhoto } from "@/lib/client-upload";
import {
  BRAND_SUGGESTIONS,
  CATEGORY_LABELS,
  CONCENTRATION_LABELS,
  CONDITION_LABELS,
  FILL_LEVEL_SUGGESTIONS,
  GENDER_LABELS,
  PURCHASE_SOURCE_LABELS,
  REQUIRED_PHOTO_TYPES,
  PHOTO_TYPE_LABELS,
  SIZE_ML_SUGGESTIONS,
} from "@/lib/constants";

const ALL_PHOTO_TYPES = [...REQUIRED_PHOTO_TYPES, "BOX"] as const;

export default function NewListingPage() {
  const router = useRouter();
  const [swapEnabled, setSwapEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    for (const type of REQUIRED_PHOTO_TYPES) {
      const file = formData.get(`photo_${type}`) as File | null;
      if (!file || file.size === 0) {
        setError(`Please upload a ${PHOTO_TYPE_LABELS[type]} photo.`);
        return;
      }
    }

    setLoading(true);

    try {
      const photos: { url: string; photoType: string }[] = [];
      for (const type of ALL_PHOTO_TYPES) {
        const file = formData.get(`photo_${type}`) as File | null;
        if (!file || file.size === 0) continue;
        setUploadStatus(`Uploading ${PHOTO_TYPE_LABELS[type]} photo…`);
        const url = await uploadPhoto(file);
        photos.push({ url, photoType: type });
      }

      setUploadStatus("Submitting listing…");
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: formData.get("brand"),
          fragranceName: formData.get("fragranceName"),
          category: formData.get("category"),
          gender: formData.get("gender"),
          concentration: formData.get("concentration"),
          sizeMl: formData.get("sizeMl"),
          fillLevel: formData.get("fillLevel"),
          condition: formData.get("condition"),
          purchaseSource: formData.get("purchaseSource"),
          price: formData.get("price"),
          marketPrice: formData.get("marketPrice") || undefined,
          negotiable: formData.get("negotiable") === "on",
          swapEnabled: formData.get("swapEnabled") === "on",
          desiredFragrances: formData.get("desiredFragrances") ?? undefined,
          cashTopupOk: formData.get("cashTopupOk") === "on",
          photos,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to submit listing.");
        return;
      }

      router.push(`/listings/${data.id}?submitted=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit listing.");
    } finally {
      setLoading(false);
      setUploadStatus(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-stone-900">List your perfume</h1>
      <p className="mb-6 text-sm text-muted">
        Your listing goes to <strong>Pending Review</strong> and won&apos;t be visible publicly
        until our team approves the photos.
      </p>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" name="brand" list="brand-suggestions" required maxLength={80} />
            <datalist id="brand-suggestions">
              {BRAND_SUGGESTIONS.map((brand) => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
          </div>
          <div>
            <Label htmlFor="fragranceName">Fragrance name</Label>
            <Input id="fragranceName" name="fragranceName" required maxLength={120} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" name="category" required defaultValue="">
              <option value="" disabled>
                Select
              </option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select id="gender" name="gender" required defaultValue="UNISEX">
              {Object.entries(GENDER_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="concentration">Concentration</Label>
            <Select id="concentration" name="concentration" required defaultValue="">
              <option value="" disabled>
                Select
              </option>
              {Object.entries(CONCENTRATION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="sizeMl">Bottle size (ml)</Label>
            <Input
              id="sizeMl"
              name="sizeMl"
              type="number"
              list="size-ml-suggestions"
              min={1}
              max={2000}
              required
            />
            <datalist id="size-ml-suggestions">
              {SIZE_ML_SUGGESTIONS.map((size) => (
                <option key={size} value={size} />
              ))}
            </datalist>
          </div>
          <div>
            <Label htmlFor="fillLevel">Fill level (%)</Label>
            <Input
              id="fillLevel"
              name="fillLevel"
              type="number"
              list="fill-level-suggestions"
              min={1}
              max={100}
              required
            />
            <datalist id="fill-level-suggestions">
              {FILL_LEVEL_SUGGESTIONS.map((level) => (
                <option key={level} value={level} />
              ))}
            </datalist>
          </div>
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select id="condition" name="condition" required defaultValue="">
              <option value="" disabled>
                Select
              </option>
              {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchaseSource">Original purchase source</Label>
            <Select id="purchaseSource" name="purchaseSource" required defaultValue="">
              <option value="" disabled>
                Select
              </option>
              {Object.entries(PURCHASE_SOURCE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="marketPrice">Current market / retail price (₦, optional)</Label>
            <Input id="marketPrice" name="marketPrice" type="number" min={500} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Your asking price (₦)</Label>
            <Input id="price" name="price" type="number" min={500} required />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="negotiable" />
              Open to negotiation
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="swapEnabled"
              checked={swapEnabled}
              onChange={(e) => setSwapEnabled(e.target.checked)}
            />
            Open to swap
          </label>

          {swapEnabled && (
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="desiredFragrances">Desired fragrances / brands</Label>
                <Textarea
                  id="desiredFragrances"
                  name="desiredFragrances"
                  rows={2}
                  maxLength={500}
                  placeholder="e.g. Tom Ford Tobacco Vanille, Dior Sauvage, any Arabian oud…"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="cashTopupOk" />
                Willing to accept a cash top-up
              </label>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-3 text-sm font-medium text-stone-800">
            Photos <span className="text-muted">(front, back, base/batch code, and cap required)</span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {REQUIRED_PHOTO_TYPES.map((type) => (
              <div key={type}>
                <Label htmlFor={`photo_${type}`}>{PHOTO_TYPE_LABELS[type]}</Label>
                <input
                  id={`photo_${type}`}
                  name={`photo_${type}`}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  required
                  className="block w-full text-xs"
                />
              </div>
            ))}
            <div>
              <Label htmlFor="photo_BOX">Box (optional)</Label>
              <input
                id="photo_BOX"
                name="photo_BOX"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="block w-full text-xs"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? uploadStatus ?? "Submitting…" : "Submit for review"}
        </Button>
      </form>
    </div>
  );
}
