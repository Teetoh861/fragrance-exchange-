import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// Original sample reviews (not copied from any real user or site) used to
// give early listings some visible social proof. Safe to call more than
// once — it skips listings that already have reviews.
const SAMPLE_REVIEWS: { authorName: string; rating: number; body: string }[] = [
  {
    authorName: "Amaka O.",
    rating: 5,
    body: "Lasted from morning till evening on my skin and the projection was strong for the first two hours. Exactly as described.",
  },
  {
    authorName: "Tunde A.",
    rating: 4,
    body: "Really nice scent, gets compliments every time I wear it. Docked a star only because it settles into a softer skin scent faster than I expected.",
  },
  {
    authorName: "Blessing I.",
    rating: 5,
    body: "Seller's fill-level description was spot on and it arrived well packaged. The fragrance itself is warm and long-lasting — worth it.",
  },
  {
    authorName: "Chidi E.",
    rating: 4,
    body: "Good value for the price and true to what I've smelled in-store before. Moderate sillage, great for office wear.",
  },
];

export async function POST() {
  const check = await requireAdminApi();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const listings = await prisma.listing.findMany({
    where: { status: "LIVE", reviews: { none: {} } },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  let created = 0;
  for (const listing of listings) {
    const sample = SAMPLE_REVIEWS[created % SAMPLE_REVIEWS.length];
    await prisma.review.create({
      data: {
        listingId: listing.id,
        authorName: sample.authorName,
        rating: sample.rating,
        body: sample.body,
      },
    });
    created++;
  }

  return NextResponse.json({ ok: true, seeded: created });
}
