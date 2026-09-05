/**
 * Gemini AI & Graphify Intelligent Knowledge & Document Analysis Skill
 * Inspired by Google Gemini Skills & Graphify Labs deterministic Knowledge Graphs.
 */

export interface KnowledgeNode {
  id: string;
  label: string;
  type: "concept" | "subject" | "formula" | "exam_tip" | "chapter" | "tool";
  description?: string;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  relation: string;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export interface AIAnalysisResult {
  summary: string;
  keyTakeaways: string[];
  knowledgeGraph: KnowledgeGraphData;
  difficultyScore: number; // 1-10
  estimatedStudyTimeMinutes: number;
  prerequisites: string[];
}

export class GeminiSkillService {
  /**
   * Generates or simulates deterministic Knowledge Graph & AI summaries
   * for study documents or physical items.
   */
  static analyzeDocument(title: string, description: string, category: string): AIAnalysisResult {
    const titleLower = title.toLowerCase();
    
    // Deterministic concept extraction based on keywords
    const nodes: KnowledgeNode[] = [
      { id: "core", label: title.slice(0, 30), type: "subject", description: "Chủ đề cốt lõi của tài liệu" },
      { id: "chap1", label: "Kiến thức nền tảng & Tổng quan", type: "chapter", description: "Các định lý & lý thuyết căn bản" },
      { id: "chap2", label: "Kỹ năng thực hành & Bài tập", type: "concept", description: "Phương pháp giải bài tập nhanh" },
      { id: "tips", label: "Mẹo thi & Ôn luyện điểm cao", type: "exam_tip", description: "Tổng hợp bẫy đề thi & công thức tính nhanh" },
    ];

    const edges: KnowledgeEdge[] = [
      { source: "core", target: "chap1", relation: "bao gồm lý thuyết" },
      { source: "chap1", target: "chap2", relation: "áp dụng vào" },
      { source: "chap2", target: "tips", relation: "tối ưu hóa cho thi cử" },
    ];

    if (titleLower.includes("toán") || titleLower.includes("giải tích") || titleLower.includes("đại số")) {
      nodes.push(
        { id: "formula", label: "Công thức Đạo hàm / Tích phân cốt lõi", type: "formula", description: "Bảng tra cứu công thức" },
        { id: "calc", label: "Kỹ thuật bấm máy Casio / Vinacal", type: "tool", description: "Tips giải nhanh trắc nghiệm 30s" }
      );
      edges.push(
        { source: "chap2", target: "formula", relation: "sử dụng công thức" },
        { source: "tips", target: "calc", relation: "tăng tốc độ làm bài" }
      );
    } else if (titleLower.includes("lập trình") || titleLower.includes("python") || titleLower.includes("web") || titleLower.includes("java")) {
      nodes.push(
        { id: "code", label: "Cấu trúc dữ liệu & Thuật toán", type: "concept", description: "Thuật toán tối ưu Big-O" },
        { id: "project", label: "Source code mẫu & Best Practices", type: "tool", description: "Code sạch và dễ mở rộng" }
      );
      edges.push(
        { source: "chap2", target: "code", relation: "triển khai" },
        { source: "code", target: "project", relation: "xây dựng dự án" }
      );
    } else if (titleLower.includes("kinh tế") || titleLower.includes("marketing") || titleLower.includes("tài chính")) {
      nodes.push(
        { id: "case_study", label: "Case Study thực tế doanh nghiệp", type: "concept", description: "Phân tích số liệu và chiến lược" },
        { id: "framework", label: "Mô hình phân tích (SWOT, 4P, Porter)", type: "tool", description: "Khung tư duy chiến lược" }
      );
      edges.push(
        { source: "chap1", target: "framework", relation: "học lý thuyết mô hình" },
        { source: "chap2", target: "case_study", relation: "thực hành phân tích" }
      );
    }

    const summary = `Tài liệu "${title}" được hệ thống hóa đầy đủ cho sinh viên ngành ${category || "Đại học"}. Bao gồm hệ thống lý thuyết cô đọng, bài tập có lời giải chi tiết và mẹo ôn thi bám sát cấu trúc đề thi chính thức.`;

    const keyTakeaways = [
      "Hệ thống hóa toàn bộ kiến thức trọng tâm ngắn gọn, dễ nhớ.",
      "Bài tập và câu hỏi trắc nghiệm / tự luận có đáp án và giải thích từng bước.",
      "Mẹo làm bài thi, lưu ý các lỗi sai thường gặp để tránh mất điểm đáng tiếc.",
      "Tối ưu hóa thời gian ôn luyện trước kỳ thi chỉ trong 3-7 ngày.",
    ];

    return {
      summary,
      keyTakeaways,
      knowledgeGraph: { nodes, edges },
      difficultyScore: 7.5,
      estimatedStudyTimeMinutes: 180,
      prerequisites: ["Kiến thức nhập môn cơ bản", "Máy tính cá nhân / Máy tính cầm tay"],
    };
  }
}
