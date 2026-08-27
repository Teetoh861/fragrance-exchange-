import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = "fragrance-exchange";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

// Constructed lazily (not at module load) so importing this module never
// crashes build-time page-data collection or requests unrelated to uploads
// when AWS_ENDPOINT_URL_S3 isn't set (e.g. a fresh checkout before `neon
// deploy`/env pull has run).
let s3Client: S3Client | undefined;
function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      forcePathStyle: true, // required: Neon uses path-style addressing
      // Skip the SDK's default checksum params on presigned URLs — a plain
      // browser `fetch` PUT can't compute/send them, which would otherwise
      // make the direct-to-storage upload fail.
      requestChecksumCalculation: "WHEN_REQUIRED",
    });
  }
  return s3Client;
}

/**
 * Issues a short-lived presigned PUT URL so the browser can upload a photo
 * directly to the Neon Object Storage `fragrance-exchange` bucket
 * (public_read), without the file passing through a Next.js server
 * function — Vercel's serverless functions have a ~4.5MB request body
 * limit, well under what a handful of full-resolution phone photos add
 * up to.
 */
export async function createPresignedUpload(
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed.");
  }

  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/$/, "");
  if (!endpoint) {
    throw new Error("Neon Object Storage is not configured (AWS_ENDPOINT_URL_S3 missing).");
  }

  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const key = `${randomUUID()}.${ext}`;

  const uploadUrl = await getSignedUrl(
    getS3Client(),
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  );

  return { uploadUrl, publicUrl: `${endpoint}/${BUCKET}/${key}` };
}

/** Guards against a client submitting an arbitrary URL instead of one it actually uploaded to our bucket. */
export function isOwnBucketUrl(url: string): boolean {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/$/, "");
  if (!endpoint) return false;
  return url.startsWith(`${endpoint}/${BUCKET}/`);
}
