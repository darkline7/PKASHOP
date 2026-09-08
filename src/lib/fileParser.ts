import mammoth from "mammoth";

export interface ParsedFileResult {
  text: string;
  wordCount: number;
  fileName: string;
  format: "docx" | "pdf" | "txt" | "md" | "other";
}

/**
 * Trích xuất nội dung văn bản từ buffer file (docx, pdf, txt, md)
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<ParsedFileResult> {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  let extractedText = "";
  let format: ParsedFileResult["format"] = "other";

  if (ext === "docx") {
    format = "docx";
    try {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    } catch (err: any) {
      throw new Error(`Không thể đọc file Word (.docx): ${err?.message || "File bị hỏng hoặc không đúng định dạng"}`);
    }
  } else if (ext === "pdf") {
    format = "pdf";
    try {
      // Dynamic require to prevent bundling issues if on edge
      const { PDFParse } = require("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const pdfResult = await parser.getText();
      extractedText = pdfResult?.text || "";
    } catch (err: any) {
      throw new Error(`Không thể đọc file PDF: ${err?.message || "File bị khóa hoặc định dạng không hỗ trợ"}`);
    }
  } else if (ext === "txt" || ext === "md") {
    format = ext as "txt" | "md";
    try {
      extractedText = buffer.toString("utf-8");
    } catch (err: any) {
      throw new Error(`Không thể đọc file văn bản: ${err?.message || "Mã hóa không hợp lệ"}`);
    }
  } else {
    // Thử đọc như văn bản thường
    try {
      extractedText = buffer.toString("utf-8");
      format = "txt";
    } catch {
      throw new Error("Định dạng file không được hỗ trợ. Vui lòng tải file .docx, .pdf hoặc .txt");
    }
  }

  // Làm sạch ký tự lạ và chuẩn hóa
  const cleanedText = extractedText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const words = cleanedText.split(/\s+/).filter(Boolean);

  return {
    text: cleanedText,
    wordCount: words.length,
    fileName,
    format,
  };
}
