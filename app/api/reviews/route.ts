import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  brand: z.string().trim().min(1).max(80),
  fragranceName: z.string().trim().min(1).max(120),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().min(5).max(500),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please add the perfume, a star rating, and a short review." },
      { status: 400 }
    );
  }

  const review = await prisma.review.create({
    data: {
      brand: parsed.data.brand,
      fragranceName: parsed.data.fragranceName,
      authorId: session.user.id,
      authorName: session.user.name ?? "Anonymous",
      rating: parsed.data.rating,
      body: parsed.data.body,
    },
  });

  return NextResponse.json({ ok: true, id: review.id });
}
