import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  GENDER_LABELS,
} from "@/lib/constants";

type SearchParams = {
  q?: string;
  brand?: string;
  category?: string;
  gender?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  mode?: "sale" | "swap" | "both";
  sort?: "newest" | "price_asc" | "price_desc";
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const where: Prisma.ListingWhereInput = { status: "LIVE" };

  if (params.q) {
    where.OR = [
      { brand: { contains: params.q } },
      { fragranceName: { contains: params.q } },
    ];
  }
  if (params.brand) where.brand = { contains: params.brand };
  if (params.category) where.category = params.category as never;
  if (params.gender) where.gender = params.gender as never;
  if (params.condition) where.condition = params.condition as never;
  if (params.mode === "swap") where.swapEnabled = true;

  if (params.minPrice || params.maxPrice) {
    where.price = {
      ...(params.minPrice ? { gte: Number(params.minPrice) } : {}),
      ...(params.maxPrice ? { lte: Number(params.maxPrice) } : {}),
    };
  }

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    params.sort === "price_asc"
      ? { price: "asc" }
      : params.sort === "price_desc"
      ? { price: "desc" }
      : { createdAt: "desc" };

  const listings = await prisma.listing.findMany({
    where,
    orderBy,
    include: { photos: true },
    take: 60,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Browse fragrances</h1>

      <form className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3 md:grid-cols-6">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search…"
          className="col-span-2 h-10 rounded-lg border border-border bg-background px-3 text-sm sm:col-span-1 md:col-span-2"
        />
        <input
          name="brand"
          defaultValue={params.brand}
          placeholder="Brand"
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        />
        <Select name="category" defaultValue={params.category ?? ""}>
          <option value="">Any category</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Select name="gender" defaultValue={params.gender ?? ""}>
          <option value="">Any gender</option>
          {Object.entries(GENDER_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Select name="condition" defaultValue={params.condition ?? ""}>
          <option value="">Any condition</option>
          {Object.entries(CONDITION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Select name="mode" defaultValue={params.mode ?? ""}>
          <option value="">Sale or swap</option>
          <option value="sale">For sale</option>
          <option value="swap">Open to swap</option>
        </Select>
        <input
          name="minPrice"
          type="number"
          defaultValue={params.minPrice}
          placeholder="Min ₦"
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        />
        <input
          name="maxPrice"
          type="number"
          defaultValue={params.maxPrice}
          placeholder="Max ₦"
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        />
        <Select name="sort" defaultValue={params.sort ?? "newest"}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </Select>
        <Button type="submit" className="col-span-2 sm:col-span-1">
          Apply
        </Button>
      </form>

      {listings.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          No listings match your filters yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
