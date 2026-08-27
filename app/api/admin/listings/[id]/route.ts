import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().max(500).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdminApi();
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.status !== "PENDING_REVIEW") {
    return NextResponse.json({ error: "Listing isn't pending review." }, { status: 400 });
  }

  await prisma.listing.update({
    where: { id },
    data: {
      status: parsed.data.action === "approve" ? "LIVE" : "REJECTED",
      reviewNote: parsed.data.note || null,
    },
  });

  return NextResponse.json({ ok: true });
}
