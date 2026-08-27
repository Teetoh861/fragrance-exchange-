import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const offer = await prisma.priceOffer.findUnique({ where: { id }, include: { listing: true } });
  if (!offer) return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  if (offer.listing.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Only the listing owner can accept this offer." }, { status: 403 });
  }
  if (offer.status !== "PENDING" || offer.listing.status !== "LIVE") {
    return NextResponse.json({ error: "This offer can't be accepted right now." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.priceOffer.update({ where: { id }, data: { status: "ACCEPTED" } }),
    prisma.priceOffer.updateMany({
      where: { listingId: offer.listingId, status: "PENDING", NOT: { id } },
      data: { status: "DECLINED" },
    }),
    prisma.listing.update({ where: { id: offer.listingId }, data: { status: "RESERVED" } }),
  ]);

  return NextResponse.json({ ok: true });
}
