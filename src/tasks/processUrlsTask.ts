import { saveChunksToQdrant } from "@/services/qdrantService";
import { fetchAndCleanPageText } from "@/utils/cheerioParser";
import { urlList } from "@/utils/urlList";

export const processUrls = async () => {
  for (const url of urlList) {
    try {
      console.log(`Processing URL: ${url}`);
      const text = await fetchAndCleanPageText(url);
      console.log(`Text Fetched Successfully: ${url}`);
      await saveChunksToQdrant(url, text, "disaster");
      console.log(`URL Embedded Successfully: ${url}`);
    } catch (error) {
      console.error(`Error Embedding URL: ${url}`);
    }
  }
  return "success";
};
