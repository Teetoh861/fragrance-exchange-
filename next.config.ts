import type { NextConfig } from "next";

// Allow next/image to load listing/shipment photos from the Neon Object
// Storage bucket. AWS_ENDPOINT_URL_S3 is set by Neon (see lib/storage.ts).
const storageEndpoint = process.env.AWS_ENDPOINT_URL_S3;
const storageHostname = storageEndpoint ? new URL(storageEndpoint).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: storageHostname
      ? [{ protocol: "https", hostname: storageHostname }]
      : [],
  },
};

export default nextConfig;
