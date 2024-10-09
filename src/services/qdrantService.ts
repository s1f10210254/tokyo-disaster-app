// Qdrantに埋め込みベクトルを保存し、類似検索を行うための関数
import { getEmbedding } from "./openaiEmbedding";
import { client } from "./qdrantClient";
import { splitTextWithLangChain } from "./textSplitter";

export const saveChunksToQdrant = async (
  url: string,
  text: string,
  category: string
) => {
  // Langchainでチャンク分割
  const chunks = await splitTextWithLangChain(text);
  for (const chunk of chunks) {
    console.log("chunk", chunk);
    const embedding = await getEmbedding(chunk);
    // //qdrantにコレクションがなかったら作成
    // try {
    //   await client.createCollection("disaster_info", {
    //     vectors: {
    //       size: embedding.length,
    //       distance: "Cosine",
    //     },
    //   });
    // } catch (error) {
    //   if (error.response?.status === 409) {
    //     console.log("Collection already exists");
    //   } else {
    //     throw error;
    //   }
    // }

    // Qdrantにチャンクごとに保存
    await client.upsert("disaster_info", {
      wait: true,
      points: [
        {
          id: Date.now(),
          vector: embedding,
          payload: { url, text: chunk, category },
        },
      ],
    });
  }
};
