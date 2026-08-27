import { prisma } from "@/lib/prisma";

/**
 * Finalizes an accepted swap: reserves both listings and creates one Order
 * per direction so each side can independently ship and confirm receipt
 * through the same flow used for a straight purchase.
 */
export async function finalizeSwap(swapOfferId: string) {
  const offer = await prisma.swapOffer.findUniqueOrThrow({
    where: { id: swapOfferId },
    include: { listing: true, offeredListing: true },
  });

  const ownerId = offer.listing.sellerId;
  const offererId = offer.offererId;

  await prisma.$transaction([
    prisma.listing.update({ where: { id: offer.listingId }, data: { status: "RESERVED" } }),
    prisma.listing.update({ where: { id: offer.offeredListingId }, data: { status: "RESERVED" } }),
    prisma.order.create({
      data: {
        listingId: offer.listingId,
        buyerId: offererId,
        sellerId: ownerId,
        type: "SWAP",
        pricePaid: 0,
        status: "PAID",
      },
    }),
    prisma.order.create({
      data: {
        listingId: offer.offeredListingId,
        buyerId: ownerId,
        sellerId: offererId,
        type: "SWAP",
        pricePaid: 0,
        status: "PAID",
      },
    }),
  ]);
}
