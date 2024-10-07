import { getEmbedding } from "./openaiEmbedding";
import { client } from "./qdrantClient";

export const searchInQdrant = async (query: string) => {
  const embedding = await getEmbedding(query);
  // Qdrantで検索
  const searchResult = await client.search("disaster_info", {
    vector: embedding,
    limit: 20,
  });

  return searchResult;
};
