import { saveChunksToQdrant } from "@/services/qdrantService";
import { fetchAndCleanPageText } from "@/utils/cheerioParser";
import { urlList } from "@/utils/urlList";

// 最大リトライ回数を設定
const MAX_RETRIES = 3;

export const processUrls = async (
  urls = urlList,
  retries = 0
): Promise<string> => {
  if (urls.length === 0) {
    return "success"; // すべてのURLが処理されて成功
  }

  const [currentUrl, ...remainingUrls] = urls;

  try {
    console.log(`Processing URL: ${currentUrl}`);
    const text = await fetchAndCleanPageText(currentUrl);
    console.log(`Text Fetched Successfully: ${currentUrl}`);
    await saveChunksToQdrant(currentUrl, text, "disaster");
    console.log(`URL Embedded Successfully: ${currentUrl}`);

    // 成功した場合は次のURLを処理
    return await processUrls(remainingUrls);
  } catch (error) {
    console.error(`Error Embedding URL: ${currentUrl}, Retries: ${retries}`);

    // 再試行が最大リトライ回数未満の場合、再試行
    if (retries < MAX_RETRIES) {
      console.log(`Retrying URL: ${currentUrl}, Retry Count: ${retries + 1}`);
      return await processUrls([currentUrl, ...remainingUrls], retries + 1);
    } else {
      console.error(`Max retries reached for URL: ${currentUrl}`);
      // 再試行の最大回数に達した場合は次のURLに進む
      return await processUrls(remainingUrls);
    }
  }
};
