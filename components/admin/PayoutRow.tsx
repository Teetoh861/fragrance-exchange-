"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";

export function PayoutRow({
  orderId,
  sellerName,
  amount,
}: {
  orderId: string;
  sellerName: string;
  amount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markPaid() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${orderId}/payout`, { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between border-b border-border py-3">
      <div>
        <p className="text-sm font-medium text-stone-900">{sellerName}</p>
        <p className="text-xs text-muted">
          Order {orderId.slice(0, 8)} · {formatNaira(amount)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {error && <p className="text-xs text-red-700">{error}</p>}
        <Button size="sm" onClick={markPaid} disabled={loading}>
          {loading ? "…" : "Mark Paid Out"}
        </Button>
      </div>
    </div>
  );
}
