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

// Qdrantに保存されたベクトルを類似検索する関数
export const searchSimilarText = async (query: string) => {
  const embedding = await getEmbedding(query);

  // Qdrantに対して類似ベクトルを検索
  const searchResult = await client.search("web_pages", {
    vector: embedding,
    limit: 5, // 類似データ上位5件を取得
  });
  console.log("searchResult", searchResult);
  return searchResult;
};
