import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function Home() {
  const [listings, reviews] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "LIVE" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { photos: true },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

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
          <div className="mt-6 flex flex-wrap justify-center gap-3">
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

      <section className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900">Perfume reviews &amp; recommendations</h2>
            <Link href="/reviews" className="text-sm font-medium text-primary">
              View all
            </Link>
          </div>
          <p className="mb-6 text-sm text-muted">
            Real feedback and layering tips, so you can avoid a blind buy before you spend your
            money.
          </p>

          {reviews.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
              No reviews yet —{" "}
              <Link href="/reviews" className="underline">
                be the first to share one
              </Link>
              .
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-stone-900">
                      {review.brand} — {review.fragranceName}
                    </p>
                    <p className="text-amber-500">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-stone-700">{review.body}</p>
                  <p className="mt-2 text-xs text-muted">
                    {review.authorName} · {formatDate(review.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
