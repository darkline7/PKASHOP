import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { normalize, resolve } from "path";
import { existsSync } from "fs";

// 1x1 transparent PNG fallback so next/image optimizer never breaks on missing files
const TRANSPARENT_PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64"
);

const MIME_TYPES: Record<string, string> = {
  // Images
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  bmp: "image/bmp",
  tiff: "image/tiff",
  // Documents
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  "7z": "application/x-7z-compressed",
  txt: "text/plain; charset=utf-8",
};

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg", "ico", "bmp", "tiff"]);

function resolveExistingFile(rawPath: string): string | null {
  const safePath = normalize(rawPath).replace(/^(\.\.[\/\\])+/, "");
  const baseDirs = [
    resolve(process.cwd(), "public", "uploads"),
    resolve(process.cwd(), "uploads"),
  ];

  for (const baseDir of baseDirs) {
    const fullPath = resolve(baseDir, safePath);
    if (fullPath.startsWith(baseDir) && existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

function handleMissing(ext: string) {
  if (IMAGE_EXTENSIONS.has(ext)) {
    return new NextResponse(TRANSPARENT_PNG_1X1, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": TRANSPARENT_PNG_1X1.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  return new NextResponse("File Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params?.path || [];
    if (!segments.length) {
      return new NextResponse("File Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const rawPath = segments.join("/");
    const ext = rawPath.split(".").pop()?.toLowerCase() || "";
    const filePath = resolveExistingFile(rawPath);

    if (!filePath) {
      return handleMissing(ext);
    }

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return handleMissing(ext);
    }

    const buffer = await readFile(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Uploads route error:", error);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params?.path || [];
    if (!segments.length) {
      return new NextResponse(null, { status: 404 });
    }

    const rawPath = segments.join("/");
    const ext = rawPath.split(".").pop()?.toLowerCase() || "";
    const filePath = resolveExistingFile(rawPath);

    if (!filePath) {
      if (IMAGE_EXTENSIONS.has(ext)) {
        return new NextResponse(null, {
          status: 200,
          headers: {
            "Content-Type": "image/png",
            "Content-Length": TRANSPARENT_PNG_1X1.length.toString(),
          },
        });
      }
      return new NextResponse(null, { status: 404 });
    }

    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return new NextResponse(null, { status: 404 });
    }

    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

