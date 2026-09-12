import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(5).max(500),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const { id: listingId } = await params;
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please add a star rating and a short review." }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      listingId,
      authorId: session.user.id,
      authorName: session.user.name ?? "Anonymous",
      rating: parsed.data.rating,
      body: parsed.data.body,
    },
  });

  return NextResponse.json({ ok: true, id: review.id });
}
