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
  if (!listingId) {
    return NextResponse.json({ error: "Missing listing." }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "LIVE") {
    return NextResponse.json({ error: "This listing is no longer available." }, { status: 400 });
  }
  if (listing.sellerId === session.user.id) {
    return NextResponse.json({ error: "You can't buy your own listing." }, { status: 400 });
  }

  const reference = `fx_${randomUUID()}`;
  const origin = new URL(req.url).origin;

  // Reserve the listing immediately so it can't be double-sold while payment is in flight.
  await prisma.listing.update({ where: { id: listing.id }, data: { status: "RESERVED" } });

  if (!paystackEnabled()) {
    // Dev/demo mode: no Paystack keys configured, simulate an instant successful payment.
    const order = await prisma.order.create({
      data: {
        listingId: listing.id,
        buyerId: session.user.id,
        sellerId: listing.sellerId,
        type: "PURCHASE",
        pricePaid: listing.price,
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
      amountNaira: listing.price,
      reference,
      callbackUrl: `${origin}/api/checkout/callback`,
      metadata: { listingId: listing.id, buyerId: session.user.id, type: "PURCHASE" },
    });
    return NextResponse.json({ authorizationUrl: tx.authorization_url });
  } catch (err) {
    await prisma.listing.update({ where: { id: listing.id }, data: { status: "LIVE" } });
    const message = err instanceof Error ? err.message : "Failed to start checkout.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
