import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import {
  isSafeUploadName,
  legacyUploadFilePath,
  uploadContentType,
  uploadFilePath,
} from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readUpload(name: string): Promise<Buffer | null> {
  for (const path of [uploadFilePath(name), legacyUploadFilePath(name)]) {
    try {
      return await readFile(path);
    } catch {
      // Try the legacy public/uploads location, then return 404.
    }
  }
  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const segments = (await params).path;
  const name = segments.length === 1 ? segments[0] : "";

  if (!isSafeUploadName(name)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const data = await readUpload(name);
  if (!data) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": uploadContentType(name),
      "Content-Length": String(data.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
