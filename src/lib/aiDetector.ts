import prisma from "@/lib/prisma";

export interface SentenceAnalysis {
  id: number;
  text: string;
  wordCount: number;
  aiScore: number; // 0 - 100
  severity: "high" | "medium" | "low";
  reason: string;
  suggestion: string;
}

export interface AIDetectorResult {
  overallScore: number; // 0 - 100
  isAiGenerated: boolean;
  label: string;
  verdict: string;
  stats: {
    wordCount: number;
    sentenceCount: number;
    aiSentenceCount: number;
    perplexityScore: number;
    burstinessScore: number;
    readingTimeMinutes: number;
  };
  sentences: SentenceAnalysis[];
}

// Cụm từ và cấu trúc đặc trưng thường xuyên xuất hiện trong văn bản AI (ChatGPT, Gemini, Claude)
const AI_COMMON_PATTERNS = [
  // Tiếng Việt
  /\b(tóm lại|nhìn chung|có thể thấy rằng|không thể phủ nhận rằng|đóng vai trò quan trọng|hơn nữa|bên cạnh đó|ngoài ra|đáng chú ý là|cần phải lưu ý rằng|một mặt|mặt khác|trong bối cảnh hiện nay|ngày càng trở nên phổ biến|mang lại nhiều lợi ích|góp phần không nhỏ|là một trong những|chúng ta có thể kết luận|điều này dẫn đến|tổng kết lại|đặc biệt là|như đã đề cập|chính vì vậy|từ đó cho thấy)\b/gi,
  // Tiếng Anh
  /\b(in conclusion|furthermore|moreover|it is important to note|plays a crucial role|in today's world|it is worth noting|on the other hand|on the one hand|as mentioned earlier|not only but also|consequently|delve into|testament to|vital role|fosters a|navigating the|ever-evolving)\b/gi,
];

// Từ vựng học thuật hoặc khuôn sáo AI
const AI_BUZZWORDS = [
  "toàn diện", "tối ưu", "cốt lõi", "bền vững", "tiềm năng", "đột phá", "sâu sắc", 
  "nền tảng", "thúc đẩy", "lan tỏa", "chìa khóa", "cột mốc", "hiệu quả cao", 
  "crucial", "essential", "dynamic", "pivotal", "paradigm", "leverage", "showcase", "seamlessly"
];

/**
 * Làm sạch văn bản: Loại bỏ thẻ HTML, chuẩn hóa dấu cách và ký tự xuống dòng
 */
export function cleanText(input: string): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Tách câu tiếng Việt / tiếng Anh an toàn không ngắt nhầm từ viết tắt và số
 */
export function splitSentences(text: string): string[] {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const safeText = cleaned
    .replace(/(\d+)\.(\d+)/g, "$1___DOT___$2")
    .replace(/\b(TP|PGS|TS|ThS|BS|Th\.S|P\.GS|GS|TS\.BS|St|Mr|Ms|Mrs|Dr|Prof|e\.g|i\.e|v\.v)\./gi, "$1___ABBR___");

  const rawParts = safeText.split(/(?<=[.?!])\s+|\n+/);

  const sentences: string[] = [];
  for (const part of rawParts) {
    const restored = part
      .replace(/___DOT___/g, ".")
      .replace(/___ABBR___/g, ".")
      .trim();
    if (restored.length > 2) {
      sentences.push(restored);
    }
  }

  return sentences;
}

/**
 * Tính điểm Burstiness (Độ biến thiên độ dài và cấu trúc câu)
 */
function calculateBurstiness(sentenceWordCounts: number[]): number {
  if (sentenceWordCounts.length <= 1) return 50;

  const mean = sentenceWordCounts.reduce((a, b) => a + b, 0) / sentenceWordCounts.length;
  const variance = sentenceWordCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sentenceWordCounts.length;
  const stdDev = Math.sqrt(variance);

  const cv = mean > 0 ? stdDev / mean : 0;
  let score = Math.min(100, Math.round(cv * 110));
  return Math.max(10, score);
}

/**
 * Tạo gợi ý viết lại câu nhẹ nhàng, phá bỏ khuôn mẫu AI
 */
export function generateSentenceSuggestion(sentence: string): string {
  let rewritten = sentence;

  const replacements: [RegExp, string][] = [
    [/\bĐóng vai trò quan trọng trong việc\b/gi, "Rất cần thiết để"],
    [/\bKhông thể phủ nhận rằng\b/gi, "Rõ ràng là"],
    [/\bCó thể thấy rằng\b/gi, "Thực tế cho thấy"],
    [/\bĐáng chú ý là\b/gi, "Đặc biệt,"],
    [/\bNhìn chung,\s*/gi, ""],
    [/\bTóm lại,\s*/gi, "Nói ngắn gọn,"],
    [/\bHơn nữa,\s*/gi, "Ngoài ra,"],
    [/\bBên cạnh đó,\s*/gi, "Thêm vào đó,"],
    [/\bNgày càng trở nên phổ biến\b/gi, "ngày càng quen thuộc hơn"],
    [/\bMang lại nhiều lợi ích\b/gi, "giúp ích rất nhiều"],
    [/\bIn conclusion,\s*/gi, "In short,"],
    [/\bFurthermore,\s*/gi, "Also,"],
    [/\bMoreover,\s*/gi, "Besides,"],
    [/\bPlays a crucial role in\b/gi, "is key to"],
  ];

  for (const [pattern, repl] of replacements) {
    rewritten = rewritten.replace(pattern, repl);
  }

  if (rewritten === sentence) {
    if (sentence.length > 70 && sentence.includes(",")) {
      const parts = sentence.split(",");
      return `${parts[0].trim()}. Hơn nữa, ${parts.slice(1).join(",").trim()}`;
    }
  }

  return rewritten;
}

/**
 * Phân tích độ dễ đoán (Perplexity) dựa trên sự lặp từ vựng và các từ nối AI
 */
function calculateSentenceScore(
  sentence: string,
  wordCount: number,
  avgWordCount: number
): { score: number; reason: string; suggestion: string } {
  let score = 25;
  const reasons: string[] = [];

  let patternMatches = 0;
  for (const pattern of AI_COMMON_PATTERNS) {
    const matches = sentence.match(pattern);
    if (matches) patternMatches += matches.length;
  }

  if (patternMatches >= 2) {
    score += 40;
    reasons.push("Sử dụng nhiều từ nối khuôn mẫu của AI (" + patternMatches + " cụm)");
  } else if (patternMatches === 1) {
    score += 25;
    reasons.push("Có từ ngữ chuyển ý khuôn sáo thường thấy ở LLM");
  }

  let buzzwordCount = 0;
  const lower = sentence.toLowerCase();
  for (const bw of AI_BUZZWORDS) {
    if (lower.includes(bw)) buzzwordCount++;
  }

  if (buzzwordCount >= 2) {
    score += 20;
    reasons.push("Dùng từ vựng khái quát, tính từ phóng đại mang phong cách máy móc");
  }

  if (wordCount >= 18 && wordCount <= 28) {
    score += 15;
  }

  if (avgWordCount > 0 && Math.abs(wordCount - avgWordCount) < 3 && wordCount > 12) {
    score += 10;
    if (reasons.length === 0) reasons.push("Nhịp điệu câu quá đều đặn, thiếu đột biến tự nhiên");
  }

  if (/\b(được|bị|đóng vai trò là|được xem như|được coi là|is considered|is characterized by)\b/i.test(sentence)) {
    score += 10;
  }

  score = Math.min(98, Math.max(5, score));

  if (reasons.length === 0) {
    if (score >= 60) {
      reasons.push("Cấu trúc ngữ pháp hoàn hảo bất thường, thiếu tính ngẫu nhiên");
    } else {
      reasons.push("Văn phong tương đối tự nhiên");
    }
  }

  const suggestion = generateSentenceSuggestion(sentence);

  return {
    score,
    reason: reasons.join(". "),
    suggestion,
  };
}

/**
 * Hàm phân tích chính: Check AI toàn bộ văn bản
 */
export async function detectAIText(rawText: string): Promise<AIDetectorResult> {
  const cleaned = cleanText(rawText);
  const words = cleaned.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const rawSentences = splitSentences(cleaned);
  const sentenceCount = rawSentences.length;

  if (wordCount < 10 || sentenceCount === 0) {
    return {
      overallScore: 0,
      isAiGenerated: false,
      label: "Văn bản quá ngắn",
      verdict: "Vui lòng nhập văn bản tối thiểu 15 từ để AI phân tích chuẩn xác.",
      stats: {
        wordCount,
        sentenceCount,
        aiSentenceCount: 0,
        perplexityScore: 100,
        burstinessScore: 100,
        readingTimeMinutes: 1,
      },
      sentences: [],
    };
  }

  const sentenceWordCounts = rawSentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const avgSentenceLength = wordCount / sentenceCount;
  const burstiness = calculateBurstiness(sentenceWordCounts);

  let totalAiScore = 0;
  let aiSentenceCount = 0;

  const analyzedSentences: SentenceAnalysis[] = rawSentences.map((s, idx) => {
    const sWords = sentenceWordCounts[idx];
    const { score, reason, suggestion } = calculateSentenceScore(s, sWords, avgSentenceLength);

    let adjustedScore = score;
    if (burstiness < 40) {
      adjustedScore = Math.min(99, score + 12);
    } else if (burstiness > 70) {
      adjustedScore = Math.max(5, score - 10);
    }

    totalAiScore += adjustedScore;
    if (adjustedScore >= 65) {
      aiSentenceCount++;
    }

    const severity = adjustedScore >= 75 ? "high" : adjustedScore >= 50 ? "medium" : "low";

    return {
      id: idx + 1,
      text: s,
      wordCount: sWords,
      aiScore: adjustedScore,
      severity,
      reason,
      suggestion,
    };
  });

  let rawOverallScore = Math.round(totalAiScore / sentenceCount);

  const aiRatio = aiSentenceCount / sentenceCount;
  if (aiRatio > 0.6) {
    rawOverallScore = Math.max(rawOverallScore, Math.round(aiRatio * 100));
  }

  const overallScore = Math.min(99, Math.max(2, rawOverallScore));
  const isAiGenerated = overallScore >= 65;

  let label = "Văn bản người viết tự nhiên";
  let verdict = "Bài viết có nhịp điệu phong phú, cấu trúc câu đa dạng tự nhiên, không có dấu vết AI.";

  if (overallScore >= 75) {
    label = "Khả năng cao do AI tạo (ChatGPT / Gemini / Claude)";
    verdict = `Bài viết có xác suất AI lên đến ${overallScore}%. Cấu trúc câu có tính lặp lại cao, ít đột biến nhịp điệu và xuất hiện nhiều từ nối quen thuộc của AI.`;
  } else if (overallScore >= 45) {
    label = "Văn bản kết hợp Người & AI (Hỗn hợp)";
    verdict = `Bài viết có khoảng ${overallScore}% nội dung mang phong cách AI. Có thể người dùng đã dùng AI để viết khung ý tưởng và chỉnh sửa lại một phần.`;
  }

  return {
    overallScore,
    isAiGenerated,
    label,
    verdict,
    stats: {
      wordCount,
      sentenceCount,
      aiSentenceCount,
      perplexityScore: Math.max(15, 100 - overallScore),
      burstinessScore: burstiness,
      readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
    },
    sentences: analyzedSentences,
  };
}


/**
 * Viết lại văn bản bằng Generative AI (Google Gemini API hoặc bộ biến đổi tự nhiên NLP)
 */
export async function humanizeText(
  input: string,
  mode: "standard" | "academic" | "creative" = "standard"
): Promise<{ humanized: string; originalWordCount: number; newWordCount: number }> {
  const cleaned = cleanText(input);
  const words = cleaned.split(/\s+/).filter(Boolean);

  let geminiApiKey = process.env.GEMINI_API_KEY || "";
  if (!geminiApiKey) {
    try {
      const setting = await prisma.systemSetting.findFirst({
        where: { key: "gemini_api_key" },
      });
      if (setting?.value) geminiApiKey = setting.value;
    } catch {
      // ignore
    }
  }

  if (geminiApiKey) {
    try {
      const modePrompt =
        mode === "academic"
          ? "giữ tính học thuật, chuyên môn nhưng diễn đạt tự nhiên theo văn phong của nghiên cứu sinh, xóa bỏ các từ nối sáo rỗng"
          : mode === "creative"
          ? "giọng văn sinh động, đa dạng hóa nhịp điệu câu phong phú"
          : "văn phong tự nhiên, chân thật của con người, phá vỡ cấu trúc câu máy móc của AI";

      const prompt = `Bạn là một chuyên gia hiệu đính ngôn ngữ. Hãy viết lại (Humanize) văn bản dưới đây để nghe hoàn toàn tự nhiên như người thật viết và vượt qua các bộ lọc AI (Turnitin, GPTZero, Copyleaks).
Yêu cầu:
1. ${modePrompt}.
2. Giữ nguyên ý nghĩa cốt lõi và nội dung thông tin.
3. Đan xen câu ngắn và câu dài nhịp nhàng.
4. Tuyệt đối KHÔNG dùng các từ nối máy móc như: "tóm lại", "hơn nữa", "bên cạnh đó", "có thể thấy rằng", "không thể phủ nhận rằng", "đóng vai trò quan trọng".
5. Chỉ trả về duy nhất nội dung văn bản đã viết lại, KHÔNG kèm giải thích hay lời mở đầu.

Văn bản gốc:
"""
${cleaned}
"""`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.85,
              topP: 0.95,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate && candidate.trim()) {
          const humanized = cleanText(candidate);
          const newWordCount = humanized.split(/\s+/).filter(Boolean).length;
          return {
            humanized,
            originalWordCount: words.length,
            newWordCount,
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to heuristic humanizer:", err);
    }
  }

  // Heuristic Naturalizer Fallback nếu chưa có Gemini Key
  const sentences = splitSentences(cleaned);
  const rewrittenSentences = sentences.map((s) => generateSentenceSuggestion(s));
  const humanized = rewrittenSentences.join(" ");

  return {
    humanized,
    originalWordCount: words.length,
    newWordCount: humanized.split(/\s+/).filter(Boolean).length,
  };
}

