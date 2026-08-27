import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceOfferActions } from "@/components/PriceOfferActions";
import { formatNaira } from "@/lib/utils";

export default async function PriceOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const offer = await prisma.priceOffer.findUnique({
    where: { id },
    include: { listing: true, buyer: true },
  });
  if (!offer) notFound();

  const isSeller = offer.listing.sellerId === user.id;
  const isBuyer = offer.buyerId === user.id;
  if (!isSeller && !isBuyer) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Price Offer</h1>

      <div className="mb-6 flex items-center justify-between text-sm">
        <span className="text-muted">Status</span>
        <Badge tone={statusTone(offer.status)}>{offer.status}</Badge>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <Link href={`/listings/${offer.listing.id}`} className="font-medium text-stone-900 hover:underline">
          {offer.listing.brand} — {offer.listing.fragranceName}
        </Link>
        <p className="mt-1 text-sm text-muted">Listed at {formatNaira(offer.listing.price)}</p>
        <p className="mt-2 text-2xl font-bold text-stone-900">{formatNaira(offer.offerPrice)}</p>
        <p className="text-xs text-muted">
          Offered by {isBuyer ? "you" : offer.buyer.name}
        </p>
      </div>

      {offer.status === "PENDING" && isSeller && <PriceOfferActions offerId={offer.id} />}
      {offer.status === "PENDING" && isBuyer && (
        <p className="text-sm text-muted">Waiting for the seller to respond.</p>
      )}

      {offer.status === "ACCEPTED" && isBuyer && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="mb-3 font-medium">Offer accepted — proceed to payment.</p>
          <Link href={`/listings/${offer.listing.id}/checkout?offerId=${offer.id}`}>
            <Button className="w-full">Pay {formatNaira(offer.offerPrice)}</Button>
          </Link>
        </div>
      )}
      {offer.status === "ACCEPTED" && isSeller && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Offer accepted — the listing is reserved for the buyer to complete payment.
        </p>
      )}

      {offer.status === "DECLINED" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          This offer was declined.
        </p>
      )}
    </div>
  );
}
