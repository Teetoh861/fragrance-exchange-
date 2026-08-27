import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Only the buyer can confirm receipt." }, { status: 403 });
  }
  if (order.status !== "SHIPPED") {
    return NextResponse.json({ error: "This order isn't ready to be confirmed yet." }, { status: 400 });
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status: "COMPLETED", deliveredAt: now, completedAt: now },
    }),
    prisma.user.update({
      where: { id: order.buyerId },
      data: { transactionCount: { increment: 1 } },
    }),
    prisma.user.update({
      where: { id: order.sellerId },
      data: { transactionCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
