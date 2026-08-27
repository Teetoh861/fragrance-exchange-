import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createPresignedUpload } from "@/lib/storage";

const schema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are allowed." }, { status: 400 });
  }

  try {
    const { uploadUrl, publicUrl } = await createPresignedUpload(parsed.data.contentType);
    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to prepare upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
