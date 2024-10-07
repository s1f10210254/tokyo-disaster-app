import axios from "axios";
import * as cheerio from "cheerio";

export const fetchAndCleanPageText = async (url: string): Promise<string> => {
  try {
    // URLからHTMLを取得
    const { data: html } = await axios.get(url);

    // CheerioでHTMLをパースし、テキストを抽出
    const $ = cheerio.load(html);

    // 不要な要素を削除
    $("script").remove(); // scriptタグを削除
    $("iframe").remove(); // iframeタグを削除
    $("style").remove(); // styleタグを削除
    $("noscript").remove(); // noscriptタグを削除
    $("meta").remove(); // metaタグを削除
    $("link").remove(); // linkタグを削除

    // クリーンなテキストを取得
    const cleanedText = $("body").text().replace(/\s+/g, " ").trim();

    return cleanedText;
  } catch (error) {
    throw new Error(`Failed to fetch or clean page text:`);
  }
};
