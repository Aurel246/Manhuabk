export interface ValidImage {
  buffer: Buffer;
  ext: "jpg" | "png" | "webp";
  mime: string;
}

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 Mo

function detect(buf: Buffer): ValidImage | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { buffer: buf, ext: "jpg", mime: "image/jpeg" };
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return { buffer: buf, ext: "png", mime: "image/png" };
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { buffer: buf, ext: "webp", mime: "image/webp" };
  }
  return null;
}

export async function validateImageBuffer(data: Buffer): Promise<ValidImage> {
  if (data.length > MAX_IMAGE_BYTES) {
    throw new Error(
      `Fichier trop volumineux (max ${MAX_IMAGE_BYTES / 1024 / 1024} Mo).`
    );
  }
  const detected = detect(data);
  if (!detected) {
    throw new Error("Format non autorisé. Utilise JPEG, PNG ou WebP.");
  }
  return detected;
}
