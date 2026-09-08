import { NextResponse } from "next/server";
import { extractTextFromBuffer } from "@/lib/fileParser";

export const maxDuration = 30; // 30s timeout
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Vui lòng chọn file tải lên." }, { status: 400 });
    }

    // Giới hạn 20MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Kích thước file vượt quá giới hạn 20MB. Vui lòng chọn file nhỏ hơn." },
        { status: 400 }
      );
    }

    const fileName = file.name || "tailieu.docx";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await extractTextFromBuffer(buffer, fileName);

    if (!parsed.text || parsed.text.trim().length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy nội dung văn bản trong file tải lên." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: parsed.text,
      wordCount: parsed.wordCount,
      fileName: parsed.fileName,
      format: parsed.format,
      fileSize: file.size,
    });
  } catch (err: any) {
    console.error("File Parse API error:", err);
    return NextResponse.json(
      { error: err?.message || "Lỗi khi xử lý file tải lên." },
      { status: 500 }
    );
  }
}
