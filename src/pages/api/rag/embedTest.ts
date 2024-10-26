import { NextApiRequest, NextApiResponse } from "next";
import { client } from "@/services/qdrantClient";
import { getEmbedding } from "@/services/openaiEmbedding";
import { fetchAndCleanPageText } from "@/utils/cheerioParser";

const MAX_RETRIES = 3;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  console.log(`現在処理中のURL: ${url}`);

  try {
    const text = await fetchAndCleanPageText(url);
    console.log(`テキストの取得に成功しました: ${url}`);

    const collectionName = "disaster_info";

    // コレクションを自動的に作成する関数
    const createCollectionIfNotExists = async () => {
      try {
        await client.getCollection(collectionName);
        console.log(`コレクション '${collectionName}' は既に存在します。`);
      } catch (error) {
        if (error.message.includes("Not Found")) {
          console.log(
            `コレクション '${collectionName}' が見つからないため、新規作成します。`
          );
          try {
            await client.createCollection(collectionName, {
              vectors: {
                size: 1536, // OpenAIの埋め込みベクトルのサイズ
                distance: "Cosine",
              },
            });
            console.log(
              `コレクション '${collectionName}' を新規作成しました。`
            );
          } catch (createError) {
            console.error(
              `コレクションの作成に失敗しました: ${createError.message}`
            );
            throw createError;
          }
        } else {
          console.error(`コレクションの取得に失敗しました: ${error.message}`);
          throw error;
        }
      }
    };

    // コレクションが存在するか確認、または作成
    await createCollectionIfNotExists();

    // データの保存処理
    const saveDataToQdrant = async (retries = 0) => {
      try {
        const embedding = await getEmbedding(text);
        await client.upsert(collectionName, {
          wait: true,
          points: [
            {
              id: Date.now().toString(),
              vector: embedding,
              payload: { url, text },
            },
          ],
        });
        console.log(`データの保存に成功しました: ${url}`);
        return true;
      } catch (error) {
        console.error(`データの保存に失敗しました: ${error.message}`);
        if (retries < MAX_RETRIES) {
          console.log(`再試行中: ${url}, リトライ回数: ${retries + 1}`);
          return await saveDataToQdrant(retries + 1);
        } else {
          console.error(`最大リトライ回数に達しました: ${url}`);
          throw error;
        }
      }
    };

    // データの保存を試行
    await saveDataToQdrant();

    res.status(200).json({ message: "データの保存に成功しました" });
  } catch (error) {
    console.error(
      `URLの処理中にエラーが発生しました: ${url}, エラー内容: ${error.message}`
    );
    res
      .status(500)
      .json({ message: "処理中にエラーが発生しました", error: error.message });
  }
};

export default handler;
