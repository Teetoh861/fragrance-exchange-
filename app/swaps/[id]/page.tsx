import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Badge, statusTone } from "@/components/ui/badge";
import { SwapOfferActions, PayTopupButton } from "@/components/SwapOfferActions";
import { formatNaira } from "@/lib/utils";

export default async function SwapOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const offer = await prisma.swapOffer.findUnique({
    where: { id },
    include: { listing: true, offeredListing: true, offerer: true },
  });
  if (!offer) notFound();

  const isOwner = offer.listing.sellerId === user.id;
  const isOfferer = offer.offererId === user.id;
  if (!isOwner && !isOfferer) notFound();

  const orders = await prisma.order.findMany({
    where: {
      type: "SWAP",
      OR: [{ listingId: offer.listingId }, { listingId: offer.offeredListingId }],
    },
  });

  const payerOwesTopup =
    offer.cashTopupAmount > 0 && !offer.cashPaid && offer.cashTopupPayer === user.id;

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Swap Proposal</h1>

      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-muted">Status</span>
        <Badge tone={statusTone(offer.status)}>{offer.status}</Badge>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted">Wants (owner&apos;s listing)</p>
          <Link href={`/listings/${offer.listing.id}`} className="font-medium text-stone-900 hover:underline">
            {offer.listing.brand} — {offer.listing.fragranceName}
          </Link>
          <p className="text-sm text-muted">{formatNaira(offer.listing.price)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted">Offered by {offer.offerer.name}</p>
          <Link href={`/listings/${offer.offeredListing.id}`} className="font-medium text-stone-900 hover:underline">
            {offer.offeredListing.brand} — {offer.offeredListing.fragranceName}
          </Link>
          <p className="text-sm text-muted">{formatNaira(offer.offeredListing.price)}</p>
        </div>
      </div>

      {offer.cashTopupAmount > 0 && (
        <p className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
          Cash top-up: {formatNaira(offer.cashTopupAmount)} —{" "}
          {offer.cashPaid ? "paid" : "not yet paid"}
        </p>
      )}

      {offer.status === "PENDING" && isOwner && <SwapOfferActions swapId={offer.id} />}
      {offer.status === "PENDING" && isOfferer && (
        <p className="text-sm text-muted">Waiting for {offer.listing.sellerId === offer.offererId ? "" : "the listing owner"} to respond.</p>
      )}

      {offer.status === "ACCEPTED" && payerOwesTopup && <PayTopupButton swapId={offer.id} />}

      {offer.status === "ACCEPTED" && (offer.cashTopupAmount === 0 || offer.cashPaid) && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="mb-2 font-medium">Swap accepted — both items are reserved.</p>
          <p className="mb-3">
            Each side ships their item and confirms receipt independently, just like a regular
            order.
          </p>
          <div className="space-y-1">
            {orders.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`} className="block underline">
                View shipment {o.id.slice(0, 8)} →
              </Link>
            ))}
          </div>
        </div>
      )}

      {offer.status === "DECLINED" && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          This swap proposal was declined.
        </p>
      )}
    </div>
  );
}
