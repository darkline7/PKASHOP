import { NextResponse } from "next/server";
import { generateHumanizedDocx } from "@/lib/docxExport";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, fileName, mode } = body as {
      text?: string;
      fileName?: string;
      mode?: string;
    };

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Nội dung văn bản trống. Không thể xuất file." },
        { status: 400 }
      );
    }

    const baseName = (fileName || "VanBan_DaSua.docx")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF-]/g, "_");
    const outFileName = `[DaSua-Humanized]_${baseName}.docx`;

    const buffer = await generateHumanizedDocx({
      fileName: fileName || "VanBan_DaSua.docx",
      humanizedText: text,
      mode: mode || "standard",
    });

    const headers = new Headers();
    headers.set(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(outFileName)}"; filename*=UTF-8''${encodeURIComponent(outFileName)}`
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("Export Humanized DOCX error:", err);
    return NextResponse.json(
      { error: err?.message || "Không thể xuất file Word đã sửa." },
      { status: 500 }
    );
  }
}
