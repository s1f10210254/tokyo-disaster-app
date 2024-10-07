import { OPENAI_API_KEY, OPENAI_BASE_PATH } from "@/utils/envKey";
import axios from "axios";

export const generateAnswer = async (query: string, context: string) => {
  try {
    const response = await axios.post(
      `${OPENAI_BASE_PATH}/chat/completions`, // basePathを使用
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: `質問: ${query}\n関連する情報: ${context}\n適切な回答を生成してください。`,
          },
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`, // APIキーも環境変数から取得
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(error);
    return "Error generating answer";
  }
};
