import { randomUUID } from "crypto";
import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

const BUCKET = "fragrance-exchange";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;

// Constructed lazily (not at module load) so importing this module never
// crashes build-time page-data collection or requests unrelated to uploads
// when AWS_ENDPOINT_URL_S3 isn't set (e.g. a fresh checkout before `neon
// deploy`/env pull has run).
let filesClient: Files | undefined;
function getFilesClient(): Files {
  if (!filesClient) {
    filesClient = new Files({ adapter: neon({ bucket: BUCKET }) });
  }
  return filesClient;
}

/**
 * Stores an uploaded photo in the Neon Object Storage `fragrance-exchange`
 * bucket (public_read) and returns its permanent public URL. Branches with
 * the database on Neon, so preview/dev branches get their own isolated files.
 */
export async function saveUploadedFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large (max 8MB).");
  }

  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/$/, "");
  if (!endpoint) {
    throw new Error("Neon Object Storage is not configured (AWS_ENDPOINT_URL_S3 missing).");
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `${randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await getFilesClient().upload(key, buffer, { contentType: file.type });

  return `${endpoint}/${BUCKET}/${key}`;
}
