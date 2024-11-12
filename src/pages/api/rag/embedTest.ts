import { NextApiRequest, NextApiResponse } from "next";
import { client } from "@/services/qdrantClient";
import { chunkText, getEmbedding } from "@/services/openaiEmbedding";
import { v4 as uuidv4 } from "uuid";
import { urlList } from "@/utils/urlList";
import { fetchAndCleanPageText } from "@/utils/cheerioParser";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("embedTest.ts");

  try {
    // コレクションの確認/作成
    const collectionName = "disaster_info";
    // const recreateCollection = async () => {
    //   client.recreateCollection(collectionName, {
    //     vectors: {
    //       size: 1536,
    //       distance: "Cosine",
    //     },
    //   });
    // };
    // await recreateCollection();
    // console.log(`コレクションの確認/作成に成功しました: ${collectionName}`);

    // URLリストからテキストを取得し、Qdrantに保存
    for (const url of urlList) {
      const text = await fetchAndCleanPageText(url);
      const chunkSize = 500;
      const textChunks = chunkText(text, chunkSize);

      for (const chunk of textChunks) {
        const embedding = await getEmbedding(chunk);
        await client.upsert(collectionName, {
          wait: true,
          points: [
            {
              id: uuidv4(),
              vector: embedding,
              payload: { url, text: chunk },
            },
          ],
        });
      }
      console.log(`${url} のデータ保存に成功しました`);

      res.status(200).json({ message: "データの保存に成功しました" });
    }
    console.log("URLリストの処理が完了しました");
  } catch (error) {
    console.error(`URLの処理中にエラーが発生しました:  エラー内容: ${error}`);
    res
      .status(500)
      .json({ message: "処理中にエラーが発生しました", error: error });
  }
};

export default handler;
