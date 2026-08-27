import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";

const categorySchema = z.enum([
  "WRONG_ITEM",
  "COUNTERFEIT_SUSPECTED",
  "FILL_LEVEL_MISMATCH",
  "DAMAGED",
  "NOT_RECEIVED",
  "OTHER",
]);

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

  const formData = await req.formData();
  const category = categorySchema.safeParse(formData.get("category"));
  const description = (formData.get("description") as string | null)?.trim();
  const evidenceFile = formData.get("evidence") as File | null;

  if (!category.success) {
    return NextResponse.json({ error: "Please choose a valid dispute reason." }, { status: 400 });
  }
  if (!description || description.length < 10) {
    return NextResponse.json({ error: "Please describe the problem in a bit more detail." }, { status: 400 });
  }

  let evidenceUrl: string | undefined;
  try {
    if (evidenceFile && evidenceFile.size > 0) {
      evidenceUrl = await saveUploadedFile(evidenceFile);
    }

    await prisma.$transaction([
      prisma.dispute.create({
        data: {
          orderId: id,
          category: category.data,
          description,
          evidenceUrl,
        },
      }),
      prisma.order.update({ where: { id }, data: { status: "DISPUTED" } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to file dispute.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
