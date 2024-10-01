import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { calculateDistance } from "./evacuationSites";
const prisma = new PrismaClient();

// 災害キーワード
const disasterKeywords = {
  flood: ["洪水", "大雨", "川の氾濫"],
  landslide: ["崖崩れ", "土砂崩れ", "地滑り"],
  stormSurge: ["高潮", "台風の影響", "嵐"],
  earthquake: ["地震", "余震", "震災"],
  tsunami: ["津波", "海の波"],
  largeFire: ["火事", "大火災"],
  inlandFlooding: ["内水氾濫", "豪雨"],
  volcanicPhenomenon: ["火山", "噴火"],
  elevatorOrGroundFloor: ["エレベーター", "避難スペース", "1階"],
  slope: ["スロープ", "段差"],
  tactilePaving: ["点字ブロック", "視覚障害"],
  accessibleToilet: ["車椅子対応トイレ", "バリアフリー"],
};

// 質問から災害タイプを抽出
const extractDisasterType = (question: string) => {
  const disasterType = {
    flood: false,
    landslide: false,
    stormSurge: false,
    earthquake: false,
    tsunami: false,
    largeFire: false,
    inlandFlooding: false,
    volcanicPhenomenon: false,
    elevatorOrGroundFloor: false,
    slope: false,
    tactilePaving: false,
    accessibleToilet: false,
  };

  Object.entries(disasterKeywords).forEach(([key, keywords]) => {
    keywords.forEach((keyword) => {
      if (question.includes(keyword)) {
        disasterType[key as keyof typeof disasterType] = true;
      }
    });
  });

  return disasterType;
};

// フィルタ条件を構築
const buildFilterQuery = (disasterType: { [key: string]: boolean }) => {
  const filters: { [key: string]: boolean } = {};

  // disasterType オブジェクトの各キーについて、true の項目のみフィルタに追加
  Object.entries(disasterType).forEach(([key, value]) => {
    if (value) {
      filters[key] = true;
    }
  });

  return filters;
};

// const OpenAIAPIKey = process.env.OPENAI_API_KEY;
// const BasePath = process.env.OPENAI_BASE_PATH;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ message: "POSTメソッドのみ許可されています" });
  }

  const { latitude, longitude, question } = req.body;

  if (!latitude || !longitude || !question) {
    return res.status(400).json({ message: "質問、緯度、経度は必須です" });
  }

  try {
    // 質問から災害タイプを抽出
    const disasterType = extractDisasterType(question as string);
    console.log("disasterType: ", disasterType);

    // フィルタ条件を構築
    const filters = buildFilterQuery(disasterType);

    // フィルタ条件を使って避難所を取得
    const evacuationSites = await prisma.evacuationSite.findMany({
      where: filters,
    });

    // ユーザーの現在位置から近い順にソート
    const sortedSites = evacuationSites
      .map((site) => ({
        ...site,
        distance: calculateDistance(
          Number(latitude),
          Number(longitude),
          site.latitude,
          site.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5); // 近い順に5件

    console.log("sortedSites: ", sortedSites);
    res.status(200).json(sortedSites);
  } catch (error) {
    console.error("Error fetching filtered evacuation sites: ", error);
    res
      .status(500)
      .json({ message: "Error fetching filtered evacuation sites" });
  }
}
