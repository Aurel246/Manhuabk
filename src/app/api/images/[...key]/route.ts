import { NextResponse } from "next/server";
import { readFileByKey } from "@/modules/storage/service";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ key: string[] }> }
) {
  const { key: parts } = await ctx.params;
  const key = parts.join("/");
  if (!key || key.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const data = await readFileByKey(key);
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    const mime = MIME[ext] ?? "application/octet-stream";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
