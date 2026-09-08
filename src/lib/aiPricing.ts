/**
 * PKASHOP - AI Check & Humanize Pricing Engine
 * 
 * Bảng giá chính sách:
 * - Dưới 1.000 từ: Miễn phí hoàn toàn
 * - 1.000 – 5.000 từ: 2.000đ / 1.000 từ
 * - 5.000 – 10.000 từ: 1.500đ / 1.000 từ
 * - 10.000 – 30.000 từ: 1.000đ / 1.000 từ
 * - Trên 30.000 từ: 800đ / 1.000 từ
 */

export interface AICheckPricingTier {
  fee: number;
  ratePerThousand: number;
  thousands: number;
  isFree: boolean;
  tierLabel: string;
  pricePerUnitText: string;
  description: string;
}

export const AI_PRICING_TABLE = [
  { tier: "Dưới 1.000 từ", rate: "Miễn phí", note: "Trải nghiệm không giới hạn" },
  { tier: "1.000 – 5.000 từ", rate: "2.000đ / 1.000 từ", note: "Tiểu luận, bài tập lớn" },
  { tier: "5.000 – 10.000 từ", rate: "1.500đ / 1.000 từ", note: "Báo cáo thực tập, đề án" },
  { tier: "10.000 – 30.000 từ", rate: "1.000đ / 1.000 từ", note: "Khóa luận tốt nghiệp" },
  { tier: "Từ 30.000 từ trở lên", rate: "800đ / 1.000 từ", note: "Luận văn thạc sĩ, sách" },
];

export function calculateAICheckFee(wordCount: number): AICheckPricingTier {
  if (wordCount < 1000) {
    return {
      fee: 0,
      ratePerThousand: 0,
      thousands: 0,
      isFree: true,
      tierLabel: "Dưới 1.000 từ",
      pricePerUnitText: "Miễn phí",
      description: "Miễn phí",
    };
  }

  const thousands = Math.max(1, Math.ceil(wordCount / 1000));

  if (wordCount <= 5000) {
    const rate = 2000;
    return {
      fee: thousands * rate,
      ratePerThousand: rate,
      thousands,
      isFree: false,
      tierLabel: "1.000 – 5.000 từ",
      pricePerUnitText: "2.000đ / 1.000 từ",
      description: `${(thousands * rate).toLocaleString("vi-VN")}đ (2.000đ/1.000 từ)`,
    };
  }

  if (wordCount <= 10000) {
    const rate = 1500;
    return {
      fee: thousands * rate,
      ratePerThousand: rate,
      thousands,
      isFree: false,
      tierLabel: "5.000 – 10.000 từ",
      pricePerUnitText: "1.500đ / 1.000 từ",
      description: `${(thousands * rate).toLocaleString("vi-VN")}đ (1.500đ/1.000 từ)`,
    };
  }

  if (wordCount <= 30000) {
    const rate = 1000;
    return {
      fee: thousands * rate,
      ratePerThousand: rate,
      thousands,
      isFree: false,
      tierLabel: "10.000 – 30.000 từ",
      pricePerUnitText: "1.000đ / 1.000 từ",
      description: `${(thousands * rate).toLocaleString("vi-VN")}đ (1.000đ/1.000 từ)`,
    };
  }

  const rate = 800;
  return {
    fee: thousands * rate,
    ratePerThousand: rate,
    thousands,
    isFree: false,
    tierLabel: "Trên 30.000 từ",
    pricePerUnitText: "800đ / 1.000 từ",
    description: `${(thousands * rate).toLocaleString("vi-VN")}đ (800đ/1.000 từ)`,
  };
}
