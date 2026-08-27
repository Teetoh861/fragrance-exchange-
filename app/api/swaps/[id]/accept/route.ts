import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { finalizeSwap } from "@/lib/swap";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const offer = await prisma.swapOffer.findUnique({
    where: { id },
    include: { listing: true },
  });
  if (!offer) return NextResponse.json({ error: "Swap offer not found." }, { status: 404 });
  if (offer.listing.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Only the listing owner can accept this offer." }, { status: 403 });
  }
  if (offer.status !== "PENDING") {
    return NextResponse.json({ error: "This offer has already been decided." }, { status: 400 });
  }

  await prisma.swapOffer.update({ where: { id }, data: { status: "ACCEPTED" } });

  if (offer.cashTopupAmount <= 0) {
    await finalizeSwap(id);
  }
  // If a cash top-up is owed, finalization happens after payment via
  // /api/swaps/[id]/pay-topup and its Paystack callback.

  return NextResponse.json({ ok: true });
}
