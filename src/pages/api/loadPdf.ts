import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "@langchain/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // プロジェクトルートからの絶対パスを生成
    const ragPDFPath = path.join(
      process.cwd(),
      "public/pdfs/document_Conan.pdf"
    );

    // ファイルが存在するか確認
    try {
      await fs.access(ragPDFPath);
    } catch (err) {
      return res.status(404).json({ error: "PDF file not found" });
    }

    // PDFLoaderでPDFを読み込み
    const loader = new PDFLoader(ragPDFPath);
    console.log(loader);

    // pdfファイルを500文字ごとに分割
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 500 });
    console.log(textSplitter);
    const docs = await loader.loadAndSplit(textSplitter);
    console.log(docs);

    const embeddings = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log(embeddings);
    const vectorStore = await HNSWLib.fromDocuments(docs, embeddings);
    await vectorStore.save("public/pdfs/MyData");
    res.status(200).json(docs[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error loading PDF" });
  }
}
