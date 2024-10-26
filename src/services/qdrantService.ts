import { getEmbedding } from "./openaiEmbedding";
import { client } from "./qdrantClient";
import { splitTextWithLangChain } from "./textSplitter";
const ensureCollectionExists = async (collectionName: string) => {
  try {
    await client.getCollection(collectionName);
    console.log(`コレクション '${collectionName}' は既に存在します。`);
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(
        `コレクション '${collectionName}' が存在しないため、新規作成します。`
      );
      await client.createCollection(collectionName, {
        vectors: {
          size: 1536, // 埋め込みベクトルの次元数に応じて設定
          distance: "Cosine",
        },
      });
      console.log(`コレクション '${collectionName}' を新規作成しました。`);
    } else {
      console.error(`コレクションのチェック中にエラーが発生しました: ${error}`);
      throw error;
    }
  }
};

export const saveChunksToQdrant = async (
  url: string,
  text: string,
  category: string
) => {
  try {
    await ensureCollectionExists("disaster_info");
    const chunks = await splitTextWithLangChain(text);

    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      await client.upsert("disaster_info", {
        wait: true,
        points: [
          {
            id: Date.now().toString(),
            vector: embedding,
            payload: { url, text: chunk, category },
          },
        ],
      });
    }
    console.log(`データを保存しました: ${url}`);
  } catch (error) {
    console.error(`データの保存に失敗しました: ${error}`);
    throw error;
  }
};
