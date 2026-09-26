import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  action: z.enum(["flag", "restore", "reject"]),
  note: z.string().max(500).optional(),
});

// Listings go live immediately on submission (no pre-approval queue).
// Admins instead act after the fact: flag a live/reserved/sold listing that
// looks suspicious (hides it pending a closer look), restore a flagged one
// back to live, or reject it outright to remove it for good.
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
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const { action, note } = parsed.data;

  if (action === "flag") {
    if (!["LIVE", "RESERVED", "SOLD"].includes(listing.status)) {
      return NextResponse.json({ error: "Only a visible listing can be flagged." }, { status: 400 });
    }
    await prisma.listing.update({
      where: { id },
      data: { status: "FLAGGED", reviewNote: note || null },
    });
  } else if (action === "restore") {
    if (listing.status !== "FLAGGED") {
      return NextResponse.json({ error: "Only a flagged listing can be restored." }, { status: 400 });
    }
    await prisma.listing.update({
      where: { id },
      data: { status: "LIVE", reviewNote: null },
    });
  } else {
    if (!["FLAGGED", "LIVE", "RESERVED"].includes(listing.status)) {
      return NextResponse.json({ error: "This listing can't be rejected right now." }, { status: 400 });
    }
    await prisma.listing.update({
      where: { id },
      data: { status: "REJECTED", reviewNote: note || null },
    });
  }

  return NextResponse.json({ ok: true });
}
