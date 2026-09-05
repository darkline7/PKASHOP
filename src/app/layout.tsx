import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: {
    default: "PKASHOP - Kho tài liệu & đồ dùng học tập cho sinh viên",
    template: "%s | PKASHOP",
  },
  description: "Nền tảng marketplace tài liệu học tập và pass đồ dành cho sinh viên. Mua bán tài liệu, giáo trình, đề thi, đồ dùng học tập với giá tốt nhất.",
  keywords: ["tài liệu học tập", "pass đồ sinh viên", "marketplace sinh viên", "giáo trình", "đề thi"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "PKASHOP",
    title: "PKASHOP - Kho tài liệu & đồ dùng học tập cho sinh viên",
    description: "Nền tảng marketplace tài liệu học tập và pass đồ dành cho sinh viên",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}

function AppWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
