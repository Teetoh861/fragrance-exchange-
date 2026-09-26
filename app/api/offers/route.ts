import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyNewOffer } from "@/lib/email";

const schema = z.object({
  listingId: z.string().min(1),
  offerPrice: z.coerce.number().int().min(500).max(50_000_000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid offer." }, { status: 400 });
  }
  const { listingId, offerPrice } = parsed.data;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: { select: { email: true, name: true } } },
  });
  if (!listing || listing.status !== "LIVE" || !listing.negotiable) {
    return NextResponse.json({ error: "This listing isn't open to offers right now." }, { status: 400 });
  }
  if (listing.sellerId === session.user.id) {
    return NextResponse.json({ error: "You can't make an offer on your own listing." }, { status: 400 });
  }

  const offer = await prisma.priceOffer.create({
    data: {
      listingId,
      buyerId: session.user.id,
      offerPrice,
      status: "PENDING",
    },
  });

  await notifyNewOffer({
    sellerEmail: listing.seller.email,
    sellerName: listing.seller.name,
    buyerName: session.user.name ?? "A buyer",
    brand: listing.brand,
    fragranceName: listing.fragranceName,
    offerPrice,
    offerId: offer.id,
    origin: new URL(req.url).origin,
  });

  return NextResponse.json({ ok: true, id: offer.id });
}
