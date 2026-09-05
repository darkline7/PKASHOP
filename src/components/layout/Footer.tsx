import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  FileText,
  BookOpen,
  GraduationCap,
  Sparkles,
  Zap,
  Lock,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/80 bg-card/60 backdrop-blur-sm mt-auto pb-16 md:pb-8">
      {/* Top trust banner */}
      <div className="border-b border-border/60 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-500/10 text-primary-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground">Giao dịch 100% bảo đảm</h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Tiền giữ trong ví, chỉ chuyển khi nhận file</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground">Tải tài liệu tức thì</h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Truy cập file & tải về ngay sau thanh toán</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground">Bảo mật thông tin</h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Mã hóa chuẩn ngân hàng, an toàn tuyệt đối</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-3.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground">Cộng đồng sinh viên</h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Hơn 50+ trường ĐH tham gia mua bán & pass đồ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
          {/* Brand Col */}
          <div className="col-span-2 space-y-3 sm:space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-black text-base tracking-wider">PKA</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-foreground flex items-center">
                  PKA<span className="text-primary-600">SHOP</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase -mt-1">
                  Student Campus Hub
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
              Nền tảng chia sẻ tài liệu học tập, giáo trình, đề thi và pass đồ dùng học tập số 1 dành cho sinh viên Phenikaa và các trường Đại học tại Việt Nam.
            </p>

            <div className="space-y-1.5 sm:space-y-2 pt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <span>Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <span>hotro@pkashop.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <span>1900 8888 (8:00 - 22:00 hàng ngày)</span>
              </div>
            </div>
          </div>

          {/* Col 1: Tài liệu */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground mb-4">
              Tài nguyên học tập
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/marketplace?type=DOCUMENT" className="hover:text-primary-600 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-primary-500" />
                  <span>Tài liệu môn học</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=de-thi" className="hover:text-primary-600 transition-colors flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Đề thi & Lời giải</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=giao-trinh" className="hover:text-primary-600 transition-colors flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>Giáo trình đại học</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=pass-do" className="hover:text-primary-600 transition-colors">
                  Pass đồ & Thiết bị học tập
                </Link>
              </li>
              <li>
                <Link href="/marketplace?sort=bestselling" className="hover:text-primary-600 transition-colors">
                  Tài liệu bán chạy nhất
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Về PKASHOP */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground mb-4">
              Về PKASHOP
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary-600 transition-colors">
                  Giới thiệu nền tảng
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-600 transition-colors">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-600 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/policy" className="hover:text-primary-600 transition-colors">
                  Quy chế người bán & mua
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-primary-600 transition-colors">
                  Kênh đăng ký người bán
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hỗ trợ & Thanh toán */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground mb-4">
              Hỗ trợ sinh viên
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/marketplace" className="hover:text-primary-600 transition-colors flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-primary-500" />
                  <span>Trung tâm trợ giúp</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-primary-600 transition-colors">
                  Hướng dẫn tải tài liệu
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:text-primary-600 transition-colors">
                  Hướng dẫn kiếm tiền tài liệu
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="hover:text-primary-600 transition-colors">
                  Nạp tiền &amp; Rút về ngân hàng
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-primary-600 transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-border/60">
              <p className="text-[11px] font-semibold text-foreground mb-2">Thanh toán an toàn:</p>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-muted-foreground font-medium">
                <span className="px-2 py-0.5 rounded bg-muted border border-border/60">VietQR</span>
                <span className="px-2 py-0.5 rounded bg-muted border border-border/60">Momo</span>
                <span className="px-2 py-0.5 rounded bg-muted border border-border/60">Ví PKASHOP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-border/60 mt-8 sm:mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
          <p>© {new Date().getFullYear()} PKASHOP Campus Hub. Bản quyền thuộc về PKASHOP.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/marketplace" className="hover:text-foreground transition-colors">Điều khoản</Link>
            <span>•</span>
            <Link href="/marketplace" className="hover:text-foreground transition-colors">Bảo mật</Link>
            <span>•</span>
            <Link href="/marketplace" className="hover:text-foreground transition-colors">Trợ giúp</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
