import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  resolutionNote: z.string().trim().min(1).max(1000),
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
    return NextResponse.json({ error: "A resolution note is required." }, { status: 400 });
  }

  const dispute = await prisma.dispute.findUnique({ where: { id } });
  if (!dispute) return NextResponse.json({ error: "Dispute not found." }, { status: 404 });

  await prisma.dispute.update({
    where: { id },
    data: { status: "RESOLVED", resolutionNote: parsed.data.resolutionNote },
  });

  return NextResponse.json({ ok: true });
}
