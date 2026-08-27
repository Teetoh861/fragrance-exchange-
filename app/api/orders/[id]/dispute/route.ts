import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOwnBucketUrl } from "@/lib/storage";

const schema = z.object({
  category: z.enum([
    "WRONG_ITEM",
    "COUNTERFEIT_SUSPECTED",
    "FILL_LEVEL_MISMATCH",
    "DAMAGED",
    "NOT_RECEIVED",
    "OTHER",
  ]),
  description: z.string().trim().min(10).max(1000),
  evidenceUrl: z.string().url().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Only the buyer can report a problem." }, { status: 403 });
  }
  if (!["SHIPPED", "DELIVERED"].includes(order.status)) {
    return NextResponse.json({ error: "A dispute can only be opened after the item has shipped." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please choose a reason and describe the problem in a bit more detail." },
      { status: 400 }
    );
  }
  if (parsed.data.evidenceUrl && !isOwnBucketUrl(parsed.data.evidenceUrl)) {
    return NextResponse.json({ error: "Invalid photo upload." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.dispute.create({
      data: {
        orderId: id,
        category: parsed.data.category,
        description: parsed.data.description,
        evidenceUrl: parsed.data.evidenceUrl,
      },
    }),
    prisma.order.update({ where: { id }, data: { status: "DISPUTED" } }),
  ]);

  return NextResponse.json({ ok: true });
}
