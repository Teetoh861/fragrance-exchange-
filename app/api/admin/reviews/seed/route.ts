import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// Original sample reviews/recommendations (not copied from any real user or
// site) used to give the standalone Reviews page some visible content
// before real users start posting. Not tied to any listing.
const SAMPLE_REVIEWS: {
  brand: string;
  fragranceName: string;
  authorName: string;
  rating: number;
  body: string;
}[] = [
  {
    brand: "Chanel",
    fragranceName: "Mademoiselle",
    authorName: "Amaka O.",
    rating: 5,
    body: "Lasted from morning till evening on my skin and the projection was strong for the first two hours. One of the safest blind-buys out there.",
  },
  {
    brand: "Burberry",
    fragranceName: "Her Goddess",
    authorName: "Tunde A.",
    rating: 4,
    body: "Really nice scent, gets compliments every time I wear it. Docked a star only because it settles into a softer skin scent faster than I expected.",
  },
  {
    brand: "Yves Saint Laurent",
    fragranceName: "Libre",
    authorName: "Blessing I.",
    rating: 5,
    body: "Exactly what I smelled in-store before buying — warm and long-lasting. Great for anyone nervous about ordering perfume online.",
  },
  {
    brand: "Dior",
    fragranceName: "Sauvage",
    authorName: "Chidi E.",
    rating: 4,
    body: "Good value for the price and true to what I've smelled in-store before. Moderate sillage, great for office wear.",
  },
  {
    brand: "Chanel",
    fragranceName: "Mademoiselle",
    authorName: "Ngozi F.",
    rating: 5,
    body: "Tip of the day: layer this with Burberry Her Goddess — it's always the bomb. Compliments guaranteed.",
  },
  {
    brand: "Creed",
    fragranceName: "Queen of Silk",
    authorName: "Emeka N.",
    rating: 5,
    body: "One of my best combos ever: this layered with a touch of Hermès Barénia. Try it before a night out, you won't regret it.",
  },
  {
    brand: "Hermès",
    fragranceName: "Twilly d'Hermès",
    authorName: "Fatima B.",
    rating: 4,
    body: "Tip: moisturize your skin with an unscented body cream before applying so it holds longer. This one pairs really well with Versace Dylan Purple if you like layering.",
  },
  {
    brand: "Versace",
    fragranceName: "Dylan Purple",
    authorName: "Kelechi U.",
    rating: 5,
    body: "Beautiful on its own, don't even need to layer it. Opens strong for the first hour then settles into something softer and more intimate — great for date nights.",
  },
];

export async function POST() {
  const check = await requireAdminApi();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const existingCount = await prisma.review.count();
  if (existingCount > 0) {
    return NextResponse.json({ ok: true, seeded: 0 });
  }

  await prisma.review.createMany({
    data: SAMPLE_REVIEWS.map((r) => ({
      brand: r.brand,
      fragranceName: r.fragranceName,
      authorName: r.authorName,
      rating: r.rating,
      body: r.body,
    })),
  });

  return NextResponse.json({ ok: true, seeded: SAMPLE_REVIEWS.length });
}
