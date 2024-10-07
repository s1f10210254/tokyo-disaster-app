import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export const splitTextWithLangChain = async (
  text: string,
  chunkSize: number = 600,
  chunkOverlap: number = 50
) => {
  const textSplitter = new RecursiveCharacterTextSplitter({
    separators: ["。", "、", " ", "\n", "\n\n"],
    chunkSize,
    chunkOverlap,
  });

  // テキストをチャンクに分割
  const chunks = await textSplitter.splitText(text);
  return chunks;
};
