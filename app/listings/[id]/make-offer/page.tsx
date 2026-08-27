import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { MakeOfferForm } from "@/components/MakeOfferForm";
import { formatNaira } from "@/lib/utils";

export default async function MakeOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.status !== "LIVE" || !listing.negotiable) notFound();
  if (listing.sellerId === user.id) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-stone-900">
        Make an offer on {listing.brand} — {listing.fragranceName}
      </h1>
      <p className="mb-6 text-sm text-muted">
        Listed at {formatNaira(listing.price)}. Propose a price — the seller can accept, decline,
        or you can offer again.
      </p>
      <MakeOfferForm listingId={listing.id} listedPrice={listing.price} />
    </div>
  );
}
