import { OPENAI_API_KEY } from "@/utils/envKey";
import axios from "axios";

// テキストを指定の長さでchunk化する関数
export function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  let currentPosition = 0;

  while (currentPosition < text.length) {
    const chunk = text.slice(currentPosition, currentPosition + chunkSize);
    chunks.push(chunk);
    currentPosition += chunkSize;
  }
  return chunks;
}

// OPENAIを使って質問やテキストを埋め込みベクトルに変換する関数
export async function getEmbedding(text: string): Promise<number[]> {
  // error処理を追加
  try {
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
  } catch (error) {
    console.error("Failed to fetch embedding:", error);
    return [];
  }
}
