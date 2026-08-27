import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProposeSwapForm } from "@/components/ProposeSwapForm";

export default async function ProposeSwapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.status !== "LIVE" || !listing.swapEnabled) notFound();
  if (listing.sellerId === user.id) notFound();

  const myListings = await prisma.listing.findMany({
    where: { sellerId: user.id, status: "LIVE" },
    include: { photos: { take: 1 } },
  });

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-stone-900">
        Propose a swap for {listing.brand} — {listing.fragranceName}
      </h1>
      <p className="mb-6 text-sm text-muted">
        Offer one of your own live listings, with an optional cash top-up.
      </p>

      {myListings.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted">
          You don&apos;t have any live listings to offer yet.{" "}
          <Link href="/listings/new" className="font-medium text-primary">
            List one first
          </Link>
          .
        </p>
      ) : (
        <ProposeSwapForm listingId={listing.id} myListings={myListings} />
      )}
    </div>
  );
}
