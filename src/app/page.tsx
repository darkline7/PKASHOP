import prisma from "@/lib/prisma";
import HomePage from "./HomeContent";

export const dynamic = "force-dynamic";
export const revalidate = 60; // ISR: regenerate every 60s

async function getHomeData() {
  const [featured, latest, categories, popupSettings] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { seller: { select: { id: true, name: true, avatar: true } }, category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { seller: { select: { id: true, name: true, avatar: true } }, category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true, icon: true, description: true, type: true, order: true },
    }),
    prisma.systemSetting.findMany({
      where: { key: { in: ["home_popup_enabled", "home_popup_title", "home_popup_content"] } },
    }),
  ]);

  const popupMap: Record<string, string> = {};
  popupSettings.forEach((s) => { popupMap[s.key] = s.value; });

  return {
    featured: JSON.parse(JSON.stringify(featured)),
    latest: JSON.parse(JSON.stringify(latest)),
    categories: JSON.parse(JSON.stringify(categories)),
    popupConfig: {
      enabled: popupMap["home_popup_enabled"] !== "false",
      title: popupMap["home_popup_title"] || "QUY ĐỊNH & CẨM NANG SỬ DỤNG AN TOÀN",
      content: popupMap["home_popup_content"] || "",
    },
  };
}

export default async function Page() {
  const data = await getHomeData();
  return (
    <HomePage
      initialFeatured={data.featured}
      initialLatest={data.latest}
      initialCategories={data.categories}
      popupConfig={data.popupConfig}
    />
  );
}
