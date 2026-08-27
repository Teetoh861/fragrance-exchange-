import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Only the seller can mark this order as shipped." }, { status: 403 });
  }
  if (order.status !== "PAID") {
    return NextResponse.json({ error: "This order can't be marked shipped right now." }, { status: 400 });
  }

  const formData = await req.formData();
  const proofFile = formData.get("proofPhoto") as File | null;
  const trackingNumber = (formData.get("trackingNumber") as string | null)?.trim();

  if (!proofFile || proofFile.size === 0) {
    return NextResponse.json({ error: "A photo of the packaged item is required." }, { status: 400 });
  }
  if (!trackingNumber) {
    return NextResponse.json({ error: "Tracking / waybill number is required." }, { status: 400 });
  }

  try {
    const proofUrl = await saveUploadedFile(proofFile);
    await prisma.order.update({
      where: { id },
      data: {
        status: "SHIPPED",
        shipmentProofUrl: proofUrl,
        trackingNumber,
        shippedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to mark as shipped.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
