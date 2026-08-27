import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Badge, statusTone } from "@/components/ui/badge";
import {
  LISTING_STATUS_LABELS,
  ORDER_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate, formatNaira } from "@/lib/utils";

export default async function AccountPage() {
  const user = await requireUser();

  const [profile, listings, ordersAsBuyer, ordersAsSeller, swapOffers] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
    prisma.listing.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { photos: { take: 1 } },
    }),
    prisma.order.findMany({
      where: { buyerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { listing: true },
    }),
    prisma.order.findMany({
      where: { sellerId: user.id },
      orderBy: { createdAt: "desc" },
      include: { listing: true },
    }),
    prisma.swapOffer.findMany({
      where: {
        OR: [{ offererId: user.id }, { listing: { sellerId: user.id } }],
      },
      orderBy: { createdAt: "desc" },
      include: { listing: true, offeredListing: true, offerer: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 rounded-xl border border-border bg-card p-4">
        <h1 className="text-xl font-bold text-stone-900">{profile.name}</h1>
        <p className="text-sm text-muted">
          Joined {formatDate(profile.joinDate)} · {profile.transactionCount} completed transaction
          {profile.transactionCount === 1 ? "" : "s"}
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">My Listings</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-muted">You haven&apos;t listed anything yet.</p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {listings.map((l) => (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-stone-50"
              >
                <span>
                  {l.brand} — {l.fragranceName}
                </span>
                <Badge tone={statusTone(l.status)}>{LISTING_STATUS_LABELS[l.status]}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">My Orders (as buyer)</h2>
        {ordersAsBuyer.length === 0 ? (
          <p className="text-sm text-muted">No purchases yet.</p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {ordersAsBuyer.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-stone-50"
              >
                <span>
                  {o.listing.brand} — {o.listing.fragranceName} · {formatNaira(o.pricePaid)}
                </span>
                <Badge tone={statusTone(o.status)}>{ORDER_STATUS_LABELS[o.status]}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">My Sales (as seller)</h2>
        {ordersAsSeller.length === 0 ? (
          <p className="text-sm text-muted">No sales yet.</p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {ordersAsSeller.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-stone-50"
              >
                <span>
                  {o.listing.brand} — {o.listing.fragranceName} · {formatNaira(o.pricePaid)}
                </span>
                <Badge tone={statusTone(o.status)}>{ORDER_STATUS_LABELS[o.status]}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-900">My Swap Offers</h2>
        {swapOffers.length === 0 ? (
          <p className="text-sm text-muted">No swap offers sent or received yet.</p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {swapOffers.map((s) => (
              <Link
                key={s.id}
                href={`/swaps/${s.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-stone-50"
              >
                <span>
                  {s.offererId === user.id ? "You offered" : `${s.offerer.name} offered`}{" "}
                  {s.offeredListing.brand} for {s.listing.brand}
                </span>
                <Badge tone={statusTone(s.status)}>{s.status}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
