import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Badge, statusTone } from "@/components/ui/badge";
import { ListingReviewRow } from "@/components/admin/ListingReviewRow";
import { DisputeRow } from "@/components/admin/DisputeRow";
import { PayoutRow } from "@/components/admin/PayoutRow";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatNaira } from "@/lib/utils";

export default async function AdminPage() {
  await requireAdmin();

  const [pendingListings, activeOrders, openDisputes, pendingPayouts] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "asc" },
      include: { photos: { take: 1 }, seller: true },
    }),
    prisma.order.findMany({
      where: { status: { in: ["PAID", "SHIPPED"] } },
      orderBy: { createdAt: "desc" },
      include: { listing: true, buyer: true, seller: true },
    }),
    prisma.dispute.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { status: "COMPLETED", payoutStatus: "PENDING" },
      orderBy: { completedAt: "asc" },
      include: { seller: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Admin</h1>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">
          Pending Review ({pendingListings.length})
        </h2>
        {pendingListings.length === 0 ? (
          <p className="text-sm text-muted">Nothing waiting for review.</p>
        ) : (
          <div className="rounded-xl border border-border bg-card px-4">
            {pendingListings.map((l) => (
              <ListingReviewRow
                key={l.id}
                id={l.id}
                brand={l.brand}
                fragranceName={l.fragranceName}
                sellerName={l.seller.name}
                photoUrl={l.photos[0]?.url}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">Active Orders</h2>
        {activeOrders.length === 0 ? (
          <p className="text-sm text-muted">No active orders.</p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {activeOrders.map((o) => (
              <a
                key={o.id}
                href={`/orders/${o.id}`}
                target="_blank"
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-stone-50"
              >
                <span>
                  {o.listing.brand} — {o.buyer.name} → {o.seller.name} · {formatNaira(o.pricePaid)}
                </span>
                <Badge tone={statusTone(o.status)}>{ORDER_STATUS_LABELS[o.status]}</Badge>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-stone-900">
          Open Disputes ({openDisputes.length})
        </h2>
        {openDisputes.length === 0 ? (
          <p className="text-sm text-muted">No open disputes.</p>
        ) : (
          <div className="rounded-xl border border-border bg-card px-4">
            {openDisputes.map((d) => (
              <DisputeRow
                key={d.id}
                id={d.id}
                orderId={d.orderId}
                category={d.category}
                description={d.description}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-stone-900">
          Manual Payout Tracker ({pendingPayouts.length})
        </h2>
        {pendingPayouts.length === 0 ? (
          <p className="text-sm text-muted">Nothing pending payout.</p>
        ) : (
          <div className="rounded-xl border border-border bg-card px-4">
            {pendingPayouts.map((o) => (
              <PayoutRow key={o.id} orderId={o.id} sellerName={o.seller.name} amount={o.pricePaid} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
