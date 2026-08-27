import Image from "next/image";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ConfirmPayButton } from "@/components/ConfirmPayButton";
import { ESCROW_DISCLAIMER, UNBOXING_VIDEO_THRESHOLD } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ offerId?: string }>;
}) {
  const { id } = await params;
  const { offerId } = await searchParams;
  const user = await requireUser();

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { photos: { take: 1 }, seller: { select: { name: true } } },
  });
  if (!listing) notFound();
  if (listing.sellerId === user.id) notFound();

  let price = listing.price;

  if (offerId) {
    const offer = await prisma.priceOffer.findUnique({ where: { id: offerId } });
    if (
      !offer ||
      offer.listingId !== id ||
      offer.buyerId !== user.id ||
      offer.status !== "ACCEPTED" ||
      listing.status !== "RESERVED"
    ) {
      notFound();
    }
    price = offer.offerPrice;
  } else if (listing.status !== "LIVE") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Confirm your purchase</h1>

      <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        {listing.photos[0] && (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
            <Image src={listing.photos[0].url} alt="" fill className="object-cover" />
          </div>
        )}
        <div>
          <p className="font-semibold text-stone-900">
            {listing.brand} — {listing.fragranceName}
          </p>
          <p className="text-sm text-muted">Sold by {listing.seller.name}</p>
          {offerId && (
            <p className="mt-1 text-xs text-emerald-700">
              Accepted offer price (listed at {formatNaira(listing.price)})
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <span className="text-sm text-muted">Total to pay</span>
        <span className="text-2xl font-bold text-stone-900">{formatNaira(price)}</span>
      </div>

      <div className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        <p className="mb-1 font-medium">Before you pay</p>
        <p>{ESCROW_DISCLAIMER}</p>
        {price >= UNBOXING_VIDEO_THRESHOLD && (
          <p className="mt-2">
            This order is above {formatNaira(UNBOXING_VIDEO_THRESHOLD)} — we strongly recommend
            recording an unboxing video before opening the package when it arrives.
          </p>
        )}
      </div>

      <ConfirmPayButton listingId={listing.id} offerId={offerId} />
    </div>
  );
}
