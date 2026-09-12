import { Prisma } from "@prisma/client";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/ReviewForm";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await auth();

  const where: Prisma.ReviewWhereInput = q
    ? {
        OR: [
          { brand: { contains: q } },
          { fragranceName: { contains: q } },
        ],
      }
    : {};

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-stone-900">Perfume Reviews &amp; Recommendations</h1>
      <p className="mb-6 text-sm text-muted">
        Real feedback and layering tips from people who&apos;ve actually worn these fragrances —
        so you can avoid a blind buy before spending your money.
      </p>

      <form className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search a brand or fragrance…"
          className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
        />
        <Button type="submit">Search</Button>
        {q && (
          <Link href="/reviews">
            <Button variant="outline">Clear</Button>
          </Link>
        )}
      </form>

      {session?.user ? (
        <div className="mb-8">
          <ReviewForm />
        </div>
      ) : (
        <p className="mb-8 text-sm text-muted">
          <Link href="/login?callbackUrl=/reviews" className="underline">
            Log in
          </Link>{" "}
          to share your own review or layering tip.
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          No reviews match that search yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-lg border border-border p-4">
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
