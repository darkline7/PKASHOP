import prisma from "@/lib/prisma";
import HomePage from "./HomeContent";

export const dynamic = "force-dynamic";
export const revalidate = 60; // ISR: regenerate every 60s

async function getHomeData() {
  const [featured, latest, categories] = await Promise.all([
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
  ]);
  return {
    featured: JSON.parse(JSON.stringify(featured)),
    latest: JSON.parse(JSON.stringify(latest)),
    categories: JSON.parse(JSON.stringify(categories)),
  };
}

export default async function Page() {
  const data = await getHomeData();
  return <HomePage initialFeatured={data.featured} initialLatest={data.latest} initialCategories={data.categories} />;
}
