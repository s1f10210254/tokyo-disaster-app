import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { calculateDistance } from "./evacuationSites";
import { OPENAI_API_KEY, OPENAI_BASE_PATH } from "@/utils/envKey";
import axios from "axios";
const prisma = new PrismaClient();

// 質問から災害タイプをLLMで抽出
const extractDisasterTypeUsingLLM = async (question: string) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await axios.post(
        `${OPENAI_BASE_PATH}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant who identifies disaster types from user queries.",
            },
            {
              role: "user",
              content: `以下の質問に基づいて、関連する災害タイプをJSON形式で返してください。
              対応する災害タイプのリストは以下の通りです：
              - 洪水
              - 崖崩れ
              - 高潮
              - 地震
              - 津波
              - 大火災
              - 内水氾濫
              - 火山現象

              質問：${question}

              出力形式:
              {
                "flood": true/false,
                "landslide": true/false,
                "stormSurge": true/false,
                "earthquake": true/false,
                "tsunami": true/false,
                "largeFire": true/false,
                "inlandFlooding": true/false,
                "volcanicPhenomenon": true/false
              }`,
            },
          ],
          max_tokens: 500,
          temperature: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // LLMの応答からJSON形式の災害タイプを抽出
      const disasterType = JSON.parse(
        response.data.choices[0].message.content.trim()
      );
      return disasterType;
    } catch (error) {
      console.error(`Error in LLM extraction attempt ${attempt + 1}:`, error);
      attempt += 1;

      // リトライが失敗した場合にエラーを再スロー
      if (attempt >= maxRetries) {
        throw new Error(
          "Failed to extract disaster type using LLM after multiple attempts."
        );
      }
    }
  }
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
    // const disasterType = extractDisasterType(question as string);
    console.log("question: ", question);
    const disasterType = await extractDisasterTypeUsingLLM(question as string);
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
