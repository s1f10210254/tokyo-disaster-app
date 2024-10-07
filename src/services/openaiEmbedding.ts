import { OPENAI_API_KEY } from "@/utils/envKey";
import axios from "axios";

// OPENAIを使って質問やテキストを埋め込みベクトルに変換する関数
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await axios.post(
    `${process.env.OPENAI_BASE_PATH}/embeddings`,
    {
      model: "text-embedding-ada-002",
      input: text,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.data[0].embedding;
}
