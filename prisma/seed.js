const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed database for PKASHOP...");

  await prisma.report.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash("123456", 10);

  console.log("Creating users...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@pkashop.vn",
      username: "admin_pkashop",
      password: passwordHash,
      name: "Nguyễn Quản Trị (Admin)",
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Quản trị viên hệ thống PKASHOP - Hỗ trợ sinh viên 24/7",
      university: "Đại học Bách Khoa",
      faculty: "Khoa Học Máy Tính",
      city: "Hà Nội",
      isVerified: true,
      walletBalance: 2500000,
    },
  });

  const seller1 = await prisma.user.create({
    data: {
      email: "bk.khoa@gmail.com",
      username: "khoa_bachkhoa",
      password: passwordHash,
      name: "Trần Anh Khoa",
      role: "USER",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      bio: "Sinh viên năm 4 Kỹ Thuật Máy Tính ĐHBK. Chia sẻ full đề thi & giáo trình A+ Giải tích, C++, Next.js.",
      university: "Đại học Bách Khoa Hà Nội (HUST)",
      faculty: "Viện CNTT & TT",
      city: "Hà Nội",
      isVerified: true,
      rating: 4.9,
      totalSales: 156,
      totalReviews: 89,
      walletBalance: 4250000,
      bankName: "MB Bank",
      bankAccount: "999988887777",
      bankAccountName: "TRAN ANH KHOA",
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: "lan.neu@gmail.com",
      username: "lan_kinhte",
      password: passwordHash,
      name: "Nguyễn Mai Lan",
      role: "USER",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      bio: "Thủ khoa đầu ra Kinh Tế Quốc Dân. Tổng hợp slide, tóm tắt sách Kinh tế vi mô, Marketing.",
      university: "Đại học Kinh Tế Quốc Dân (NEU)",
      faculty: "Khoa Marketing",
      city: "Hà Nội",
      isVerified: true,
      rating: 5.0,
      totalSales: 210,
      totalReviews: 134,
      walletBalance: 6180000,
      bankName: "Vietcombank",
      bankAccount: "1012345678",
      bankAccountName: "NGUYEN MAI LAN",
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      email: "student@pkashop.vn",
      username: "sinhvien_k68",
      password: passwordHash,
      name: "Lê Hoàng Nam",
      role: "USER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      bio: "Tân sinh viên Bách Khoa K68, cần tìm giáo trình và mua pass máy tính Casio fx-580.",
      university: "Đại học Bách Khoa Hà Nội",
      faculty: "Điện tử Viễn thông",
      city: "Hà Nội",
      isVerified: true,
      walletBalance: 500000,
    },
  });
  console.log("Creating categories...");
  const catDocs = await prisma.category.create({
    data: {
      name: "Tài liệu học tập",
      slug: "tai-lieu-hoc-tap",
      description: "Đề thi, slide bài giảng, tóm tắt kiến thức các trường ĐH",
      icon: "📚",
      type: "DOCUMENT",
      order: 1,
    },
  });

  const catBooks = await prisma.category.create({
    data: {
      name: "Giáo trình & Sách",
      slug: "giao-trinh-sach",
      description: "Sách giáo trình đại học, sách tham khảo, tài liệu photo",
      icon: "📖",
      type: "PHYSICAL",
      order: 2,
    },
  });

  const catElectronics = await prisma.category.create({
    data: {
      name: "Đồ điện tử & Máy tính",
      slug: "do-dien-tu",
      description: "Máy tính cầm tay Casio, chuột, bàn phím, laptop pass lại",
      icon: "💻",
      type: "PHYSICAL",
      order: 3,
    },
  });

  console.log("Creating products...");
  const p1 = await prisma.product.create({
    data: {
      title: "Full Bộ Đề Thi + Lời Giải Chi Tiết Giải Tích 1 - HUST (2020-2025)",
      slug: "full-bo-de-thi-loi-giai-chi-tiet-giai-tich-1-hust",
      description: "Tổng hợp 20 bộ đề thi giữa kỳ và cuối kỳ môn Giải tích 1 ĐHBK Hà Nội. Kèm theo hướng dẫn giải chi tiết từng bước, mẹo bấm máy tính Casio chống điểm liệt, chuẩn A+.",
      price: 35000,
      originalPrice: 70000,
      type: "DOCUMENT",
      condition: "NEW",
      status: "ACTIVE",
      views: 1240,
      downloads: 142,
      soldCount: 98,
      rating: 4.9,
      totalReviews: 24,
      university: "Đại học Bách Khoa Hà Nội",
      faculty: "Viện Toán ứng dụng & Tin học",
      courseCode: "MI1110",
      semester: "Kỳ 2024.1",
      city: "Hà Nội",
      thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
      images: JSON.stringify(["https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80"]),
      documentUrl: "https://example.com/files/giai-tich-1-hust.pdf",
      fileFormat: "PDF",
      fileSize: 15400000,
      pageCount: 168,
      isFeatured: true,
      tags: JSON.stringify(["HUST", "Giải tích 1", "Đề thi", "A+"]),
      aiSummary: "Tài liệu hệ thống hóa toàn bộ kiến thức Giải tích 1 gồm: Giới hạn dãy số, Đạo hàm vi phân, Tích phân suy rộng, Chuỗi số.",
      aiKeyTakeaways: JSON.stringify(["Trọng tâm phần Khảo sát hàm số & Tích phân", "Phương pháp đặt ẩn phụ và từng phần nâng cao"]),
      sellerId: seller1.id,
      categoryId: catDocs.id,
    },
  });

  const p2 = await prisma.product.create({
    data: {
      title: "Slide bài giảng + Tóm tắt cốt lõi Kinh Tế Vi Mô (Chuẩn NEU)",
      slug: "slide-bai-giang-tom-tat-kinh-te-vi-mo-neu",
      description: "Tổng hợp toàn bộ kiến thức Kinh tế vi mô bao quát 10 chương: Cung cầu, Độ co giãn, Lý thuyết người tiêu dùng, Cấu trúc thị trường.",
      price: 29000,
      originalPrice: 50000,
      type: "DOCUMENT",
      condition: "NEW",
      status: "ACTIVE",
      views: 890,
      downloads: 95,
      soldCount: 67,
      rating: 5.0,
      totalReviews: 18,
      university: "Đại học Kinh Tế Quốc Dân",
      faculty: "Khoa Kinh tế học",
      courseCode: "ECO101",
      semester: "Kỳ 2024.2",
      city: "Hà Nội",
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80",
      images: JSON.stringify(["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80"]),
      documentUrl: "https://example.com/files/vi-mo-neu.pdf",
      fileFormat: "PDF",
      fileSize: 8200000,
      pageCount: 85,
      isFeatured: true,
      tags: JSON.stringify(["NEU", "Kinh tế vi mô", "Cung cầu", "Tóm tắt"]),
      aiSummary: "Bản tóm tắt trực quan sơ đồ tư duy Mindmap, giải thích bản chất đồ thị kinh tế.",
      aiKeyTakeaways: JSON.stringify(["Bản chất độ co giãn của cầu theo giá", "Nguyên lý cân bằng tiêu dùng"]),
      sellerId: seller2.id,
      categoryId: catDocs.id,
    },
  });

  const p3 = await prisma.product.create({
    data: {
      title: "Pass Máy tính Casio fx-580VN X chính hãng Bitex mới 98%",
      slug: "pass-may-tinh-casio-fx-580vn-x-chinh-hang",
      description: "Mình vừa bảo vệ xong tốt nghiệp nên pass lại máy tính Casio fx-580VN X mua tại Bitex còn tem nguyên bản, màn hình sáng đẹp không trầy xước, phím nảy êm ru.",
      price: 420000,
      originalPrice: 650000,
      type: "PHYSICAL",
      condition: "LIKE_NEW",
      status: "ACTIVE",
      views: 1560,
      soldCount: 0,
      rating: 5.0,
      totalReviews: 3,
      university: "Đại học Bách Khoa Hà Nội",
      city: "Hà Nội",
      address: "Tạ Quang Bửu, Hai Bà Trưng, Hà Nội",
      thumbnail: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
      images: JSON.stringify(["https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80"]),
      isFeatured: true,
      tags: JSON.stringify(["Casio", "fx-580VN", "Máy tính", "Pass đồ"]),
      sellerId: seller1.id,
      categoryId: catElectronics.id,
    },
  });

  console.log("Creating reviews and notifications...");
  await prisma.review.create({
    data: {
      userId: buyer1.id,
      productId: p1.id,
      rating: 5,
      comment: "Tài liệu cực kỳ tâm huyết và dễ hiểu! Nhờ bộ này mà mình qua môn Giải tích 1 điểm A.",
    },
  });

  await prisma.notification.create({
    data: {
      userId: buyer1.id,
      title: "Chào mừng bạn đến với PKASHOP!",
      message: "Chúc bạn tìm được những tài liệu và sản phẩm ưng ý với giá sinh viên.",
      type: "SYSTEM",
      link: "/marketplace",
    },
  });

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

