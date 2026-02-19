/**
 * Cloudflare R2 (S3-compatible) client for server-side uploads.
 * Requires: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME.
 * Optional: R2_PUBLIC_URL - base URL for public read (e.g. https://pub-xxx.r2.dev or custom domain).
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let _client = null;

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  const publicUrl = process.env.R2_PUBLIC_URL?.trim();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) return null;
  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicUrl: publicUrl || null,
  };
}

export function getR2Client() {
  const config = getR2Config();
  if (!config) return null;
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }
  return _client;
}

export function getR2BucketName() {
  const config = getR2Config();
  return config?.bucketName ?? null;
}

export function getR2PublicUrl(key) {
  const config = getR2Config();
  if (!config?.publicUrl) return null;
  const base = config.publicUrl.replace(/\/$/, "");
  return `${base}/${key.replace(/^\//, "")}`;
}

export async function uploadToR2(key, body, contentType) {
  const client = getR2Client();
  const bucket = getR2BucketName();
  if (!client || !bucket) throw new Error("R2 is not configured");
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType || "application/octet-stream",
    })
  );
  return getR2PublicUrl(key) || key;
}
