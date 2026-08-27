import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuyNowButton } from "@/components/BuyNowButton";
import {
  CATEGORY_LABELS,
  CONCENTRATION_LABELS,
  CONDITION_LABELS,
  GENDER_LABELS,
  PHOTO_TYPE_LABELS,
  PURCHASE_SOURCE_LABELS,
} from "@/lib/constants";
import { formatDate, formatNaira } from "@/lib/utils";

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { id } = await params;
  const { submitted } = await searchParams;
  const session = await auth();

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      photos: true,
      seller: {
        select: {
          id: true,
          name: true,
          joinDate: true,
          transactionCount: true,
        },
      },
    },
  });

  if (!listing) notFound();

  const isOwner = session?.user.id === listing.sellerId;
  const isPubliclyVisible = listing.status === "LIVE";

  if (!isPubliclyVisible && !isOwner && session?.user.role !== "ADMIN") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {submitted && (
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Listing submitted! It&apos;s now <strong>Pending Review</strong> — our team will approve
          or reject the photos before it goes live.
        </p>
      )}
      {!isPubliclyVisible && (isOwner || session?.user.role === "ADMIN") && (
        <p className="mb-6 rounded-lg bg-stone-100 px-4 py-3 text-sm text-stone-700">
          Status: <strong>{listing.status.replace("_", " ")}</strong> — only visible to you and
          admins right now.
        </p>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="grid grid-cols-2 gap-2">
            {listing.photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg bg-stone-100">
                <Image src={photo.url} alt={PHOTO_TYPE_LABELS[photo.photoType]} fill className="object-cover" />
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  {PHOTO_TYPE_LABELS[photo.photoType]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone="neutral">{CATEGORY_LABELS[listing.category]}</Badge>
            <Badge tone="neutral">{GENDER_LABELS[listing.gender]}</Badge>
            {listing.swapEnabled && <Badge tone="blue">Swap available</Badge>}
          </div>

          <h1 className="text-2xl font-bold text-stone-900">{listing.brand}</h1>
          <p className="text-lg text-muted">{listing.fragranceName}</p>

          <p className="mt-4 text-3xl font-bold text-stone-900">{formatNaira(listing.price)}</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">Concentration</dt>
            <dd className="font-medium">{CONCENTRATION_LABELS[listing.concentration]}</dd>
            <dt className="text-muted">Bottle size</dt>
            <dd className="font-medium">{listing.sizeMl} ml</dd>
            <dt className="text-muted">Fill level</dt>
            <dd className="font-medium">{listing.fillLevel}%+</dd>
            <dt className="text-muted">Condition</dt>
            <dd className="font-medium">{CONDITION_LABELS[listing.condition]}</dd>
            <dt className="text-muted">Purchase source</dt>
            <dd className="font-medium">{PURCHASE_SOURCE_LABELS[listing.purchaseSource]}</dd>
          </dl>

          {listing.swapEnabled && listing.desiredFragrances && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
              <strong>Looking to swap for:</strong> {listing.desiredFragrances}
              {listing.cashTopupOk && " · open to a cash top-up"}
            </div>
          )}

          <div className="mt-6 rounded-lg border border-border p-3 text-sm">
            <p className="font-medium text-stone-800">{listing.seller.name}</p>
            <p className="text-muted">
              Joined {formatDate(listing.seller.joinDate)} · {listing.seller.transactionCount}{" "}
              completed transaction{listing.seller.transactionCount === 1 ? "" : "s"}
            </p>
          </div>

          {isPubliclyVisible && !isOwner && (
            <div className="mt-6 space-y-2">
              <BuyNowButton listingId={listing.id} loggedIn={Boolean(session?.user)} />
              {listing.swapEnabled && (
                <Link href={session ? `/listings/${listing.id}/propose-swap` : `/login?callbackUrl=/listings/${listing.id}/propose-swap`}>
                  <Button variant="outline" size="lg" className="w-full">
                    Propose Swap
                  </Button>
                </Link>
              )}
            </div>
          )}

          <p className="mt-6 text-xs text-muted">
            Listings are photo-reviewed by our team, not physically authenticated. See the trust
            &amp; safety notes in the site footer for more.
          </p>
        </div>
      </div>
    </div>
  );
}
