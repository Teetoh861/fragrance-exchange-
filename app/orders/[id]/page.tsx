import Image from "next/image";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Badge, statusTone } from "@/components/ui/badge";
import { ShipForm } from "@/components/orders/ShipForm";
import { BuyerActions } from "@/components/orders/BuyerActions";
import { ORDER_STATUS_LABELS, DISPUTE_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate, formatNaira } from "@/lib/utils";

const STEPS = ["PAID", "SHIPPED", "COMPLETED"] as const;
const STEP_LABELS: Record<string, string> = {
  PAID: "Paid · Awaiting Shipment",
  SHIPPED: "Shipped",
  COMPLETED: "Delivered — Confirmed",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      listing: { include: { photos: { take: 1 } } },
      buyer: true,
      seller: true,
      dispute: true,
    },
  });

  if (!order) notFound();
  if (order.buyerId !== user.id && order.sellerId !== user.id && user.role !== "ADMIN") {
    notFound();
  }

  const isBuyer = order.buyerId === user.id;
  const isSeller = order.sellerId === user.id;
  const currentStepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        {order.listing.photos[0] && (
          <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-stone-100">
            <Image src={order.listing.photos[0].url} alt="" fill className="object-cover" />
          </div>
        )}
        <div>
          <p className="font-semibold text-stone-900">
            {order.listing.brand} — {order.listing.fragranceName}
          </p>
          <p className="text-sm text-muted">{formatNaira(order.pricePaid)}</p>
        </div>
      </div>

      {order.status === "DISPUTED" && order.dispute ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-800">Dispute open</p>
          <p className="mt-1 text-sm text-red-700">
            Reason: {DISPUTE_CATEGORY_LABELS[order.dispute.category]}
          </p>
          <p className="mt-1 text-sm text-red-700">{order.dispute.description}</p>
          <p className="mt-2 text-xs text-red-600">
            Our team will review this and follow up. Status: {order.dispute.status}
          </p>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-card p-4">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`h-3 w-3 rounded-full ${
                    i <= currentStepIndex ? "bg-primary" : "bg-stone-200"
                  }`}
                />
                <span className="mt-1 max-w-[90px] text-[11px] text-muted">
                  {STEP_LABELS[step]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 ${
                    i < currentStepIndex ? "bg-primary" : "bg-stone-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between text-sm">
        <span className="text-muted">Order status</span>
        <Badge tone={statusTone(order.status)}>{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>

      {order.trackingNumber && (
        <p className="mb-6 text-sm text-muted">
          Tracking / waybill number: <strong>{order.trackingNumber}</strong>
        </p>
      )}

      {isSeller && order.status === "PAID" && <ShipForm orderId={order.id} />}

      {isBuyer && order.status === "SHIPPED" && (
        <BuyerActions orderId={order.id} pricePaid={order.pricePaid} />
      )}

      {order.status === "COMPLETED" && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Order completed on {order.completedAt ? formatDate(order.completedAt) : "—"}.
          {isSeller &&
            (order.payoutStatus === "PAID_OUT"
              ? " You've been paid out."
              : " We hold payment until you're marked for payout — this is not licensed escrow, just how we manage the manual payout process for now.")}
        </p>
      )}
    </div>
  );
}
