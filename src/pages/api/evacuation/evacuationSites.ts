import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
const prisma = new PrismaClient();

// 緯度経度から2点間の距離を計算
// Haversineの公式を使用
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) {
    res.status(400).json({ error: "Latitude and longitude are required" });
    return;
  }
  try {
    const evacuationSites = await prisma.evacuationSite.findMany();

    //距離を計算して最も近い5件を取得
    const sortedSites = evacuationSites
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((site: any) => ({
        ...site,
        distance: calculateDistance(
          Number(latitude),
          Number(longitude),
          site.latitude,
          site.longitude
        ),
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 5); // 近い順に5件
    console.log(sortedSites);

    res.status(200).json(sortedSites);
  } catch (error) {
    console.error("Error fetching evacuation sites", error);
    res.status(500).json({ error: "Error fetching evacuation sites" });
  }
}
