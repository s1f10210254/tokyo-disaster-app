import { generateAnswer } from "@/services/generateAnswer";
import { searchInQdrant } from "@/services/searchService";
import { NextApiRequest, NextApiResponse } from "next";

// テキストを検索して類似データを返す
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { query } = req.body;

    try {
      const searchResults = await searchInQdrant(query);
      // 検索結果からコンテキストを生成
      const context = searchResults
        .map((result) =>
          typeof result.payload?.text === "string" ? result.payload.text : ""
        ) // 文字列かどうかチェック
        .filter((text) => text.trim() !== "") // 空のテキストをフィルタリング
        .join("\n");

      console.log(context);
      // 生成AIで回答を生成
      const answer = await generateAnswer(query, context);
      const references = searchResults.map((result) => ({
        url: result.payload?.url || "N/A", // 参照されたURL
        score: result.score || "N/A", // スコア（精度）
        text: result.payload?.text || "No text available", // 参照されたテキスト
      }));
      res.status(200).json({ answer, references });
    } catch (error) {
      res.status(500).json({ message: "Error Searching Text", error });
    }
  } else {
    res.status(405).json({ message: "POST method only allowed" });
  }
}
