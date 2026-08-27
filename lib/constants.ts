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

export const FILL_LEVEL_BANDS = [100, 90, 75, 50, 25] as const;

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
