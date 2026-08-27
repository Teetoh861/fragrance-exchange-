import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { CONDITION_LABELS } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";

type CardListing = {
  id: string;
  brand: string;
  fragranceName: string;
  price: number;
  condition: string;
  swapEnabled: boolean;
  status: string;
  photos: { url: string }[];
};

export function ListingCard({ listing }: { listing: CardListing }) {
  const photo = listing.photos[0]?.url;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
        {photo ? (
          <Image
            src={photo}
            alt={`${listing.brand} ${listing.fragranceName}`}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">No photo</div>
        )}
        {listing.swapEnabled && (
          <Badge tone="blue" className="absolute left-2 top-2">
            Swap available
          </Badge>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-stone-900">{listing.brand}</p>
        <p className="truncate text-sm text-muted">{listing.fragranceName}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-stone-900">{formatNaira(listing.price)}</span>
          <Badge tone="neutral">{CONDITION_LABELS[listing.condition]}</Badge>
        </div>
      </div>
    </Link>
  );
}
