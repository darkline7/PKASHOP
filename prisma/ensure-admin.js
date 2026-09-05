const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function ensureAdmin() {
  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: "admin@pkashop.vn" }, { role: "ADMIN" }],
      },
    });

    if (existing) {
      console.log("✅ Admin account exists:", existing.email);
      return;
    }

    const passwordHash = await bcrypt.hash("123456", 10);
    const admin = await prisma.user.create({
      data: {
        email: "admin@pkashop.vn",
        username: "admin_pkashop",
        password: passwordHash,
        name: "Quản Trị Viên (Admin)",
        role: "ADMIN",
        isVerified: true,
        walletBalance: 10000000,
      },
    });
    console.log("✅ Created default Admin account:", admin.email);
  } catch (err) {
    console.error("Error ensuring admin:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

ensureAdmin();
