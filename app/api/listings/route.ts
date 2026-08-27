import { NextResponse } from "next/server";
import { z } from "zod";
import { PhotoType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";
import { REQUIRED_PHOTO_TYPES } from "@/lib/constants";

const listingSchema = z.object({
  brand: z.string().trim().min(1).max(80),
  fragranceName: z.string().trim().min(1).max(120),
  category: z.enum(["DESIGNER", "NICHE", "ARABIAN"]),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
  concentration: z.enum(["EDC", "EDT", "EDP", "PARFUM", "OIL", "OTHER"]),
  sizeMl: z.coerce.number().int().min(1).max(2000),
  fillLevel: z.coerce.number().int().min(1).max(100),
  condition: z.enum(["NEW", "LIKE_NEW", "USED_GOOD", "USED_HEAVY"]),
  purchaseSource: z.enum(["RETAIL", "GIFT", "OTHER"]),
  price: z.coerce.number().int().min(500).max(50_000_000),
  swapEnabled: z.coerce.boolean(),
  desiredFragrances: z.string().trim().max(500).optional(),
  cashTopupOk: z.coerce.boolean(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const formData = await req.formData();

  const parsed = listingSchema.safeParse({
    brand: formData.get("brand"),
    fragranceName: formData.get("fragranceName"),
    category: formData.get("category"),
    gender: formData.get("gender"),
    concentration: formData.get("concentration"),
    sizeMl: formData.get("sizeMl"),
    fillLevel: formData.get("fillLevel"),
    condition: formData.get("condition"),
    purchaseSource: formData.get("purchaseSource"),
    price: formData.get("price"),
    swapEnabled: formData.get("swapEnabled") === "on" || formData.get("swapEnabled") === "true",
    desiredFragrances: formData.get("desiredFragrances") ?? undefined,
    cashTopupOk: formData.get("cashTopupOk") === "on" || formData.get("cashTopupOk") === "true",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your listing details.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const photoEntries = REQUIRED_PHOTO_TYPES.map((type) => ({
    type,
    file: formData.get(`photo_${type}`) as File | null,
  }));
  const boxFile = formData.get("photo_BOX") as File | null;

  const missing = photoEntries.filter((p) => !p.file || p.file.size === 0);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required photos: ${missing.map((m) => m.type).join(", ")}.` },
      { status: 400 }
    );
  }

  try {
    const savedPhotos: { url: string; photoType: PhotoType }[] = [];
    for (const entry of photoEntries) {
      const url = await saveUploadedFile(entry.file as File);
      savedPhotos.push({ url, photoType: entry.type as PhotoType });
    }
    if (boxFile && boxFile.size > 0) {
      const url = await saveUploadedFile(boxFile);
      savedPhotos.push({ url, photoType: "BOX" });
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId: session.user.id,
        brand: parsed.data.brand,
        fragranceName: parsed.data.fragranceName,
        category: parsed.data.category,
        gender: parsed.data.gender,
        concentration: parsed.data.concentration,
        sizeMl: parsed.data.sizeMl,
        fillLevel: parsed.data.fillLevel,
        condition: parsed.data.condition,
        purchaseSource: parsed.data.purchaseSource,
        price: parsed.data.price,
        swapEnabled: parsed.data.swapEnabled,
        desiredFragrances: parsed.data.swapEnabled ? parsed.data.desiredFragrances ?? null : null,
        cashTopupOk: parsed.data.swapEnabled ? parsed.data.cashTopupOk : false,
        status: "PENDING_REVIEW",
        photos: { create: savedPhotos },
      },
    });

    return NextResponse.json({ ok: true, id: listing.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create listing.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
