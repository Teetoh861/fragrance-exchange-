"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BuyNowButton({ listingId, loggedIn }: { listingId: string; loggedIn: boolean }) {
  const router = useRouter();

  function onClick() {
    if (!loggedIn) {
      router.push(`/login?callbackUrl=/listings/${listingId}/checkout`);
      return;
    }
    router.push(`/listings/${listingId}/checkout`);
  }

  return (
    <Button size="lg" className="w-full" onClick={onClick}>
      Buy Now
    </Button>
  );
}
