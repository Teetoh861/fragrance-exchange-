import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOwnBucketUrl } from "@/lib/storage";
import { REQUIRED_PHOTO_TYPES } from "@/lib/constants";

const photoSchema = z.object({
  url: z.string().url(),
  photoType: z.enum(["FRONT", "BACK", "BASE", "CAP", "BOX"]),
});

const listingSchema = z.object({
  brand: z.string().trim().min(1).max(80),
  fragranceName: z.string().trim().min(1).max(120),
  category: z.enum(["DESIGNER", "NICHE", "ARABIAN"]),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
  concentration: z.enum(["EDC", "EDT", "EDP", "PARFUM", "OIL", "OTHER"]),
  sizeMl: z.coerce.number().int().min(1).max(2000),
  fillLevel: z.coerce.number().int().min(1).max(100),
  condition: z.enum(["NEW", "LIKE_NEW", "USED_GOOD", "USED_HEAVY"]),
  purchaseSource: z.enum(["RETAIL", "GIFT", "OTHER"]),
  price: z.coerce.number().int().min(500).max(50_000_000),
  marketPrice: z.coerce.number().int().min(500).max(50_000_000).optional(),
  negotiable: z.coerce.boolean(),
  swapEnabled: z.coerce.boolean(),
  desiredFragrances: z.string().trim().max(500).optional(),
  cashTopupOk: z.coerce.boolean(),
  photos: z.array(photoSchema).min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your listing details.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Photos are uploaded directly to Neon Object Storage by the client (see
  // /api/uploads/presign); only accept URLs that actually landed in our
  // bucket, not arbitrary client-supplied URLs.
  if (parsed.data.photos.some((p) => !isOwnBucketUrl(p.url))) {
    return NextResponse.json({ error: "Invalid photo upload." }, { status: 400 });
  }

  const providedTypes = new Set(parsed.data.photos.map((p) => p.photoType));
  const missing = REQUIRED_PHOTO_TYPES.filter((t) => !providedTypes.has(t));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required photos: ${missing.join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const listing = await prisma.listing.create({
      data: {
        sellerId: session.user.id,
        brand: parsed.data.brand,
        fragranceName: parsed.data.fragranceName,
        category: parsed.data.category,
        gender: parsed.data.gender,
        concentration: parsed.data.concentration,
        sizeMl: parsed.data.sizeMl,
        fillLevel: parsed.data.fillLevel,
        condition: parsed.data.condition,
        purchaseSource: parsed.data.purchaseSource,
        price: parsed.data.price,
        marketPrice: parsed.data.marketPrice ?? null,
        negotiable: parsed.data.negotiable,
        swapEnabled: parsed.data.swapEnabled,
        desiredFragrances: parsed.data.swapEnabled ? parsed.data.desiredFragrances ?? null : null,
        cashTopupOk: parsed.data.swapEnabled ? parsed.data.cashTopupOk : false,
        status: "PENDING_REVIEW",
        photos: { create: parsed.data.photos },
      },
    });

    return NextResponse.json({ ok: true, id: listing.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create listing.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
