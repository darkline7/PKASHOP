import { NextResponse } from "next/server";
import { generateAICheckReportDocx } from "@/lib/docxExport";
import type { AIDetectorResult } from "@/lib/aiDetector";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fileName, result } = body as {
      fileName?: string;
      result?: AIDetectorResult;
    };

    if (!result || !result.sentences) {
      return NextResponse.json(
        { error: "Dữ liệu phân tích không hợp lệ để tạo báo cáo." },
        { status: 400 }
      );
    }

    const baseName = (fileName || "VanBan_KiemTra.docx")
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF-]/g, "_");
    const outFileName = `[KetQua-CheckAI]_${baseName}.docx`;

    const buffer = await generateAICheckReportDocx({
      fileName: fileName || "VanBan_KiemTra.docx",
      result,
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
    console.error("Export Report error:", err);
    return NextResponse.json(
      { error: err?.message || "Không thể xuất file báo cáo DOCX." },
      { status: 500 }
    );
  }
}
