import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { finalizeSwap } from "@/lib/swap";
import { initializePaystackTransaction, paystackEnabled } from "@/lib/paystack";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const offer = await prisma.swapOffer.findUnique({ where: { id } });
  if (!offer) return NextResponse.json({ error: "Swap offer not found." }, { status: 404 });
  if (offer.status !== "ACCEPTED") {
    return NextResponse.json({ error: "This swap hasn't been accepted yet." }, { status: 400 });
  }
  if (offer.cashTopupPayer !== session.user.id) {
    return NextResponse.json({ error: "You aren't the one who owes the cash top-up." }, { status: 403 });
  }
  if (offer.cashPaid) {
    return NextResponse.json({ error: "The top-up has already been paid." }, { status: 400 });
  }

  const reference = `fxswap_${randomUUID()}`;
  const origin = new URL(req.url).origin;

  if (!paystackEnabled()) {
    await prisma.swapOffer.update({ where: { id }, data: { cashPaid: true, paystackRef: reference } });
    await finalizeSwap(id);
    return NextResponse.json({ mock: true });
  }

  try {
    const tx = await initializePaystackTransaction({
      email: session.user.email as string,
      amountNaira: offer.cashTopupAmount,
      reference,
      callbackUrl: `${origin}/api/checkout/swap-callback`,
      metadata: { swapOfferId: id, type: "SWAP_TOPUP" },
    });
    return NextResponse.json({ authorizationUrl: tx.authorization_url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start payment.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
