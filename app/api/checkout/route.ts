import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializePaystackTransaction, paystackEnabled } from "@/lib/paystack";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const listingId = body?.listingId as string | undefined;
  const offerId = body?.offerId as string | undefined;
  if (!listingId) {
    return NextResponse.json({ error: "Missing listing." }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "This listing is no longer available." }, { status: 400 });
  }
  if (listing.sellerId === session.user.id) {
    return NextResponse.json({ error: "You can't buy your own listing." }, { status: 400 });
  }

  let price = listing.price;

  if (offerId) {
    const offer = await prisma.priceOffer.findUnique({ where: { id: offerId } });
    if (
      !offer ||
      offer.listingId !== listingId ||
      offer.buyerId !== session.user.id ||
      offer.status !== "ACCEPTED"
    ) {
      return NextResponse.json({ error: "This offer isn't available to check out." }, { status: 400 });
    }
    if (listing.status !== "RESERVED") {
      return NextResponse.json({ error: "This listing is no longer available." }, { status: 400 });
    }
    price = offer.offerPrice;
  } else {
    if (listing.status !== "LIVE") {
      return NextResponse.json({ error: "This listing is no longer available." }, { status: 400 });
    }
    // Reserve the listing immediately so it can't be double-sold while payment is in flight.
    await prisma.listing.update({ where: { id: listing.id }, data: { status: "RESERVED" } });
  }

  const reference = `fx_${randomUUID()}`;
  const origin = new URL(req.url).origin;

  if (!paystackEnabled()) {
    // Dev/demo mode: no Paystack keys configured, simulate an instant successful payment.
    const order = await prisma.order.create({
      data: {
        listingId: listing.id,
        buyerId: session.user.id,
        sellerId: listing.sellerId,
        type: "PURCHASE",
        pricePaid: price,
        status: "PAID",
        paystackRef: reference,
      },
    });
    await prisma.listing.update({ where: { id: listing.id }, data: { status: "SOLD" } });
    return NextResponse.json({ mock: true, orderId: order.id });
  }

  try {
    const tx = await initializePaystackTransaction({
      email: session.user.email as string,
      amountNaira: price,
      reference,
      callbackUrl: `${origin}/api/checkout/callback`,
      metadata: { listingId: listing.id, buyerId: session.user.id, offerId, type: "PURCHASE" },
    });
    return NextResponse.json({ authorizationUrl: tx.authorization_url });
  } catch (err) {
    if (!offerId) {
      await prisma.listing.update({ where: { id: listing.id }, data: { status: "LIVE" } });
    }
    const message = err instanceof Error ? err.message : "Failed to start checkout.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
