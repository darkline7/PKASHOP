import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  MapPin,
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
                <span>Nguyễn Trác, Dương Nội, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <a href="mailto:taphoapka.edu@gmail.com" className="hover:text-primary-600 transition-colors">
                  taphoapka.edu@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Thanh toan an toan */}
          <div className="pt-2 md:pt-4">
            <p className="text-xs font-semibold text-foreground mb-2.5">Phương thức thanh toán an toàn:</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground font-medium">
              <span className="px-3 py-1 rounded-lg bg-muted border border-border/60">VietQR</span>
              <span className="px-3 py-1 rounded-lg bg-muted border border-border/60">Momo</span>
              <span className="px-3 py-1 rounded-lg bg-muted border border-border/60">Ví PKASHOP</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-border/60 mt-8 pt-6 flex items-center justify-center text-xs text-muted-foreground text-center">
          <p>© {new Date().getFullYear()} PKASHOP Campus Hub. Bản quyền thuộc về PKASHOP.</p>
        </div>
      </div>
    </footer>
  );
}
