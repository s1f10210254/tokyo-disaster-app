import axios from "axios";
import * as cheerio from "cheerio";

// URLからクリーンなテキストを取得する関数
export const fetchAndCleanPageText = async (url: string): Promise<string> => {
  try {
    // URLからHTMLを取得
    const { data: html } = await axios.get(url);

    // CheerioでHTMLをパースし、テキストを抽出
    const $ = cheerio.load(html);

    // 不要な要素を削除
    $("script, style, iframe, noscript, meta, link").remove();

    // ページのメインコンテンツを取得
    const cleanedText = $("body").text().replace(/\s+/g, " ").trim();

    return cleanedText;
  } catch (error) {
    console.error(
      `Failed to fetch or clean page text from URL: ${url}. Error: ${error}`
    );
    throw new Error(`Failed to fetch or clean page text from URL: ${url}`);
  }
};
