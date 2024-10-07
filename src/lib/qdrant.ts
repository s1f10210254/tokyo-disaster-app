// import { QdrantClient } from "@qdrant/js-client-rest";

// const QDRANT_URL = process.env.QDRANT_URL;
// const client = new QdrantClient({ url: QDRANT_URL });

// // qdrantにEmbeddingしたデータを登録
// export const addVector = async (
//   qdrantPayload: number[][] // 2次元配列で各ベクトルを渡す
// ) => {
//   const vectorSize = qdrantPayload[0].length;

//   // コレクションを作成（存在する場合はスキップ）
//   try {
//     await client.createCollection("test", {
//       vectors: {
//         size: vectorSize,
//         distance: "Cosine",
//       },
//     });
//   } catch (error) {
//     if (error.response?.status === 409) {
//       console.log("Collection already exists");
//     } else {
//       throw error;
//     }
//   }

//   // 各ベクトルをQdrantにアップサート
//   for (let i = 0; i < qdrantPayload.length; i++) {
//     await client.upsert("test", {
//       wait: true,
//       points: [
//         {
//           id: i,
//           vector: qdrantPayload[i], // i番目のベクトル
//           payload: {
//             text: `Document ${i}`,
//           },
//         },
//       ],
//     });
//   }
// };
