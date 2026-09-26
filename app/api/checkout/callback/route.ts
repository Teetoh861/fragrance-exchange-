import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { notifyNewOrder } from "@/lib/email";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference") || url.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(new URL("/browse?error=missing_reference", url.origin));
  }

  const existing = await prisma.order.findFirst({ where: { paystackRef: reference } });
  if (existing) {
    return NextResponse.redirect(new URL(`/orders/${existing.id}`, url.origin));
  }

  try {
    const tx = await verifyPaystackTransaction(reference);
    if (tx.status !== "success") {
      return NextResponse.redirect(new URL("/browse?error=payment_failed", url.origin));
    }

    const metadata = tx.metadata as
      | { listingId: string; buyerId: string; offerId?: string; type: string }
      | undefined;

    if (!metadata?.listingId || !metadata?.buyerId) {
      return NextResponse.redirect(new URL("/browse?error=missing_metadata", url.origin));
    }

    const listing = await prisma.listing.findUnique({
      where: { id: metadata.listingId },
      include: { seller: { select: { email: true, name: true } } },
    });
    if (!listing) {
      return NextResponse.redirect(new URL("/browse?error=listing_not_found", url.origin));
    }

    const buyer = await prisma.user.findUnique({
      where: { id: metadata.buyerId },
      select: { name: true },
    });

    let pricePaid = listing.price;
    if (metadata.offerId) {
      const offer = await prisma.priceOffer.findUnique({ where: { id: metadata.offerId } });
      if (offer && offer.status === "ACCEPTED") {
        pricePaid = offer.offerPrice;
      }
    }

    const order = await prisma.order.create({
      data: {
        listingId: listing.id,
        buyerId: metadata.buyerId,
        sellerId: listing.sellerId,
        type: "PURCHASE",
        pricePaid,
        status: "PAID",
        paystackRef: reference,
      },
    });

    await prisma.listing.update({ where: { id: listing.id }, data: { status: "SOLD" } });

    await notifyNewOrder({
      sellerEmail: listing.seller.email,
      sellerName: listing.seller.name,
      buyerName: buyer?.name ?? "A buyer",
      brand: listing.brand,
      fragranceName: listing.fragranceName,
      pricePaid,
      orderId: order.id,
      origin: url.origin,
    });

    return NextResponse.redirect(new URL(`/orders/${order.id}`, url.origin));
  } catch {
    return NextResponse.redirect(new URL("/browse?error=verification_failed", url.origin));
  }
}
