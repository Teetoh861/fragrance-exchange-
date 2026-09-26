import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOwnBucketUrl } from "@/lib/storage";
import { notifyOrderShipped } from "@/lib/email";

const schema = z.object({
  proofPhotoUrl: z.string().url(),
  trackingNumber: z.string().trim().min(1).max(100),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { listing: true, buyer: { select: { email: true, name: true } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Only the seller can mark this order as shipped." }, { status: 403 });
  }
  if (order.status !== "PAID") {
    return NextResponse.json({ error: "This order can't be marked shipped right now." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "A shipment proof photo and tracking number are required." },
      { status: 400 }
    );
  }
  if (!isOwnBucketUrl(parsed.data.proofPhotoUrl)) {
    return NextResponse.json({ error: "Invalid photo upload." }, { status: 400 });
  }

  await prisma.order.update({
    where: { id },
    data: {
      status: "SHIPPED",
      shipmentProofUrl: parsed.data.proofPhotoUrl,
      trackingNumber: parsed.data.trackingNumber,
      shippedAt: new Date(),
    },
  });

  await notifyOrderShipped({
    buyerEmail: order.buyer.email,
    buyerName: order.buyer.name,
    brand: order.listing.brand,
    fragranceName: order.listing.fragranceName,
    trackingNumber: parsed.data.trackingNumber,
    orderId: order.id,
    origin: new URL(req.url).origin,
  });

  return NextResponse.json({ ok: true });
}
