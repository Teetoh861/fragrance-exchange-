import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdminApi();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.status !== "COMPLETED") {
    return NextResponse.json({ error: "Only completed orders can be marked paid out." }, { status: 400 });
  }

  await prisma.order.update({ where: { id }, data: { payoutStatus: "PAID_OUT" } });
  return NextResponse.json({ ok: true });
}
