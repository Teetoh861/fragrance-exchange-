import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { finalizeSwap } from "@/lib/swap";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference") || url.searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(new URL("/account?error=missing_reference", url.origin));
  }

  try {
    const tx = await verifyPaystackTransaction(reference);
    if (tx.status !== "success") {
      return NextResponse.redirect(new URL("/account?error=payment_failed", url.origin));
    }

    const metadata = tx.metadata as { swapOfferId: string; type: string } | undefined;
    if (!metadata?.swapOfferId) {
      return NextResponse.redirect(new URL("/account?error=missing_metadata", url.origin));
    }

    const offer = await prisma.swapOffer.findUnique({ where: { id: metadata.swapOfferId } });
    if (!offer) {
      return NextResponse.redirect(new URL("/account?error=swap_not_found", url.origin));
    }

    if (!offer.cashPaid) {
      await prisma.swapOffer.update({
        where: { id: offer.id },
        data: { cashPaid: true, paystackRef: reference },
      });
      await finalizeSwap(offer.id);
    }

    return NextResponse.redirect(new URL(`/swaps/${offer.id}`, url.origin));
  } catch {
    return NextResponse.redirect(new URL("/account?error=verification_failed", url.origin));
  }
}
