import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  neutral: "bg-stone-100 text-stone-700",
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  blue: "bg-blue-100 text-blue-800",
  purple: "bg-purple-100 text-purple-800",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return <span className={cn("badge", tones[tone], className)}>{children}</span>;
}

export function statusTone(status: string): keyof typeof tones {
  switch (status) {
    case "LIVE":
    case "COMPLETED":
    case "PAID":
      return "green";
    case "PENDING_REVIEW":
    case "AWAITING_SHIPMENT":
    case "SHIPPED":
      return "amber";
    case "REJECTED":
    case "DISPUTED":
    case "CANCELLED":
      return "red";
    case "RESERVED":
    case "DELIVERED":
      return "blue";
    case "SOLD":
      return "purple";
    default:
      return "neutral";
  }
}
