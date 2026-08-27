import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  listingId: z.string().min(1),
  offeredListingId: z.string().min(1),
  cashTopupAmount: z.coerce.number().int().min(0).max(50_000_000).default(0),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid swap proposal." }, { status: 400 });
  }
  const { listingId, offeredListingId, cashTopupAmount } = parsed.data;

  const [wanted, offered] = await Promise.all([
    prisma.listing.findUnique({ where: { id: listingId } }),
    prisma.listing.findUnique({ where: { id: offeredListingId } }),
  ]);

  if (!wanted || wanted.status !== "LIVE" || !wanted.swapEnabled) {
    return NextResponse.json({ error: "This listing isn't open to swaps right now." }, { status: 400 });
  }
  if (wanted.sellerId === session.user.id) {
    return NextResponse.json({ error: "You can't propose a swap on your own listing." }, { status: 400 });
  }
  if (!offered || offered.status !== "LIVE" || offered.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Choose one of your own live listings to offer." }, { status: 400 });
  }

  const swapOffer = await prisma.swapOffer.create({
    data: {
      listingId,
      offeredListingId,
      offererId: session.user.id,
      cashTopupAmount,
      cashTopupPayer: cashTopupAmount > 0 ? session.user.id : null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ ok: true, id: swapOffer.id });
}
