import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  Packer,
  Footer,
} from "docx";
import type { AIDetectorResult } from "@/lib/aiDetector";

function createCell(text: string, bold = false, fill?: string, width = 50) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold, size: 20 })] })],
    shading: fill ? { fill } : undefined,
    width: { size: width, type: WidthType.PERCENTAGE },
  });
}

export async function generateAICheckReportDocx(params: {
  fileName?: string;
  result: AIDetectorResult;
}): Promise<Buffer> {
  const { fileName = "VanBan_KiemTra.docx", result } = params;
  const { overallScore, verdict, stats, sentences } = result;
  const scoreText = `${overallScore}%`;
  const isHigh = overallScore >= 70;
  const isMed = overallScore >= 40 && overallScore < 70;
  const statusLabel = isHigh ? "NGUY CƠ CAO (AI)" : isMed ? "TRUNG BÌNH (Khả nghi)" : "AN TOÀN (Người viết)";
  const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });

  const summaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [createCell("TIÊU CHÍ", true, "F1F5F9", 35), createCell("KẾT QUẢ", true, "F1F5F9", 65)] }),
      new TableRow({ children: [createCell("Tên tài liệu", true, undefined, 35), createCell(fileName, false, undefined, 65)] }),
      new TableRow({ children: [createCell("Thời gian kiểm tra", true, undefined, 35), createCell(now, false, undefined, 65)] }),
      new TableRow({
        children: [
          createCell("Xác suất tạo bởi AI", true, undefined, 35),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${scoreText} - ${statusLabel}`,
                    bold: true,
                    color: isHigh ? "DC2626" : isMed ? "D97706" : "16A34A",
                    size: 22,
                  }),
                ],
              }),
            ],
            width: { size: 65, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({ children: [createCell("Đa dạng từ ngữ (Perplexity)", false, undefined, 35), createCell(`${stats.perplexityScore}/100`, false, undefined, 65)] }),
      new TableRow({ children: [createCell("Độ đột biến câu (Burstiness)", false, undefined, 35), createCell(`${stats.burstinessScore}/100`, false, undefined, 65)] }),
      new TableRow({
        children: [
          createCell("Tổng số từ / Số câu", false, undefined, 35),
          createCell(`${stats.wordCount} từ | ${stats.sentenceCount} câu (${stats.aiSentenceCount} câu nghi vấn)`, false, undefined, 65),
        ],
      }),
    ],
  });

  const textRuns: TextRun[] = sentences.map((s) => {
    if (s.aiScore >= 60) {
      return new TextRun({ text: s.text + " ", highlight: "yellow", bold: true, size: 22 });
    } else if (s.aiScore >= 40) {
      return new TextRun({ text: s.text + " ", highlight: "lightGray", size: 22 });
    }
    return new TextRun({ text: s.text + " ", size: 22 });
  });

  const bodyParagraph = new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 300, after: 200 },
    children: textRuns,
  });

  const doc = new Document({
    sections: [
      {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "Báo cáo bởi PKASHOP AI & Plagiarism Hub (taphoapka.shop)", size: 16, color: "94A3B8" })],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({ text: "BÁO CÁO KIỂM TRA ĐẠO VĂN & XÁC SUẤT AI", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 120 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: "Hệ thống phân tích Burstiness & Perplexity - PKASHOP Campus Hub", italics: true, size: 20, color: "64748B" })],
          }),
          new Paragraph({ text: "I. TỔNG QUAN KẾT QUẢ", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
          summaryTable,
          new Paragraph({
            spacing: { before: 160, after: 200 },
            children: [new TextRun({ text: "Nhận định: ", bold: true, size: 20 }), new TextRun({ text: verdict, italics: true, size: 20 })],
          }),
          new Paragraph({ text: "II. NỘI DUNG VĂN BẢN (ĐÁNH DẤU CÂU NGHI VẤN)", heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 100 } }),
          new Paragraph({
            spacing: { after: 150 },
            children: [new TextRun({ text: "Chú thích: Các câu [Tô vàng] là nghi vấn AI cao (>=60%), câu [Tô xám] là khả nghi (40-59%).", size: 18, italics: true, color: "64748B" })],
          }),
          bodyParagraph,
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}


/**
 * Tạo file Word DOCX mới chứa văn bản đã được Humanize (sửa tự nhiên) tương tự tài liệu gốc
 */
export async function generateHumanizedDocx(params: {
  fileName?: string;
  humanizedText: string;
  mode?: string;
}): Promise<Buffer> {
  const { fileName = "VanBan_DaSua.docx", humanizedText, mode = "standard" } = params;

  const modeLabel =
    mode === "academic"
      ? "Phong cách Học thuật & Đề án"
      : mode === "creative"
      ? "Phong cách Sinh động & Diễn đàn"
      : "Phong cách Chuẩn tự nhiên người thật";

  const paragraphs = humanizedText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const paragraphElements: Paragraph[] = paragraphs.map(
    (pText) =>
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: 300, after: 160 },
        children: [
          new TextRun({
            text: pText,
            size: 24,
            font: "Calibri",
          }),
        ],
      })
  );

  const titleText = fileName.replace(/\.[^/.]+$/, "").toUpperCase();

  const doc = new Document({
    sections: [
      {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Văn bản đã được chuẩn hóa tự nhiên bởi PKASHOP Campus AI Hub (taphoapka.shop)",
                    size: 16,
                    color: "94A3B8",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            text: titleText,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `[Đã tối ưu hóa tự nhiên - ${modeLabel}]`,
                italics: true,
                size: 18,
                color: "10B981",
              }),
            ],
          }),
          ...paragraphElements,
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
