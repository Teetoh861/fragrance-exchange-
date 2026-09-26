import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyOfferDeclined } from "@/lib/email";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const offer = await prisma.priceOffer.findUnique({
    where: { id },
    include: { listing: true, buyer: { select: { email: true, name: true } } },
  });
  if (!offer) return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  if (offer.listing.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Only the listing owner can decline this offer." }, { status: 403 });
  }
  if (offer.status !== "PENDING") {
    return NextResponse.json({ error: "This offer has already been decided." }, { status: 400 });
  }

  await prisma.priceOffer.update({ where: { id }, data: { status: "DECLINED" } });

  await notifyOfferDeclined({
    buyerEmail: offer.buyer.email,
    buyerName: offer.buyer.name,
    brand: offer.listing.brand,
    fragranceName: offer.listing.fragranceName,
    listingId: offer.listingId,
    origin: new URL(req.url).origin,
  });

  return NextResponse.json({ ok: true });
}
