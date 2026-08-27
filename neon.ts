import { defineConfig } from "@neon/config/v1";

// Infra-as-code for this project's Neon services. Reconcile with:
//   neon config plan    # dry-run diff
//   neon deploy          # provision (alias for `neon config apply`)
export default defineConfig({
  preview: {
    buckets: {
      // Listing photos and shipment-proof photos. public_read matches the
      // app's existing model: URLs are unguessable (random UUID keys) but
      // not access-controlled — the same trust level the old local-disk
      // /public/uploads storage had.
      "fragrance-exchange": {
        access: "public_read",
      },
    },
  },
});
