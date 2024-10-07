import { saveChunksToQdrant } from "@/services/qdrantService";
import { fetchAndCleanPageText } from "@/utils/cheerioParser";
import { NextApiRequest, NextApiResponse } from "next";

//Urlを入力しその内容をベクトルかしてQdrantに保存
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { url, category } = req.body;
    try {
      // URLからテキストを取得
      const text = await fetchAndCleanPageText(url);

      await saveChunksToQdrant(url, text, category);

      res.status(200).json({ message: "URL Embedded Successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error Embedding URL", error });
    }
  } else {
    res.status(405).json({ message: "POST method only allowed" });
  }
}
