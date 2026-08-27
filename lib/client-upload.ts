const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Uploads a photo directly from the browser to Neon Object Storage via a
 * short-lived presigned URL, then returns its permanent public URL. Keeps
 * large image bytes off our own serverless functions, which have a hard
 * ~4.5MB request body limit on Vercel.
 */
export async function uploadPhoto(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large (max 8MB).");
  }

  const presignRes = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type }),
  });
  const presignData = await presignRes.json().catch(() => ({}));
  if (!presignRes.ok) {
    throw new Error(presignData.error ?? "Failed to prepare upload.");
  }

  const uploadRes = await fetch(presignData.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadRes.ok) {
    throw new Error("Failed to upload photo.");
  }

  return presignData.publicUrl as string;
}
