import { getEmbedding } from "@/services/openaiEmbedding";
import { client } from "@/services/qdrantClient";
import { saveChunksToQdrant } from "@/services/qdrantService";
import { fetchAndCleanPageText } from "@/utils/cheerioParser";
import { urlList } from "@/utils/urlList";

// Qdrantにすでに同じデータが存在するかチェックする関数
const checkDuplicateInQdrant = async (
  url: string,
  text: string,
  category: string
): Promise<boolean> => {
  try {
    // URLとカテゴリでフィルタリングしてポイントを検索
    const response = await client.search("disaster_info", {
      vector: await getEmbedding(text), // テキストの埋め込みベクトルを使用して類似検索
      filter: {
        must: [
          { key: "url", match: { value: url } },
          { key: "category", match: { value: category } },
        ],
      },
      limit: 1, // 最も類似した1件を取得
    });

    // 類似結果があり、スコアが高ければ重複とみなす
    if (response && response.length > 0 && response[0].score >= 0.9) {
      // 類似度スコアが0.9以上なら重複と判断
      return true;
    }
    return false;
  } catch (error) {
    console.error(`重複チェック中にエラーが発生しました: ${error}`);
    return false;
  }
};

const checkAndCreateCollection = async (collectionName: string) => {
  try {
    // コレクションが存在するかを確認
    await client.getCollection(collectionName);
    console.log(`コレクション '${collectionName}' は既に存在します。`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      // コレクションが見つからなかった場合は新規作成
      console.log(
        `コレクション '${collectionName}' が見つからないため、新規作成します。`
      );
      try {
        await client.createCollection(collectionName, {
          vectors: {
            size: 1536, // ベクトルの次元数
            distance: "Cosine",
          },
        });
        console.log(`コレクション '${collectionName}' を新規作成しました。`);
      } catch (createError) {
        console.error(
          `コレクションの作成に失敗しました: ${createError.message}`
        );
        throw createError;
      }
    } else {
      console.error(`コレクションの取得に失敗しました: ${error.message}`);
      throw error;
    }
  }
};
const MAX_RETRIES = 3;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const processUrls = async (
  urls = urlList,
  retries = 0
): Promise<string> => {
  if (urls.length === 0) {
    return "すべてのURLの処理が完了しました";
  }

  const [currentUrl, ...remainingUrls] = urls;

  try {
    console.log(`現在処理中のURL: ${currentUrl}`);
    const text = await fetchAndCleanPageText(currentUrl);
    console.log(`テキストの取得に成功しました: ${currentUrl}`);

    // コレクションの存在を確認
    await checkAndCreateCollection("disaster_info");

    // 重複チェックを行う
    const isDuplicate = await checkDuplicateInQdrant(
      currentUrl,
      text,
      "disaster"
    );
    if (isDuplicate) {
      console.log(`重複データのためスキップします: ${currentUrl}`);
      return await processUrls(remainingUrls);
    }

    // Qdrantへの保存を試みる
    await saveChunksToQdrant(currentUrl, text, "disaster");
    console.log(`URLの埋め込みに成功しました: ${currentUrl}`);

    // 成功した場合は次のURLを処理
    return await processUrls(remainingUrls);
  } catch (error) {
    console.error(
      `URLの埋め込みでエラーが発生しました: ${currentUrl}, リトライ回数: ${retries}`
    );
    console.error(`エラー内容: ${error}`);

    // 429エラーの場合は遅延を入れてリトライ
    if (error.response?.status === 429) {
      await delay(5000); // 5秒待機
    }

    // 再試行が最大リトライ回数未満の場合、再試行
    if (retries < MAX_RETRIES) {
      console.log(`再試行中: ${currentUrl}, リトライ回数: ${retries + 1}`);
      return await processUrls([currentUrl, ...remainingUrls], retries + 1);
    } else {
      console.error(`最大リトライ回数に達しました: ${currentUrl}`);
      return await processUrls(remainingUrls);
    }
  }
};
