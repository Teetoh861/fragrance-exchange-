import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const listings = await prisma.listing.findMany({
    where: { status: "LIVE" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { photos: true },
  });

  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-amber-50 to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            Buy, sell, and swap the fragrances you actually love
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
            A marketplace for niche, designer, and Arabian fragrances — from people who don&apos;t
            wear them anymore, to people who will.
          </p>
          <form action="/browse" className="mx-auto mt-8 flex max-w-lg gap-2">
            <input
              name="q"
              placeholder="Search brand or fragrance name…"
              className="h-12 flex-1 rounded-lg border border-border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button type="submit" size="lg">
              Search
            </Button>
          </form>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/browse">
              <Button variant="outline">Browse listings</Button>
            </Link>
            <Link href="/listings/new">
              <Button>List your perfume</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">Recently listed</h2>
          <Link href="/browse" className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>

        {listings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
            No live listings yet — be the first to list a fragrance.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
