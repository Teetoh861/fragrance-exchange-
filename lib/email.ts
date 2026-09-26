const RESEND_API = "https://api.resend.com/emails";
const FROM = process.env.EMAIL_FROM || "Fragrance Exchange <onboarding@resend.dev>";

export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY);
}

// Notifications are a side effect, not a core requirement of the flows that
// trigger them — a failed/unconfigured email should never break a payment,
// offer, or shipment. Swallows and logs instead of throwing.
async function sendEmail(params: { to: string; subject: string; html: string }) {
  if (!emailEnabled()) return;
  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });
    if (!res.ok) {
      console.error("Failed to send email:", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

function layout(body: string): string {
  return `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#292524">
    <h2 style="color:#78350f">Fragrance Exchange</h2>
    ${body}
  </div>`;
}

export function notifyNewOrder(params: {
  sellerEmail: string;
  sellerName: string;
  buyerName: string;
  brand: string;
  fragranceName: string;
  pricePaid: number;
  orderId: string;
  origin: string;
}) {
  return sendEmail({
    to: params.sellerEmail,
    subject: `You've sold ${params.brand} ${params.fragranceName}`,
    html: layout(`
      <p>Hi ${params.sellerName},</p>
      <p><strong>${params.buyerName}</strong> just paid for your <strong>${params.brand} ${params.fragranceName}</strong> (₦${params.pricePaid.toLocaleString()}).</p>
      <p>Please package it up and mark it shipped with a tracking number and photo proof.</p>
      <p><a href="${params.origin}/orders/${params.orderId}">View the order</a></p>
    `),
  });
}

export function notifyNewOffer(params: {
  sellerEmail: string;
  sellerName: string;
  buyerName: string;
  brand: string;
  fragranceName: string;
  offerPrice: number;
  offerId: string;
  origin: string;
}) {
  return sendEmail({
    to: params.sellerEmail,
    subject: `New offer on ${params.brand} ${params.fragranceName}`,
    html: layout(`
      <p>Hi ${params.sellerName},</p>
      <p><strong>${params.buyerName}</strong> offered <strong>₦${params.offerPrice.toLocaleString()}</strong> for your <strong>${params.brand} ${params.fragranceName}</strong>.</p>
      <p><a href="${params.origin}/offers/${params.offerId}">Review the offer</a></p>
    `),
  });
}

export function notifyOfferAccepted(params: {
  buyerEmail: string;
  buyerName: string;
  brand: string;
  fragranceName: string;
  listingId: string;
  offerId: string;
  origin: string;
}) {
  return sendEmail({
    to: params.buyerEmail,
    subject: `Your offer on ${params.brand} ${params.fragranceName} was accepted`,
    html: layout(`
      <p>Hi ${params.buyerName},</p>
      <p>The seller accepted your offer on <strong>${params.brand} ${params.fragranceName}</strong>. Complete checkout to secure it.</p>
      <p><a href="${params.origin}/listings/${params.listingId}/checkout?offerId=${params.offerId}">Complete checkout</a></p>
    `),
  });
}

export function notifyOfferDeclined(params: {
  buyerEmail: string;
  buyerName: string;
  brand: string;
  fragranceName: string;
  listingId: string;
  origin: string;
}) {
  return sendEmail({
    to: params.buyerEmail,
    subject: `Your offer on ${params.brand} ${params.fragranceName} was declined`,
    html: layout(`
      <p>Hi ${params.buyerName},</p>
      <p>The seller declined your offer on <strong>${params.brand} ${params.fragranceName}</strong>. You can still buy it at the listed price.</p>
      <p><a href="${params.origin}/listings/${params.listingId}">View the listing</a></p>
    `),
  });
}

export function notifyOrderShipped(params: {
  buyerEmail: string;
  buyerName: string;
  brand: string;
  fragranceName: string;
  trackingNumber: string;
  orderId: string;
  origin: string;
}) {
  return sendEmail({
    to: params.buyerEmail,
    subject: `${params.brand} ${params.fragranceName} has shipped`,
    html: layout(`
      <p>Hi ${params.buyerName},</p>
      <p>Your <strong>${params.brand} ${params.fragranceName}</strong> is on its way. Tracking number: <strong>${params.trackingNumber}</strong>.</p>
      <p>Once it arrives, confirm receipt so the seller gets paid out.</p>
      <p><a href="${params.origin}/orders/${params.orderId}">View the order</a></p>
    `),
  });
}
