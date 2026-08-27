export const CATEGORY_LABELS: Record<string, string> = {
  DESIGNER: "Designer",
  NICHE: "Niche",
  ARABIAN: "Arabian",
};

export const GENDER_LABELS: Record<string, string> = {
  MEN: "Men",
  WOMEN: "Women",
  UNISEX: "Unisex",
};

export const CONCENTRATION_LABELS: Record<string, string> = {
  EDC: "Eau de Cologne",
  EDT: "Eau de Toilette",
  EDP: "Eau de Parfum",
  PARFUM: "Parfum / Extrait",
  OIL: "Oil (Attar)",
  OTHER: "Other",
};

export const CONDITION_LABELS: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  USED_GOOD: "Used — good",
  USED_HEAVY: "Used — heavily used",
};

export const PURCHASE_SOURCE_LABELS: Record<string, string> = {
  RETAIL: "Retail",
  GIFT: "Gift",
  OTHER: "Other",
};

// Fine-grained suggestions for the fill-level datalist — a few sprays
// shouldn't force a jump straight from 100% to 90%.
export const FILL_LEVEL_SUGGESTIONS = [
  100, 99, 98, 97, 95, 90, 85, 80, 75, 70, 60, 50, 40, 30, 20, 10,
] as const;

// Standard retail bottle sizes, for the size-ml datalist.
export const SIZE_ML_SUGGESTIONS = [
  2, 5, 10, 15, 20, 30, 50, 60, 75, 90, 100, 125, 150, 200,
] as const;

// Common designer, niche, and Arabian/attar fragrance houses, for the
// brand-name datalist. Not exhaustive — the field still accepts free text.
export const BRAND_SUGGESTIONS = [
  // Designer
  "Chanel",
  "Dior",
  "Yves Saint Laurent",
  "Gucci",
  "Versace",
  "Giorgio Armani",
  "Prada",
  "Burberry",
  "Dolce & Gabbana",
  "Calvin Klein",
  "Hugo Boss",
  "Ralph Lauren",
  "Jean Paul Gaultier",
  "Paco Rabanne",
  "Valentino",
  "Carolina Herrera",
  "Bvlgari",
  "Tom Ford",
  "Marc Jacobs",
  "Lancôme",
  // Niche
  "Amouage",
  "Maison Francis Kurkdjian",
  "Creed",
  "Le Labo",
  "Byredo",
  "Parfums de Marly",
  "Xerjoff",
  "Nishane",
  "Initio Parfums Privés",
  "Roja Parfums",
  "Kilian",
  "Diptyque",
  "Frederic Malle",
  "Mancera",
  "Montale",
  "Nasomatto",
  "Memo Paris",
  "Acqua di Parma",
  "Penhaligon's",
  "Clive Christian",
  // Arabian / attar houses
  "Ajmal",
  "Rasasi",
  "Arabian Oud",
  "Swiss Arabian",
  "Lattafa",
  "Al Haramain",
  "Nabeel",
  "Ard Al Zaafaran",
  "My Perfumes",
  "Junaid Perfumes",
  "Afnan Perfumes",
] as const;

export const PHOTO_TYPE_LABELS: Record<string, string> = {
  FRONT: "Front",
  BACK: "Back",
  BASE: "Bottle base / batch code",
  CAP: "Cap / atomizer",
  BOX: "Box",
};

export const REQUIRED_PHOTO_TYPES = ["FRONT", "BACK", "BASE", "CAP"] as const;

export const LISTING_STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Pending Review",
  LIVE: "Live",
  RESERVED: "Reserved",
  SOLD: "Sold",
  REJECTED: "Rejected",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PAID: "Paid",
  AWAITING_SHIPMENT: "Awaiting Shipment",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  DISPUTED: "Disputed",
  CANCELLED: "Cancelled",
};

export const DISPUTE_CATEGORY_LABELS: Record<string, string> = {
  WRONG_ITEM: "Wrong item",
  COUNTERFEIT_SUSPECTED: "Counterfeit suspected",
  FILL_LEVEL_MISMATCH: "Fill level significantly misrepresented",
  DAMAGED: "Undisclosed damage",
  NOT_RECEIVED: "Item not received",
  OTHER: "Other",
};

export const UNBOXING_VIDEO_THRESHOLD = 50000;

export const INSPECTION_WINDOW_HOURS = 48;

export const PRICE_OFFER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};

export const ESCROW_DISCLAIMER =
  "We hold your payment until you confirm delivery, then release it to the seller. This is not licensed escrow and your funds are not protected by escrow law.";
